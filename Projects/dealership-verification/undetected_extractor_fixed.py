#\!/usr/bin/env python3
"""
Undetected Contact Extractor

Uses undetected-chromedriver to bypass anti-bot detection mechanisms
while extracting contact information from dealership websites.
"""

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
from bs4 import BeautifulSoup
import re
import time
import os
import random
import uuid
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("undetected_extractor")

class UndetectedExtractor:
    """
    Contact extractor using undetected-chromedriver to bypass anti-bot detection.
    This class follows the same interface as the original ContactExtractor.
    """
    
    def __init__(self, headless=True, timeout=30):
        self.timeout = timeout
        self.headless = headless
        self.logger = logger
        self.extraction_id = str(uuid.uuid4())[:8]  # Short ID for tracking
        self.setup_driver()
    
    def setup_driver(self):
        """Initialize the undetected Chrome WebDriver"""
        try:
            # Create options
            options = uc.ChromeOptions()
            
            # Configure headless mode
            if self.headless:
                options.add_argument('--headless=new')  # New headless implementation
            
            # Set additional options to improve reliability
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')  # Useful for Docker environments
            options.add_argument('--disable-gpu')  # Needed for some headless scenarios
            
            # Add anti-detection measures (less needed with undetected-chromedriver, but still helpful)
            options.add_argument('--disable-blink-features=AutomationControlled')
            
            # Random user agent
            user_agents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            ]
            options.add_argument(f'--user-agent={random.choice(user_agents)}')
            
            # Initialize the undetected chrome driver
            self.driver = uc.Chrome(options=options)
            self.driver.set_page_load_timeout(self.timeout)
            
            self.logger.info(f"[{self.extraction_id}] Undetected ChromeDriver initialized successfully")
            return True
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Failed to initialize Undetected ChromeDriver: {str(e)}")
            raise
    
    def extract_contacts(self, url):
        """Extract contact information from the given URL"""
        contacts = {
            'emails': [],
            'phones': [],
            'address': None
        }
        
        try:
            self.logger.info(f"[{self.extraction_id}] Attempting to extract contacts from: {url}")
            
            # Add jitter to timing to appear more human-like
            time.sleep(random.uniform(0.5, 1.5))
            
            # Load the page
            self._load_page(url)
            
            # Random pause to simulate human browsing
            time.sleep(random.uniform(1, 2))
            
            # Get page source and create BeautifulSoup object
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            # Extract emails
            emails = self._extract_emails(soup)
            if emails:
                contacts['emails'] = emails
            
            # Extract phone numbers
            phones = self._extract_phones(soup)
            if phones:
                contacts['phones'] = phones
            
            # Extract address
            address = self._extract_address(soup)
            if address:
                contacts['address'] = address
            
            # If we don't have much information, try to follow contact links
            if not (contacts['emails'] and contacts['phones'] and contacts['address']):
                self._follow_contact_links()
                
                # Get updated page source
                soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                
                # Extract again
                if not contacts['emails']:
                    contacts['emails'] = self._extract_emails(soup)
                
                if not contacts['phones']:
                    contacts['phones'] = self._extract_phones(soup)
                
                if not contacts['address']:
                    contacts['address'] = self._extract_address(soup)
            
            self.logger.info(f"[{self.extraction_id}] Successfully extracted contacts from {url}")
            
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting contacts from {url}: {str(e)}")
            raise
        
        return contacts
    
    def _load_page(self, url):
        """Load a page with proper error handling"""
        try:
            self.driver.get(url)
            
            # Wait for page to load
            WebDriverWait(self.driver, self.timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check for common blocking scenarios
            if any(text in self.driver.page_source.lower() for text in [
                'access denied', 'captcha', 'blocked', 'security check'
            ]):
                self.logger.warning(f"[{self.extraction_id}] Possible blocking detected on {url}")
                # Allow an extra pause to potentially bypass simple timing-based blocks
                time.sleep(random.uniform(3, 5))
            
            return True
            
        except Exception as e:
            self.logger.warning(f"[{self.extraction_id}] Error loading {url}: {str(e)}")
            raise
    
    def _follow_contact_links(self):
        """Find and follow contact page links"""
        try:
            # Find contact links
            contact_keywords = ['contact', 'about', 'locations', 'find us', 'directions']
            links = self.driver.find_elements(By.TAG_NAME, "a")
            
            for link in links:
                try:
                    link_text = link.text.lower()
                    link_href = link.get_attribute("href") or ""
                    
                    # Check if any of the contact keywords are in the link text or href
                    if any(keyword in link_text or keyword in link_href.lower() for keyword in contact_keywords):
                        self.logger.info(f"[{self.extraction_id}] Following contact link: {link_href}")
                        
                        # Open in new tab and switch to it
                        self.driver.execute_script("window.open(arguments[0]);", link_href)
                        self.driver.switch_to.window(self.driver.window_handles[-1])
                        
                        # Wait for page to load
                        WebDriverWait(self.driver, self.timeout).until(
                            EC.presence_of_element_located((By.TAG_NAME, "body"))
                        )
                        
                        # Random pause to simulate human browsing
                        time.sleep(random.uniform(1, 2))
                        
                        return True
                except Exception as e:
                    # Continue to next link if there's an issue with this one
                    continue
            
            return False
            
        except Exception as e:
            self.logger.warning(f"[{self.extraction_id}] Error following contact links: {str(e)}")
            return False
    
    def _extract_emails(self, soup):
        """Extract email addresses from the page"""
        emails = set()
        
        try:
            # Email regex pattern
            email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            
            # Look for emails in text content
            for element in soup.find_all(string=re.compile(email_pattern)):
                found_emails = re.findall(email_pattern, element.strip())
                for email in found_emails:
                    if self._validate_email(email):
                        emails.add(email.lower())
            
            # Look for mailto links
            for link in soup.find_all('a', href=re.compile(r'mailto:')):
                email = link['href'].replace('mailto:', '').strip()
                if re.match(email_pattern, email) and self._validate_email(email):
                    emails.add(email.lower())
            
            # Look for emails in data attributes
            for element in soup.find_all(attrs={"data-email": True}):
                email = element.get("data-email")
                if self._validate_email(email):
                    emails.add(email.lower())
                    
            # Check for a specific case: reversed emails in scripts
            for script in soup.find_all("script"):
                if script.string and "mail" in script.string.lower():
                    matches = re.findall(r'[\'"]([-_.a-zA-Z0-9@]+)[\'"].+?reverse\(\)', str(script.string))
                    for match in matches:
                        reversed_email = match[::-1]
                        if '@' in reversed_email and self._validate_email(reversed_email):
                            emails.add(reversed_email.lower())
        
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting emails: {str(e)}")
        
        return list(emails)
    
    def _validate_email(self, email):
        """Validate email format and filter out common non-valid patterns"""
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
    
    def _extract_phones(self, soup):
        """Extract phone numbers from the page"""
        phones = set()
        
        try:
            # Phone regex pattern for North American numbers
            phone_pattern = r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'
            
            # Look for phone numbers in text content
            for element in soup.find_all(string=re.compile(phone_pattern)):
                text = element.strip()
                found_phones = re.findall(phone_pattern, text)
                for phone in found_phones:
                    # Format phone number consistently
                    formatted_phone = self._format_phone_number(phone)
                    if formatted_phone:
                        phones.add(formatted_phone)
            
            # Look for tel: links
            for link in soup.find_all('a', href=re.compile(r'tel:')):
                phone = link['href'].replace('tel:', '').strip()
                # Extract digits only
                digits = re.sub(r'[^0-9]', '', phone)
                if len(digits) >= 10:
                    # Format the phone number
                    if len(digits) == 10:
                        formatted = digits
                    elif len(digits) == 11 and digits.startswith('1'):
                        formatted = digits[1:]
                    else:
                        formatted = digits[-10:]
                    
                    phones.add(formatted)
        
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting phone numbers: {str(e)}")
        
        return list(phones)
    
    def _format_phone_number(self, phone_tuple):
        """Format phone number tuples consistently"""
        # Extract area code, prefix, and line number from tuple
        if len(phone_tuple) == 3:
            area_code, prefix, line = phone_tuple
            
            # Handle missing area code
            if not area_code and prefix and line:
                if len(prefix) == 3 and len(line) == 4:
                    return f"{prefix}{line}"
            
            # Format complete phone number
            if area_code and prefix and line:
                return f"{area_code}{prefix}{line}"
        
        # Handle as raw digits if tuple format doesn't match expectations
        raw = ''.join(phone_tuple)
        if len(raw) >= 10:
            return raw[-10:]
            
        return None
    
    def _extract_address(self, soup):
        """Extract physical address from the page"""
        try:
            # Common address patterns
            address_keywords = ['address', 'location', 'directions', 'find us', 'visit us']
            state_pattern = r'\b[A-Z]{2}\b'
            zip_pattern = r'\b\d{5}(?:-\d{4})?\b'
            
            # First check for structured address data
            address_elements = soup.find_all(['div', 'p', 'span'], 
                                         class_=lambda c: c and any(k in c.lower() for k in ['address', 'location']))
            
            for elem in address_elements:
                text = elem.get_text()
                if re.search(state_pattern, text) and re.search(zip_pattern, text):
                    return self._clean_address(text)
            
            # Look for schema.org address markup
            address_schema = soup.find('div', {'itemtype': 'http://schema.org/PostalAddress'})
            if address_schema:
                street = address_schema.find('span', {'itemprop': 'streetAddress'})
                city = address_schema.find('span', {'itemprop': 'addressLocality'})
                state = address_schema.find('span', {'itemprop': 'addressRegion'})
                zip_code = address_schema.find('span', {'itemprop': 'postalCode'})
                
                address_parts = []
                if street and street.text:
                    address_parts.append(street.text.strip())
                if city and city.text:
                    address_parts.append(city.text.strip())
                if state and state.text:
                    address_parts.append(state.text.strip())
                if zip_code and zip_code.text:
                    address_parts.append(zip_code.text.strip())
                    
                if address_parts:
                    return ', '.join(address_parts)
            
            # Look for elements containing address information
            for keyword in address_keywords:
                elements = soup.find_all(string=re.compile(keyword, re.IGNORECASE))
                for element in elements:
                    parent = element.parent
                    if parent:
                        # Look for nearby elements that might contain the address
                        container = parent.parent if parent.parent else parent
                        text = container.get_text()
                        
                        # Look for text containing state abbreviation and zip code
                        if re.search(state_pattern, text) and re.search(zip_pattern, text):
                            return self._clean_address(text)
            
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting address: {str(e)}")
        
        return None
    
    def _clean_address(self, text):
        """Clean and format extracted address text"""
        # Remove extra whitespace and line breaks
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove common non-address content
        text = re.sub(r'(?i)(address|location|directions|find us|hours|email).*?:', '', text)
        
        # Limit to reasonable length for an address
        if len(text) > 200:
            # Try to extract just the address portion with state and zip
            state_zip_match = re.search(r'\b[A-Z]{2}\b.*?\b\d{5}(?:-\d{4})?\b', text)
            if state_zip_match:
                # Get the portion of text around the state/zip
                match_index = state_zip_match.start()
                start_index = max(0, match_index - 100)
                end_index = min(len(text), match_index + 100)
                text = text[start_index:end_index]
            else:
                # Just truncate if we can't find a good anchor
                text = text[:200]
        
        return text.strip()
    
    def cleanup(self):
        """Clean up resources"""
        if hasattr(self, 'driver'):
            try:
                self.driver.quit()
                self.logger.info(f"[{self.extraction_id}] Undetected ChromeDriver cleaned up")
            except Exception as e:
                self.logger.error(f"[{self.extraction_id}] Error cleaning up Undetected ChromeDriver: {str(e)}")


# Example usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python undetected_extractor.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    extractor = UndetectedExtractor(headless=True)
    
    try:
        contacts = extractor.extract_contacts(url)
        print("\nExtracted Contacts:")
        print(f"Emails: {contacts['emails']}")
        print(f"Phones: {contacts['phones']}")
        print(f"Address: {contacts['address']}")
    finally:
        extractor.cleanup()
