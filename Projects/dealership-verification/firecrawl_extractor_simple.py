# firecrawl_extractor.py
from firecrawl import FirecrawlApp
import re
import logging

class FirecrawlExtractor:
    def __init__(self, api_key):
        self.app = FirecrawlApp(api_key=api_key)
        self.email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
        self.phone_pattern = re.compile(r'(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}')
        # Set up simple logging
        self.logger = logging.getLogger("firecrawl_extractor")
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
    
    def extract_contacts(self, url):
        """
        Extract contact information from a dealership website using Firecrawl.
        Returns a dict with emails, phones, and address similar to the ContactExtractor.
        """
        self.logger.info(f"Extracting contacts from {url}")
        
        # Extract dealership name from URL for better results
        import re
        dealership_name = ""
        match = re.search(r'//(?:www\.)?([^./]+)', url)
        if match:
            dealership_name = match.group(1).replace('-', ' ').replace('_', ' ')
        
        # Create a specific query about contact information
        query = f"What is the contact information for the {dealership_name} dealership at {url}? " + \
                "Extract all email addresses, phone numbers, and the physical address. " + \
                "Format the response as a JSON object with keys for 'emails' (array), 'phones' (array), and 'address' (string)."
        
        try:
            # Use deep_research to extract contact information
            self.logger.info(f"Starting deep research query for {url}")
            result = self.app.deep_research(query)
            
            # Initialize default values
            emails = []
            phones = []
            address = None
            
            # Process the results from deep_research
            if result and "data" in result and "finalAnalysis" in result["data"]:
                # The finalAnalysis contains the text answer
                analysis = result["data"]["finalAnalysis"]
                
                # Extract contact info using regex
                # Extract emails
                email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
                email_matches = re.findall(email_pattern, analysis)
                emails = [email.lower() for email in email_matches if 'example.com' not in email]
                
                # Extract phone numbers
                phone_pattern = r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'
                phone_matches = re.findall(phone_pattern, analysis)
                
                # Format phone numbers
                for phone in phone_matches:
                    if isinstance(phone, tuple) and len(phone) == 3:
                        area, prefix, number = phone
                        if area and prefix and number:
                            # Format as 10 digits with no separators
                            formatted = f"{area}{prefix}{number}"
                            if formatted not in phones:  # Avoid duplicates
                                phones.append(formatted)
                
                # Extract address (more complex due to varying formats)
                # Look for common address patterns in the text
                address_patterns = [
                    r'\d+\s+[A-Za-z0-9\s,\.]+(?:Road|Street|Avenue|Drive|Blvd|Boulevard|Trafficway|Parkway|Highway|Hwy)[A-Za-z0-9\s,\.]+(?:[A-Z]{2})\s+\d{5}',
                    r'Address[:\s]+(.*?)(?=\n|$)',
                    r'located at[:\s]+(.*?)(?=\n|$)'
                ]
                
                for pattern in address_patterns:
                    address_match = re.search(pattern, analysis, re.IGNORECASE)
                    if address_match:
                        address = address_match.group(1).strip() if len(address_match.groups()) > 0 else address_match.group(0).strip()
                        break
            
            # Also check if there are sources with relevant info
            if "sources" in result:
                for source in result.get("sources", []):
                    if "content" in source:
                        content = source["content"]
                        # Look for additional emails
                        email_matches = re.findall(email_pattern, content)
                        for email in email_matches:
                            if email.lower() not in emails and 'example.com' not in email:
                                emails.append(email.lower())
                        
                        # Look for additional phone numbers
                        phone_matches = re.findall(phone_pattern, content)
                        for phone in phone_matches:
                            if isinstance(phone, tuple) and len(phone) == 3:
                                area, prefix, number = phone
                                if area and prefix and number:
                                    formatted = f"{area}{prefix}{number}"
                                    if formatted not in phones:
                                        phones.append(formatted)
            
            self.logger.info(f"Extraction successful: {len(emails)} emails, {len(phones)} phones, address: {bool(address)}")
            
            # Return in the same format as ContactExtractor
            return {
                'emails': emails,
                'phones': phones,
                'address': address,
                'method': 'firecrawl'  # Add extraction method for tracking
            }
            
        except Exception as e:
            self.logger.error(f"Error extracting contacts from {url}: {str(e)}")
            # Re-raise to allow for retry logic
            raise
    
    def cleanup(self):
        """Clean up method to match the ContactExtractor interface"""
        # No cleanup needed for Firecrawl
        pass