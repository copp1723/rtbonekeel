from firecrawl import FirecrawlApp
from log_manager import get_logger
import re
import time
import random
import uuid
from error_handler import retry_with_backoff

class FirecrawlExtractor:
    def __init__(self, api_key, timeout=30):
        self.timeout = timeout
        self.logger = get_logger('firecrawl_extractor')
        self.extraction_id = str(uuid.uuid4())[:8]  # Short ID for tracking related operations
        self.app = FirecrawlApp(api_key=api_key)
    
    @retry_with_backoff(max_retries=3, initial_backoff=2)
    def extract_contacts(self, url):
        """Extract contact information from the given URL using Firecrawl"""
        contacts = {
            'emails': set(),
            'phones': set(),
            'address': None
        }
        
        try:
            self.logger.info(f"[{self.extraction_id}] Attempting to extract contacts from: {url}")
            
            # Define the scraping strategy
            crawler_config = {
                "max_pages": 10,  # Limit to 10 pages
                "follow_links": True,  # Follow internal links (contact pages)
                "follow_link_keywords": ["contact", "about", "locations", "find us", "directions"],
                "wait_time": 2,  # Wait time between requests
                "extract_selectors": [
                    # Selectors for contact information
                    {"name": "emails", "type": "regex", "pattern": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'},
                    {"name": "phones", "type": "regex", "pattern": r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'},
                    {"name": "address", "type": "css", "selector": "[itemtype*='PostalAddress'], .address, .location, [class*='address'], [class*='location']"},
                    # Additional selectors for contact elements
                    {"name": "contact_elements", "type": "css", "selector": ".contact, #contact, [class*='contact'], [id*='contact']"}
                ],
                "http_headers": {
                    "User-Agent": self._get_random_user_agent()
                }
            }
            
            # Run the crawler
            crawler_result = self.app.crawl(url, config=crawler_config)
            
            # Process the results
            self._process_crawler_results(crawler_result, contacts)
            
            # Validate extracted data
            self._validate_contact_data(contacts)
            
            self.logger.info(f"[{self.extraction_id}] Successfully extracted contacts from {url}")
            
        except Exception as e:
            self.logger.error(f"[{self.extraction_id}] Error while extracting contacts from {url}: {str(e)}")
            raise
        
        return {
            'emails': list(contacts['emails']),
            'phones': list(contacts['phones']),
            'address': contacts['address']
        }
    
    def _process_crawler_results(self, results, contacts):
        """Process the crawler results and extract contact information"""
        if not results or not isinstance(results, dict):
            self.logger.warning(f"[{self.extraction_id}] Invalid crawler results")
            return
        
        # Extract emails
        if 'emails' in results:
            emails = results['emails']
            for email in emails:
                if self._validate_email(email):
                    contacts['emails'].add(email.lower())
        
        # Extract phone numbers
        if 'phones' in results:
            phones = results['phones']
            for phone in phones:
                formatted_phone = self._format_phone_number(phone)
                if formatted_phone:
                    contacts['phones'].add(formatted_phone)
        
        # Extract address
        if 'address' in results and results['address']:
            address_elements = results['address']
            if isinstance(address_elements, list) and address_elements:
                # Join multiple address elements or take the longest one
                if len(address_elements) > 1:
                    address = " ".join([a.strip() for a in address_elements if a and len(a.strip()) > 0])
                else:
                    address = address_elements[0]
                
                contacts['address'] = self._clean_address(address)
        
        # Extract from contact elements
        if 'contact_elements' in results and results['contact_elements']:
            for element in results['contact_elements']:
                self._extract_from_contact_element(element, contacts)
    
    def _extract_from_contact_element(self, element, contacts):
        """Extract contact information from a contact element"""
        if not element:
            return
        
        # Extract emails
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, element)
        for email in emails:
            if self._validate_email(email):
                contacts['emails'].add(email.lower())
        
        # Extract phone numbers
        phone_pattern = r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'
        phones = re.findall(phone_pattern, element)
        for phone in phones:
            formatted_phone = self._format_phone_number(phone)
            if formatted_phone:
                contacts['phones'].add(formatted_phone)
        
        # Extract address if it looks like one and we don't already have an address
        if not contacts['address'] and re.search(r'\b[A-Z]{2}\b.*?\b\d{5}(?:-\d{4})?\b', element):
            contacts['address'] = self._clean_address(element)
    
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
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'$'
        return bool(re.match(email_regex, email))
    
    def _format_phone_number(self, phone_tuple_or_string):
        """Format phone number consistently"""
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
    
    def _clean_address(self, text):
        """Clean and format extracted address text"""
        if not text:
            return None
            
        # Remove extra whitespace and line breaks
        text = re.sub(r'\s+', ' ', str(text).strip())
        
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
        pattern = r'^\d{10,11}$'$'
        contacts['phones'] = {phone for phone in contacts['phones'] if phone and re.match(pattern, phone)}
        
        # Check if address looks valid (contains state code and zip)
        if contacts['address']:
            if not re.search(r'\b[A-Z]{2}\b.*?\b\d{5}(?:-\d{4})?\b', contacts['address']):
                contacts['address'] = None
    
    def _get_random_user_agent(self):
        """Get a random user agent to help avoid blocking"""
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
        ]
        return random.choice(user_agents)

# Example usage
if __name__ == "__main__":
    # Replace with your API key
    API_KEY = "fc-YOUR_API_KEY"
    
    # Test URL
    test_url = "https://example-dealership.com"
    
    extractor = FirecrawlExtractor(api_key=API_KEY)
    contacts = extractor.extract_contacts(test_url)
    print("Extracted contacts:", contacts)