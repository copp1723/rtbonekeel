#!/usr/bin/env python3
"""
Staff Information Extractor

This module extracts staff information from dealership websites using a balanced approach:
1. Focuses on common dealership site structures
2. Uses pattern matching to identify staff sections and relevant data
3. Validates titles to reduce false positives
4. Limits results to a reasonable number to avoid processing non-staff elements
5. Includes confidence scoring to prioritize high-quality results
"""

from bs4 import BeautifulSoup
import re
import time
import random
import uuid
import urllib.parse
from log_manager import get_logger
from error_handler import retry_with_backoff
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

class StaffExtractor:
    def __init__(self, selenium_driver=None, timeout=30):
        """
        Initialize the staff extractor.
        
        Args:
            selenium_driver: An existing Selenium WebDriver instance
            timeout: Timeout for operations in seconds
        """
        self.driver = selenium_driver
        self.timeout = timeout
        self.logger = get_logger('staff_extractor')
        self.extraction_id = str(uuid.uuid4())[:8]  # Short ID for tracking related operations
        
    @retry_with_backoff(max_retries=2, initial_backoff=1)
    def extract_staff(self, url, site_content=None):
        """
        Extract staff information from the given URL.
        
        Args:
            url (str): The dealership website URL
            site_content (str, optional): HTML content if already available
            
        Returns:
            list: List of staff members with their details
        """
        staff_members = []
        domain = self._extract_domain(url)
        
        try:
            self.logger.info(f"[{self.extraction_id}] Extracting staff from: {url}")
            
            # Get the content if not provided
            if not site_content and self.driver:
                # First try the main page
                soup = self._get_page_content(url)
                
                # Look for staff/team/about links
                staff_links = self._find_staff_links(soup, url)
                
                # If we found staff links, visit them
                if staff_links:
                    for staff_link in staff_links[:3]:  # Limit to top 3 most relevant links
                        try:
                            staff_soup = self._get_page_content(staff_link)
                            staff_data = self._extract_staff_from_page(staff_soup, domain)
                            staff_members.extend(staff_data)
                        except Exception as e:
                            self.logger.warning(f"[{self.extraction_id}] Error extracting from staff page {staff_link}: {str(e)}")
                
                # Also extract from the main page as some dealerships list key staff there
                main_page_staff = self._extract_staff_from_page(soup, domain)
                staff_members.extend(main_page_staff)
            elif site_content:
                # Use provided content
                soup = BeautifulSoup(site_content, 'html.parser')
                staff_members = self._extract_staff_from_page(soup, domain)
            else:
                self.logger.error(f"[{self.extraction_id}] No content source available for {url}")
                return []
            
            # Remove duplicates and limit results
            staff_members = self._deduplicate_staff(staff_members)
            staff_members = self._filter_and_limit_staff(staff_members)
            
            self.logger.info(f"[{self.extraction_id}] Successfully extracted {len(staff_members)} staff members from {url}")
            
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting staff from {url}: {str(e)}")
            raise
        
        return staff_members
    
    def _get_page_content(self, url):
        """
        Load a page with WebDriver and return its content as BeautifulSoup.
        """
        if not self.driver:
            self.logger.error(f"[{self.extraction_id}] WebDriver not available")
            return None
        
        try:
            self.logger.info(f"[{self.extraction_id}] Loading page: {url}")
            self.driver.get(url)
            
            # Wait for page to load
            WebDriverWait(self.driver, self.timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Add random delay to appear more human-like
            time.sleep(random.uniform(1, 2))
            
            # Parse the page
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            return soup
            
        except TimeoutException as e:
            self.logger.warning(f"[{self.extraction_id}] Timeout loading {url}: {str(e)}")
            raise
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error loading {url}: {str(e)}")
            raise
    
    def _find_staff_links(self, soup, base_url):
        """
        Find links to staff/team/about pages.
        """
        staff_links = []
        keywords = [
            'staff', 'team', 'about', 'people', 'our team', 'meet', 'employees',
            'sales team', 'meet the team', 'dealership staff', 'management'
        ]
        
        # Find all links
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            text = link.get_text().lower().strip()
            
            # Skip empty links, javascript, and anchors
            if not href or href.startswith('javascript:') or href == '#':
                continue
            
            # Check if the link text or URL contains staff-related keywords
            if any(keyword in text for keyword in keywords) or any(keyword in href.lower() for keyword in keywords):
                # Resolve relative URLs
                full_url = urllib.parse.urljoin(base_url, href)
                staff_links.append(full_url)
        
        return staff_links
    
    def _extract_staff_from_page(self, soup, domain):
        """
        Extract staff information from a page's content.
        """
        staff_members = []
        
        # Patterns for staff elements - look for common dealership site structures
        staff_element_patterns = [
            # Team/staff grid layout
            {'selector': '.team-member, .staff-member, .employee, .team-item, .staff-item, .team-card, .staff-card'},
            {'selector': '[class*="team"], [class*="staff"], [class*="employee"], [class*="people"]'},
            {'selector': '.bio, .profile, .person, .member'},
            {'selector': 'div[itemtype*="Person"], div[itemtype*="Employee"]'}
        ]
        
        # Try each pattern
        for pattern in staff_element_patterns:
            elements = soup.select(pattern['selector'])
            
            for element in elements:
                staff_member = self._parse_staff_element(element, domain)
                if staff_member:
                    staff_members.append(staff_member)
        
        # If we haven't found staff using the structured patterns, try a more general approach
        if not staff_members:
            self.logger.info(f"[{self.extraction_id}] No staff found with standard patterns, trying alternative approach")
            # Look for sections that might contain staff
            potential_sections = []
            
            # Common section identifiers for staff sections
            section_keywords = ['team', 'staff', 'about us', 'meet', 'our people']
            
            # Find headings that might indicate staff sections
            for heading in soup.find_all(['h1', 'h2', 'h3']):
                heading_text = heading.get_text().lower().strip()
                if any(keyword in heading_text for keyword in section_keywords):
                    # Look at the next several elements as potential staff
                    section = heading.parent
                    potential_sections.append(section)
            
            # Process these potential sections
            for section in potential_sections:
                # Look for potential staff elements (paragraphs, divs, etc. with names and contact info)
                for element in section.find_all(['div', 'p', 'li']):
                    # Check if it contains a name-like pattern and contact info
                    text = element.get_text().strip()
                    if re.search(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', text):  # Basic name pattern
                        staff_member = self._extract_from_text(element, domain)
                        if staff_member:
                            staff_members.append(staff_member)
        
        return staff_members
    
    def _parse_staff_element(self, element, domain):
        """
        Parse a staff element to extract name, title, email, phone, etc.
        """
        staff_member = {
            'name': None,
            'title': None,
            'email': None,
            'phone': None,
            'photo_url': None,
            'confidence': 0
        }
        
        # Extract name
        name_elements = element.select('.name, h2, h3, h4, [itemprop="name"], strong')
        for name_el in name_elements:
            name_text = name_el.get_text().strip()
            # Verify it looks like a name
            if re.match(r'^[A-Z][a-z]+(?: [A-Z][a-z]+)+$', name_text):
                staff_member['name'] = name_text
                staff_member['confidence'] += 2  # Good name format
                break
            elif re.match(r'^[A-Z][a-z]+ [A-Z]\.? [A-Z][a-z]+$', name_text):  # Name with middle initial
                staff_member['name'] = name_text
                staff_member['confidence'] += 2
                break
            elif re.match(r'^[A-Z][a-z]+ [A-Z][a-z]+$', name_text):  # Simple FirstName LastName
                staff_member['name'] = name_text
                staff_member['confidence'] += 1
                break
        
        # If no structured name element found, try to infer from content
        if not staff_member['name']:
            text = element.get_text().strip()
            name_match = re.search(r'\b[A-Z][a-z]+(?: [A-Z][a-z]+)+\b', text)
            if name_match:
                staff_member['name'] = name_match.group(0)
                staff_member['confidence'] += 1
        
        # Extract title
        title_elements = element.select('.title, .position, .job-title, [itemprop="jobTitle"], em, .role')
        for title_el in title_elements:
            title = title_el.get_text().strip()
            if title and len(title) < 100:  # Reasonable title length
                staff_member['title'] = title
                
                # Check for management/sales keywords to increase confidence
                title_keywords = [
                    'manager', 'director', 'president', 'owner', 'ceo', 'cfo', 
                    'sales', 'service', 'specialist', 'advisor', 'consultant',
                    'finance', 'general manager', 'gm', 'dealer', 'principal'
                ]
                if any(keyword in title.lower() for keyword in title_keywords):
                    staff_member['confidence'] += 2
                else:
                    staff_member['confidence'] += 1
                break
        
        # If no structured title element found, try to infer from text
        if not staff_member['title'] and staff_member['name']:
            text = element.get_text()
            # Get text after the name
            name_pos = text.find(staff_member['name'])
            if name_pos >= 0:
                text_after = text[name_pos + len(staff_member['name']):].strip()
                # Look for title-like text (not too long, not containing email/phone)
                match = re.search(r'^[,:\s]*([\w\s\-&]+?)[,\n\r]', text_after)
                if match and len(match.group(1).strip()) < 50:
                    staff_member['title'] = match.group(1).strip()
                    staff_member['confidence'] += 0.5
        
        # Extract email
        email_elements = element.select('a[href^="mailto:"], .email, [itemprop="email"]')
        for email_el in email_elements:
            if email_el.has_attr('href') and 'mailto:' in email_el['href']:
                email = email_el['href'].replace('mailto:', '').strip()
                if self._validate_email(email, domain):
                    staff_member['email'] = email
                    staff_member['confidence'] += 3 if domain in email else 2
                    break
            else:
                email_text = email_el.get_text().strip()
                if '@' in email_text and self._validate_email(email_text, domain):
                    staff_member['email'] = email_text
                    staff_member['confidence'] += 3 if domain in email_text else 2
                    break
        
        # If no structured email element, look for email pattern in text
        if not staff_member['email']:
            text = element.get_text()
            email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            emails = re.findall(email_pattern, text)
            for email in emails:
                if self._validate_email(email, domain):
                    staff_member['email'] = email.lower()
                    staff_member['confidence'] += 2 if domain in email else 1
                    break
        
        # Extract phone
        phone_elements = element.select('a[href^="tel:"], .phone, [itemprop="telephone"]')
        for phone_el in phone_elements:
            if phone_el.has_attr('href') and 'tel:' in phone_el['href']:
                phone = phone_el['href'].replace('tel:', '').strip()
                formatted_phone = self._format_phone_number(phone)
                if formatted_phone:
                    staff_member['phone'] = formatted_phone
                    staff_member['confidence'] += 1
                    break
            else:
                phone_text = phone_el.get_text().strip()
                formatted_phone = self._format_phone_number(phone_text)
                if formatted_phone:
                    staff_member['phone'] = formatted_phone
                    staff_member['confidence'] += 1
                    break
        
        # If no structured phone element, look for phone pattern in text
        if not staff_member['phone']:
            text = element.get_text()
            phone_pattern = r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'
            phones = re.findall(phone_pattern, text)
            for phone in phones:
                formatted_phone = self._format_phone_number(phone)
                if formatted_phone:
                    staff_member['phone'] = formatted_phone
                    staff_member['confidence'] += 1
                    break
        
        # Extract photo URL
        img_elements = element.select('img')
        for img in img_elements:
            if img.has_attr('src'):
                img_src = img['src']
                # Avoid common non-photo images
                if not any(keyword in img_src.lower() for keyword in ['icon', 'logo', 'placeholder']):
                    staff_member['photo_url'] = img_src
                    staff_member['confidence'] += 0.5
                    break
        
        # Only return if we have at least a name and either title, email, or phone
        if staff_member['name'] and (staff_member['title'] or staff_member['email'] or staff_member['phone']):
            return staff_member
        return None
    
    def _extract_from_text(self, element, domain):
        """
        Extract staff information from unstructured text.
        """
        text = element.get_text().strip()
        
        # Skip if too short or too long
        if len(text) < 10 or len(text) > 1000:
            return None
        
        staff_member = {
            'name': None,
            'title': None,
            'email': None,
            'phone': None,
            'photo_url': None,
            'confidence': 0
        }
        
        # Try to extract name
        name_match = re.search(r'\b[A-Z][a-z]+(?: [A-Z][a-z]+)+\b', text)
        if name_match:
            staff_member['name'] = name_match.group(0)
            staff_member['confidence'] += 1
        
        # Try to extract email
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, text)
        for email in emails:
            if self._validate_email(email, domain):
                staff_member['email'] = email.lower()
                staff_member['confidence'] += 2 if domain in email else 1
                break
        
        # Try to extract phone
        phone_pattern = r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'
        phones = re.findall(phone_pattern, text)
        for phone in phones:
            formatted_phone = self._format_phone_number(phone)
            if formatted_phone:
                staff_member['phone'] = formatted_phone
                staff_member['confidence'] += 1
                break
        
        # Try to extract title - look for text that might be a title
        if staff_member['name']:
            name_pos = text.find(staff_member['name'])
            if name_pos >= 0:
                text_after = text[name_pos + len(staff_member['name']):].strip()
                text_before = text[:name_pos].strip()
                
                # Try after name first (more common)
                title_match_after = re.search(r'^[,:\s]*([\w\s\-&]+?)[,\n\r]', text_after)
                if title_match_after and len(title_match_after.group(1).strip()) < 50:
                    staff_member['title'] = title_match_after.group(1).strip()
                    staff_member['confidence'] += 0.5
                
                # If not found after, try before name
                if not staff_member['title']:
                    title_match_before = re.search(r'([\w\s\-&]+?)[,\s]*$', text_before)
                    if title_match_before and len(title_match_before.group(1).strip()) < 50:
                        staff_member['title'] = title_match_before.group(1).strip()
                        staff_member['confidence'] += 0.5
        
        # Check for title keywords to increase confidence
        if staff_member['title']:
            title_keywords = [
                'manager', 'director', 'president', 'owner', 'ceo', 'cfo', 
                'sales', 'service', 'specialist', 'advisor', 'consultant',
                'finance', 'general manager', 'gm', 'dealer', 'principal'
            ]
            if any(keyword in staff_member['title'].lower() for keyword in title_keywords):
                staff_member['confidence'] += 1
        
        # Extract photo URL from nearby elements
        img_elements = element.find_all('img')
        for img in img_elements:
            if img.has_attr('src'):
                img_src = img['src']
                if not any(keyword in img_src.lower() for keyword in ['icon', 'logo', 'placeholder']):
                    staff_member['photo_url'] = img_src
                    staff_member['confidence'] += 0.5
                    break
        
        # Only return if we have at least a name and some additional info
        if staff_member['name'] and (staff_member['title'] or staff_member['email'] or staff_member['phone']):
            return staff_member
        return None
    
    def _validate_email(self, email, domain):
        """
        Validate email format and filter out common non-valid patterns.
        Give preference to emails with the dealership domain.
        """
        if not email or '@' not in email:
            return False
            
        # Check for common invalid patterns
        invalid_patterns = [
            'example.com',
            'domain.com',
            'email@example',
            'yourdomain',
            'yourname',
            '@.'
        ]
        
        if any(pattern in email.lower() for pattern in invalid_patterns):
            return False
            
        # Validate basic email format
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_regex, email))
    
    def _format_phone_number(self, phone_tuple_or_string):
        """
        Format phone number consistently.
        """
        # Handle string input
        if isinstance(phone_tuple_or_string, str):
            digits = re.sub(r'[^0-9]', '', phone_tuple_or_string)
            if len(digits) >= 10:
                if len(digits) == 10:
                    return digits
                elif len(digits) == 11 and digits.startswith('1'):
                    return digits[1:]
                else:
                    return digits[-10:]
            return None
        
        # Handle tuple input (from regex)
        if isinstance(phone_tuple_or_string, tuple) and len(phone_tuple_or_string) == 3:
            area_code, prefix, line = phone_tuple_or_string
            
            # Handle missing area code
            if not area_code and prefix and line:
                if len(prefix) == 3 and len(line) == 4:
                    return f"{prefix}{line}"
            
            # Format complete phone number
            if area_code and prefix and line:
                return f"{area_code}{prefix}{line}"
        
        # Handle as raw digits if tuple format doesn't match expectations
        if isinstance(phone_tuple_or_string, tuple):
            raw = ''.join(phone_tuple_or_string)
            if len(raw) >= 10:
                return raw[-10:]
        
        return None
    
    def _extract_domain(self, url):
        """
        Extract the domain from a URL.
        """
        parsed_url = urllib.parse.urlparse(url)
        domain = parsed_url.netloc
        # Remove www. prefix if present
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    
    def _deduplicate_staff(self, staff_members):
        """
        Remove duplicate staff members.
        """
        unique_staff = []
        seen_names = set()
        seen_emails = set()
        
        for staff in staff_members:
            if staff['email'] and staff['email'] in seen_emails:
                continue
            
            if staff['name'] and staff['name'] in seen_names:
                # Possible duplicate, merge with highest confidence or most complete data
                for i, existing in enumerate(unique_staff):
                    if existing['name'] == staff['name']:
                        # If new record has higher confidence, replace the existing one
                        if staff['confidence'] > existing['confidence']:
                            unique_staff[i] = staff
                        # Otherwise, fill in missing data from the new record
                        else:
                            for field in ['email', 'phone', 'title', 'photo_url']:
                                if not existing[field] and staff[field]:
                                    existing[field] = staff[field]
                                    existing['confidence'] += 0.5
                        break
                continue
            
            if staff['name']:
                seen_names.add(staff['name'])
            if staff['email']:
                seen_emails.add(staff['email'])
            
            unique_staff.append(staff)
        
        return unique_staff
    
    def _filter_and_limit_staff(self, staff_members):
        """
        Filter low-confidence staff and limit to a reasonable number.
        """
        # Sort by confidence score
        sorted_staff = sorted(staff_members, key=lambda x: x['confidence'], reverse=True)
        
        # Filter by minimum confidence
        filtered_staff = [staff for staff in sorted_staff if staff['confidence'] >= 2]
        
        # Validate and categorize staff by role
        validated_staff = [self._validate_staff_member(member) for member in filtered_staff]
        
        # Limit to maximum 20 staff members
        limited_staff = validated_staff[:20]
        
        return limited_staff
        
    def _validate_staff_member(self, staff_member):
        """
        Validate and enrich staff information with role categorization.
        
        Categorizes staff roles as:
        - management: For executives, managers, owners, etc.
        - sales: For sales staff
        - service: For service department staff
        - general: For other staff types
        
        Args:
            staff_member (dict): Staff member data
            
        Returns:
            dict: Enhanced staff member data with role category
        """
        # Create a copy of the staff member to avoid modifying the original
        enhanced_member = staff_member.copy()
        
        # Default role category
        enhanced_member['role_category'] = 'general'
        
        # Check for role in title if available
        if enhanced_member.get('title'):
            title = enhanced_member['title'].lower()
            
            # Management roles
            management_keywords = [
                'president', 'ceo', 'cfo', 'coo', 'owner', 'partner', 
                'general manager', 'gm', 'director', 'executive', 'principal',
                'vp', 'vice president', 'chief', 'head', 'founder'
            ]
            
            # Sales roles
            sales_keywords = [
                'sales', 'salesperson', 'salesman', 'saleswoman', 'lease', 
                'finance', 'f&i', 'business manager', 'internet sales'
            ]
            
            # Service roles
            service_keywords = [
                'service', 'technician', 'mechanic', 'parts', 'maintenance',
                'advisor', 'repair', 'warranty'
            ]
            
            # Assign category based on keywords in title
            if any(keyword in title for keyword in management_keywords):
                enhanced_member['role_category'] = 'management'
            elif any(keyword in title for keyword in sales_keywords):
                enhanced_member['role_category'] = 'sales'
            elif any(keyword in title for keyword in service_keywords):
                enhanced_member['role_category'] = 'service'
        
        # Apply priority scores for sorting staff by importance
        if enhanced_member['role_category'] == 'management':
            enhanced_member['priority'] = 3
        elif enhanced_member['role_category'] == 'sales':
            enhanced_member['priority'] = 2
        elif enhanced_member['role_category'] == 'service':
            enhanced_member['priority'] = 1
        else:
            enhanced_member['priority'] = 0
            
        return enhanced_member

# Example usage
if __name__ == "__main__":
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    import json
    import argparse
    
    parser = argparse.ArgumentParser(description='Extract staff information from a dealership website')
    parser.add_argument('url', help='URL to extract staff information from')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode')
    args = parser.parse_args()
    
    # Setup Chrome options
    chrome_options = Options()
    if args.headless:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    # Initialize WebDriver
    from webdriver_manager.chrome import ChromeDriverManager
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        # Initialize and run extractor
        extractor = StaffExtractor(selenium_driver=driver)
        staff_info = extractor.extract_staff(args.url)
        print(json.dumps(staff_info, indent=2))
    finally:
        # Clean up
        driver.quit()