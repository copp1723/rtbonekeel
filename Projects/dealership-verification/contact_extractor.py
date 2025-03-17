from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
from bs4 import BeautifulSoup
import re
import time
import os
import random
from functools import wraps
import uuid
import urllib.parse
import logging

# Import new modules for improved error handling and logging
from log_manager import get_logger, with_logging
from error_handler import (
    retry_with_backoff,
    ResourceGuard,
    safe_cleanup_webdriver,
    handle_network_error
)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("contact_extractor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("contact_extractor")

# Add ContactUtils class for email extraction
class ContactUtils:
    @staticmethod
    def extract_emails_from_text(text):
        """Extract email addresses from text using regex pattern"""
        if not text:
            return []
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        return re.findall(email_pattern, text)

class ContactExtractor:
    def __init__(self, headless=True, timeout=30, debug=False):
        # Initialize extraction_id before any operations that might need it
        self.extraction_id = str(uuid.uuid4())  # Unique ID for tracking
        self.timeout = timeout
        self.headless = headless
        self.debug = debug
        self.logger = get_logger('contact_extractor')
        self.setup_chrome_options(headless)
        self.setup_driver()
        # Initialize collections for contact information
        self.emails = set()
        self.phones = set()
        self.address = None
        # Email regex pattern
        self.email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        # Phone regex pattern
        self.phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        # Email me text variations
        self.email_me_patterns = [
            "email me", 
            "send email", 
            "email", 
            "message me",
            "contact me",
            "send message"
        ]
        # Initialize extraction statistics
        self.stats = {
            "emails_found": 0,
            "mailto_links": 0,
            "email_me_text": 0,
            "js_events": 0,
            "raw_text": 0
        }
        logger.info("ContactExtractor initialized with enhanced capabilities")
    
    def setup_chrome_options(self, headless=True):
        """Configure Chrome options for PythonAnywhere compatibility with anti-blocking enhancements"""
        self.chrome_options = Options()
        if headless:
            self.chrome_options.add_argument('--headless')
        
        # PythonAnywhere-specific options
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--disable-software-rasterizer')
        self.chrome_options.add_argument('--disable-extensions')
        self.chrome_options.add_argument('--disable-infobars')
        
        # Anti-blocking measures - randomized user agent
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
        ]
        self.chrome_options.add_argument(f'--user-agent={random.choice(user_agents)}')
        
        # Additional anti-detection measures
        self.chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        self.chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
        self.chrome_options.add_experimental_option('useAutomationExtension', False)

    @retry_with_backoff(max_retries=2, initial_backoff=2)
    def setup_driver(self):
        """Initialize the Chrome WebDriver with improved error recovery"""
        try:
            # Prefer system chromedriver path if available
            chrome_driver_path = '/usr/bin/chromedriver'
            if os.path.exists(chrome_driver_path):
                service = Service(chrome_driver_path)
            else:
                # Local development fallback: use webdriver_manager to get chromedriver path
                from webdriver_manager.chrome import ChromeDriverManager
                driver_path = ChromeDriverManager().install()
                # If driver_path points to a THIRD_PARTY_NOTICES file, switch to the actual chromedriver binary
                if 'THIRD_PARTY_NOTICES.chromedriver' in driver_path:
                    parent_dir = os.path.dirname(driver_path)
                    alternative_path = os.path.join(parent_dir, 'chromedriver')
                    if os.path.exists(alternative_path):
                        driver_path = alternative_path
                service = Service(driver_path)
            
            self.driver = webdriver.Chrome(service=service, options=self.chrome_options)
            self.driver.set_page_load_timeout(self.timeout)
            
            # Set custom properties to mask automation
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            self.logger.info(f"[{self.extraction_id}] Chrome WebDriver initialized successfully")
            return True
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Failed to initialize Chrome WebDriver: {str(e)}")
            raise

    @retry_with_backoff(max_retries=3, initial_backoff=2)
    def extract_contacts(self, url):
        """Extract contact information from the given URL with improved error handling"""
        # Reset instance collections
        self.emails = set()
        self.phones = set()
        self.address = None
        
        contacts = {
            'emails': set(),
            'phones': set(),
            'address': None
        }
        
        # Create a resource guard for the driver to ensure cleanup
        with ResourceGuard(cleanup_func=lambda resources: self.cleanup()):
            try:
                self.logger.info(f"[{self.extraction_id}] Attempting to extract contacts from: {url}")
                
                # Add jitter to timing to appear more human-like
                time.sleep(random.uniform(0.5, 1.5))
                
                # Load the page with retry capability
                self._load_page_with_retry(url)
                
                # Random pause to simulate human browsing
                time.sleep(random.uniform(2, 4))
                
                # Get page source and create BeautifulSoup object
                soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                
                # Extract emails
                self._extract_emails(soup, contacts)
                
                # Extract phone numbers
                self._extract_phones(soup, contacts)
                
                # Extract address
                self._extract_address(soup, contacts)
                
                # Transfer emails from instance variable to contacts dictionary
                if self.emails:
                    contacts['emails'].update(self.emails)
                
                # Validate extracted data
                self._validate_contact_data(contacts)
                
                self.logger.info(f"[{self.extraction_id}] Successfully extracted contacts from {url}")
                
            except TimeoutException as e:
                self.logger.error(f"[{self.extraction_id}] Timeout while loading {url}: {str(e)}")
                raise
            except WebDriverException as e:
                self.logger.error(f"[{self.extraction_id}] WebDriver error for {url}: {str(e)}")
                raise
            except Exception as e:
                self.logger.error(f"[{self.extraction_id}] Unexpected error while extracting contacts from {url}: {str(e)}")
                raise
        
        return {
            'emails': list(contacts['emails']),
            'phones': list(contacts['phones']),
            'address': contacts['address']
        }

    @retry_with_backoff(max_retries=2, initial_backoff=1)
    def _load_page_with_retry(self, url):
        """Load a page with retry logic and proper error handling"""
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
                
                # If we still see blocking indicators, raise an exception
                if any(text in self.driver.page_source.lower() for text in [
                    'access denied', 'captcha', 'blocked', 'security check'
                ]):
                    raise WebDriverException("Detected anti-scraping measures")
                    
            return True
            
        except TimeoutException as e:
            self.logger.warning(f"[{self.extraction_id}] Timeout while loading {url}, retrying: {str(e)}")
            raise
        except WebDriverException as e:
            self.logger.warning(f"[{self.extraction_id}] WebDriver error for {url}, retrying: {str(e)}")
            raise

    def _extract_emails(self, soup, contacts):
        """Extract email addresses from the page"""
        try:
            # Enhanced email pattern with validation
            email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            
            # Look for emails in text content
            for element in soup.find_all(string=re.compile(email_pattern)):
                emails = re.findall(email_pattern, element.strip())
                for email in emails:
                    if self._validate_email(email):
                        contacts['emails'].add(email.lower())
            
            # Look for mailto links
            for link in soup.find_all('a', href=re.compile(r'mailto:')):
                email = link['href'].replace('mailto:', '').strip()
                # Add URL decoding to handle encoded characters in email addresses
                email = urllib.parse.unquote(email)
                if re.match(email_pattern, email) and self._validate_email(email):
                    contacts['emails'].add(email.lower())
                    
            # Look for obfuscated emails (common technique to hide from scrapers)
            self._extract_obfuscated_emails(soup, contacts)
            
            # Extract from DOM elements using Selenium
            if hasattr(self, 'driver') and self.driver:
                self._extract_from_dom_elements()
            
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting emails: {str(e)}")

    def _extract_obfuscated_emails(self, soup, contacts):
        """Extract emails that might be obfuscated to avoid scrapers"""
        try:
            # Check for emails in data attributes
            for element in soup.find_all(attrs={"data-email": True}):
                email = element.get("data-email")
                if self._validate_email(email):
                    contacts['emails'].add(email.lower())
                    
            # Check for reversed emails
            for script in soup.find_all("script"):
                if script.string and "mail" in script.string.lower():
                    # Look for patterns like: '".moc.elpmaxe@olleh".split("").reverse().join("")'
                    matches = re.findall(r'[\'"]([-_.a-zA-Z0-9@]+)[\'"].+?reverse\(\)', str(script.string))
                    for match in matches:
                        reversed_email = match[::-1]
                        if '@' in reversed_email and self._validate_email(reversed_email):
                            contacts['emails'].add(reversed_email.lower())
                            
            # Check for emails with HTML entity encoding
            for element in soup.find_all(string=re.compile(r'&#[0-9]+;')):
                text = element.strip()
                # Convert HTML entities to characters
                decoded = re.sub(r'&#([0-9]+);', lambda m: chr(int(m.group(1))), text)
                if '@' in decoded:
                    emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', decoded)
                    for email in emails:
                        if self._validate_email(email):
                            contacts['emails'].add(email.lower())
                            
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting obfuscated emails: {str(e)}")

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

    def _extract_phones(self, soup, contacts):
        """Extract phone numbers from the page with improved validation"""
        try:
            # Enhanced phone pattern for North American numbers
            phone_pattern = r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'
            
            # Look for phone numbers in text content
            for element in soup.find_all(string=re.compile(phone_pattern)):
                text = element.strip()
                phones = re.findall(phone_pattern, text)
                for phone in phones:
                    # Format phone number consistently
                    formatted_phone = self._format_phone_number(phone)
                    if formatted_phone:
                        contacts['phones'].add(formatted_phone)
            
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
                    
                    contacts['phones'].add(formatted)
                    
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting phone numbers: {str(e)}")

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

    def _extract_address(self, soup, contacts):
        """Extract physical address from the page with improved pattern matching"""
        try:
            # Common address patterns
            address_keywords = ['address', 'location', 'directions', 'find us', 'visit us', 'our dealership']
            state_pattern = r'\b[A-Z]{2}\b'
            zip_pattern = r'\b\d{5}(?:-\d{4})?\b'
            
            # First check for structured address data
            address_elements = soup.find_all(['div', 'p', 'span'], 
                                           class_=lambda c: c and any(k in c.lower() for k in ['address', 'location']))
            
            for elem in address_elements:
                text = elem.get_text()
                if re.search(state_pattern, text) and re.search(zip_pattern, text):
                    contacts['address'] = self._clean_address(text)
                    return
            
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
                            contacts['address'] = self._clean_address(text)
                            return
                        
            # If we still don't have an address, look for schema.org address markup
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
                    contacts['address'] = ', '.join(address_parts)
                    
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting address: {str(e)}")

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

    def _validate_contact_data(self, contacts):
        """Validate and filter extracted contact data"""
        # Filter out invalid emails
        contacts['emails'] = {email for email in contacts['emails'] if self._validate_email(email)}
        
        # Filter phone numbers (must be 10 or 11 digits)
        pattern = r'^\d{10,11}$'
        contacts['phones'] = {phone for phone in contacts['phones'] if phone and re.match(pattern, phone)}
        
        # Check if address looks valid (contains state code and zip)
        if contacts['address']:
            if not re.search(r'\b[A-Z]{2}\b.*?\b\d{5}(?:-\d{4})?\b', contacts['address']):
                contacts['address'] = None

    def cleanup(self):
        """Clean up resources with improved error handling"""
        safe_cleanup_webdriver(getattr(self, 'driver', None))
        self.logger.info(f"[{self.extraction_id}] Chrome WebDriver cleaned up")

    def _get_following_sibling(self, element):
        """Helper function to get the immediately following sibling element"""
        try:
            return element.find_element(By.XPATH, "./following-sibling::*[1]") # *[1] gets the first following sibling
        except NoSuchElementException:
            return None

    def _extract_from_dom_elements(self):
        """Extract email addresses from DOM elements using Selenium"""
        try:
            # Find mailto links
            mailto_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, 'mailto:')]")
            for link in mailto_links:
                try:
                    href = link.get_attribute('href')
                    if href and 'mailto:' in href:
                        email = href.replace('mailto:', '').strip()
                        # Add URL decoding to handle encoded characters in email addresses
                        email = urllib.parse.unquote(email)
                        if self._validate_email(email):
                            self.emails.add(self._clean_email(email))
                except Exception as e:
                    self.logger.debug(f"Error processing mailto link: {str(e)}")
                    continue
            
            # --- "Email Me" Text Recognition ---
            email_prompt_phrases = [
                "Email me", "Email us", "Contact us by email", "Email for more info",
                "Email our team", "Send us an email", " вопросам пишите" # Example phrase in Russian, you can add more languages
            ]

            for phrase in email_prompt_phrases:
                # Find elements containing the phrase (case-insensitive)
                xpath_selector = f"//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{phrase.lower()}')]"
                prompt_elements = self.driver.find_elements(By.XPATH, xpath_selector)

                for prompt_element in prompt_elements:
                    try:
                        # --- Search for emails in the SAME element ---
                        element_text = prompt_element.text
                        emails_in_element = ContactUtils.extract_emails_from_text(element_text)
                        if emails_in_element:
                            for email in emails_in_element:
                                self.emails.add(self._clean_email(email))
                            continue  # Found emails in the prompt element itself, move to next prompt phrase

                        # --- Search for emails in the IMMEDIATELY FOLLOWING SIBLING element ---
                        following_sibling = self._get_following_sibling(prompt_element) # Helper function (see below)
                        if following_sibling:
                            sibling_text = following_sibling.text
                            emails_in_sibling = ContactUtils.extract_emails_from_text(sibling_text)
                            if emails_in_sibling:
                                for email in emails_in_sibling:
                                    self.emails.add(self._clean_email(email))
                                continue  # Found emails in sibling, move to next prompt phrase

                        # --- You could expand to check parent elements or more siblings if needed later ---

                    except Exception as e:
                        self.logger.debug(f"Error processing 'Email Me' prompt element: {str(e)}")
                        continue
                        
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error extracting from DOM elements: {str(e)}")

    def _clean_email(self, email):
        """Clean and format email address"""
        if not email:
            return None
        return email.lower().strip()

    def extract_emails_from_page(self, driver, soup=None):
        """Extract emails using multiple methods"""
        if soup is None:
            page_source = driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
        
        emails = set()
        
        logger.info("Starting email extraction process")
        
        # Method 1: Extract emails from mailto links
        mailto_emails = self._extract_emails_from_mailto(soup)
        emails.update(mailto_emails)
        
        # Method 2: Extract emails from "Email Me" text
        email_me_emails = self._extract_emails_from_email_me_text(soup)
        emails.update(email_me_emails)
        
        # Method 3: Extract emails from JavaScript event handlers
        js_emails = self._extract_emails_from_js_events(driver, soup)
        emails.update(js_emails)
        
        # Method 4: Extract emails from raw text
        raw_emails = self._extract_emails_from_raw_text(soup)
        emails.update(raw_emails)
        
        logger.info(f"Total unique emails found: {len(emails)}")
        logger.info(f"Extraction stats: {self.stats}")
        
        return list(emails)

    def _extract_emails_from_mailto(self, soup):
        """Extract emails from mailto: links"""
        logger.debug("Extracting emails from mailto links")
        emails = set()
        
        # Find all anchor tags with mailto: links
        mailto_links = soup.find_all('a', href=lambda href: href and href.startswith('mailto:'))
        
        for link in mailto_links:
            href = link.get('href', '')
            # Extract email from mailto: link and decode URL encoding
            email = href.replace('mailto:', '', 1).split('?')[0].strip()
            email = urllib.parse.unquote(email)
            
            if email and re.match(self.email_pattern, email):
                emails.add(email)
                logger.debug(f"Found email from mailto: {email}")
                self.stats["mailto_links"] += 1
        
        logger.info(f"Found {len(emails)} emails from mailto links")
        self.stats["emails_found"] += len(emails)
        return emails

    def _extract_emails_from_email_me_text(self, soup):
        """Extract emails associated with 'Email Me' text"""
        logger.debug("Extracting emails from 'Email Me' text")
        emails = set()
        
        # Create a case-insensitive pattern for email me variations
        pattern = '|'.join(self.email_me_patterns)
        email_me_elements = soup.find_all(string=re.compile(pattern, re.IGNORECASE))
        
        for element in email_me_elements:
            # Check parent element for email
            parent = element.parent
            
            # Check href attribute if parent is a link
            if parent.name == 'a' and parent.get('href', '').startswith('mailto:'):
                href = parent.get('href', '')
                email = href.replace('mailto:', '', 1).split('?')[0].strip()
                email = urllib.parse.unquote(email)
                
                if email and re.match(self.email_pattern, email):
                    emails.add(email)
                    logger.debug(f"Found email from 'Email Me' text in href: {email}")
                    self.stats["email_me_text"] += 1
            
            # Check for email in surrounding text (parent's text or siblings)
            surrounding_text = parent.get_text() if parent else ""
            email_matches = re.findall(self.email_pattern, surrounding_text)
            
            for email in email_matches:
                if email:
                    emails.add(email)
                    logger.debug(f"Found email near 'Email Me' text: {email}")
                    self.stats["email_me_text"] += 1
        
        logger.info(f"Found {len(emails)} emails from 'Email Me' text")
        self.stats["emails_found"] += len(emails)
        return emails

    def _extract_emails_from_js_events(self, driver, soup):
        """Extract emails from JavaScript event handlers"""
        logger.debug("Extracting emails from JavaScript event handlers")
        emails = set()
        
        # Find elements with onclick, onmouseover, and other JS event attributes
        js_elements = []
        
        # Common JS event attributes that might contain email info
        js_events = ['onclick', 'onmouseover', 'onload', 'onmouseout', 'onmousedown']
        
        for event in js_events:
            # Use BeautifulSoup to find elements with these attributes
            elements = soup.find_all(attrs={event: True})
            js_elements.extend(elements)
            
            # Also use Selenium to find elements (might catch dynamically added ones)
            try:
                selenium_elements = driver.find_elements(By.CSS_SELECTOR, f"[{event}]")
                for elem in selenium_elements:
                    # Extract the event handler attribute value
                    event_code = elem.get_attribute(event)
                    if event_code:
                        # Look for email patterns in the JS code
                        email_matches = re.findall(self.email_pattern, event_code)
                        for email in email_matches:
                            if email:
                                emails.add(email)
                                logger.debug(f"Found email in {event} handler: {email}")
                                self.stats["js_events"] += 1
                        
                        # Look for 'mailto:' in JS code
                        if 'mailto:' in event_code:
                            # Extract what follows mailto:
                            mailto_matches = re.findall(r"mailto:([^'\"\s&?]+)", event_code)
                            for mailto in mailto_matches:
                                email = urllib.parse.unquote(mailto)
                                if email and re.match(self.email_pattern, email):
                                    emails.add(email)
                                    logger.debug(f"Found email from mailto in JS: {email}")
                                    self.stats["js_events"] += 1
            except Exception as e:
                logger.warning(f"Error extracting JS events with Selenium: {str(e)}")
        
        # Process BeautifulSoup elements
        for element in js_elements:
            for event in js_events:
                event_code = element.get(event, '')
                if event_code:
                    # Look for email patterns in the JS code
                    email_matches = re.findall(self.email_pattern, event_code)
                    for email in email_matches:
                        if email:
                            emails.add(email)
                            logger.debug(f"Found email in {event} handler: {email}")
                            self.stats["js_events"] += 1
                    
                    # Look for 'mailto:' in JS code
                    if 'mailto:' in event_code:
                        # Extract what follows mailto:
                        mailto_matches = re.findall(r"mailto:([^'\"\s&?]+)", event_code)
                        for mailto in mailto_matches:
                            email = urllib.parse.unquote(mailto)
                            if email and re.match(self.email_pattern, email):
                                emails.add(email)
                                logger.debug(f"Found email from mailto in JS: {email}")
                                self.stats["js_events"] += 1
        
        logger.info(f"Found {len(emails)} emails from JavaScript event handlers")
        self.stats["emails_found"] += len(emails)
        return emails

    def _extract_emails_from_raw_text(self, soup):
        """Extract emails from raw text content"""
        logger.debug("Extracting emails from raw text")
        emails = set()
        
        # Get all text from the page
        text = soup.get_text()
        
        # Find all email matches
        email_matches = re.findall(self.email_pattern, text)
        
        for email in email_matches:
            if email:
                emails.add(email)
                self.stats["raw_text"] += 1
        
        logger.info(f"Found {len(emails)} emails from raw text")
        self.stats["emails_found"] += len(emails)
        return emails

    def extract_phones_from_page(self, soup):
        """Extract phone numbers from page"""
        logger.debug("Extracting phone numbers")
        phones = set()
        
        # Get all text from the page
        text = soup.get_text()
        
        # Find all phone matches
        phone_matches = re.findall(self.phone_pattern, text)
        
        for phone in phone_matches:
            if phone:
                phones.add(phone)
        
        logger.info(f"Found {len(phones)} phone numbers")
        return list(phones)

# Example usage
if __name__ == "__main__":
    # Test URL
    test_url = "https://example-dealership.com"
    
    try:
        extractor = ContactExtractor(headless=True)
        contacts = extractor.extract_contacts(test_url)
        print("Extracted contacts:", contacts)
    finally:
        extractor.cleanup() 