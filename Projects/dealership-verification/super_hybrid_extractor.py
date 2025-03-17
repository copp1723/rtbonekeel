#!/usr/bin/env python3
"""
Super Hybrid Extractor

This extractor combines the best of all worlds:
1. Tries improved contact extractor first (faster, free, local)
2. Extracts staff information with confidence scoring
3. Falls back to Firecrawl API when needed (more reliable, higher success rate)
4. Optionally combines results from both for maximum data coverage

This gives the best balance of:
- Speed (selenium is typically faster when it works)
- Quality (improved phone extraction, focused on header/footer, staff information)
- Reliability (Firecrawl has higher success rates especially on difficult sites)
- Cost-effectiveness (only use Firecrawl API when needed)
"""

import logging
import time
import sys
from improved_contact_extractor import ImprovedContactExtractor
from staff_extractor import StaffExtractor
try:
    from firecrawl_extractor_simple import FirecrawlExtractor
except ImportError:
    print("Warning: Using firecrawl_extractor instead of firecrawl_extractor_simple")
    from firecrawl_extractor import FirecrawlExtractor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("super_hybrid_extractor")

class SuperHybridExtractor:
    """
    Super hybrid extractor that combines improved contact extraction, staff information,
    and Firecrawl API for comprehensive dealership data.
    """
    
    def __init__(self, api_key, headless=True, timeout=30, mode="auto"):
        """
        Initialize the super hybrid extractor.
        
        Args:
            api_key (str): Firecrawl API key
            headless (bool): Whether to run in headless mode
            timeout (int): Timeout in seconds
            mode (str): Operation mode:
                - "auto": Use improved extractors first, fall back to Firecrawl if no/partial results
                - "fallback": Use improved extractors first, only use Firecrawl if it fails completely
                - "combine": Always run both and combine results for maximum coverage
        """
        self.api_key = api_key
        self.headless = headless
        self.timeout = timeout
        self.mode = mode
        self.logger = logger
        
        # Initialize the improved contact extractor
        self.contact_extractor = ImprovedContactExtractor(headless=headless, timeout=timeout)
        
        # Initialize the staff extractor sharing the same driver to reduce resource usage
        self.staff_extractor = StaffExtractor(selenium_driver=self.contact_extractor.driver, timeout=timeout)
        
        # Initialize the Firecrawl extractor (lazy initialization)
        self.firecrawl_extractor = None
    
    def _get_firecrawl_extractor(self):
        """Lazy initialize the Firecrawl extractor when needed"""
        if not self.firecrawl_extractor:
            self.firecrawl_extractor = FirecrawlExtractor(api_key=self.api_key)
        return self.firecrawl_extractor
    
    def extract_all(self, url, dealership_id=None):
        """
        Extract all dealership information (contacts and staff) using the hybrid approach.
        
        Args:
            url (str): URL to extract from
            dealership_id (int, optional): Dealership ID for database storage
            
        Returns:
            dict: Complete dealership information (emails, phones, address, staff)
        """
        self.logger.info(f"Extracting all dealership info from {url} using super hybrid approach (mode: {self.mode})")
        
        # Initialize results
        results = {
            'emails': [],
            'phones': [],
            'address': None,
            'staff': [],
            'method': 'hybrid',
            'selenium_success': False,
            'firecrawl_success': False
        }
        
        # First try the improved contact and staff extractors
        selenium_results = None
        staff_results = None
        try:
            # Extract contact information
            self.logger.info(f"Trying improved contact extractor first...")
            start_time = time.time()
            selenium_results = self.contact_extractor.extract_contacts(url)
            contact_time = time.time() - start_time
            self.logger.info(f"Contact extraction finished in {contact_time:.2f} seconds")
            
            # Check if we got useful contact results
            has_emails = len(selenium_results.get('emails', [])) > 0
            has_phones = len(selenium_results.get('phones', [])) > 0
            has_address = selenium_results.get('address') is not None
            
            results['emails'] = selenium_results.get('emails', [])
            results['phones'] = selenium_results.get('phones', [])
            results['address'] = selenium_results.get('address')
            
            # Extract staff information using the same browser session
            try:
                self.logger.info(f"Extracting staff information...")
                start_time = time.time()
                staff_results = self.staff_extractor.extract_staff(url)
                staff_time = time.time() - start_time
                self.logger.info(f"Staff extraction finished in {staff_time:.2f} seconds with {len(staff_results)} staff members found")
                
                if staff_results:
                    results['staff'] = staff_results
            except Exception as e:
                self.logger.warning(f"Staff extraction failed: {str(e)}")
            
            results['selenium_success'] = True
            
            # Decide whether to use Firecrawl based on the mode and results
            use_firecrawl = False
            
            if self.mode == "combine":
                # Always use Firecrawl for maximum coverage
                use_firecrawl = True
                self.logger.info("Using Firecrawl to supplement results (combine mode)")
            elif self.mode == "auto":
                # Use Firecrawl if we're missing important data
                if not (has_emails and has_phones and has_address and len(results['staff']) > 0):
                    use_firecrawl = True
                    self.logger.info("Using Firecrawl to supplement missing data (auto mode)")
                else:
                    self.logger.info("Complete data extracted with improved extractors, skipping Firecrawl")
            # For "fallback" mode, we only use Firecrawl if selenium completely failed
            
        except Exception as e:
            self.logger.warning(f"Improved extractors failed: {str(e)}")
            use_firecrawl = True
        
        # Use Firecrawl if needed
        if use_firecrawl or self.mode == "fallback" and not results['selenium_success']:
            try:
                self.logger.info(f"Trying Firecrawl API...")
                start_time = time.time()
                firecrawl_results = self._get_firecrawl_extractor().extract_contacts(url)
                firecrawl_time = time.time() - start_time
                self.logger.info(f"Firecrawl finished in {firecrawl_time:.2f} seconds")
                
                # Check what data we got
                firecrawl_emails = firecrawl_results.get('emails', [])
                firecrawl_phones = firecrawl_results.get('phones', [])
                firecrawl_address = firecrawl_results.get('address')
                
                # Combine or replace results based on what we have
                if not results['emails']:
                    results['emails'] = firecrawl_emails
                elif firecrawl_emails:
                    # Combine email lists, removing duplicates
                    results['emails'] = list(set(results['emails'] + firecrawl_emails))
                
                if not results['phones']:
                    results['phones'] = firecrawl_phones
                elif firecrawl_phones:
                    # Combine phone lists, removing duplicates
                    results['phones'] = list(set(results['phones'] + firecrawl_phones))
                
                if not results['address'] and firecrawl_address:
                    results['address'] = firecrawl_address
                
                results['firecrawl_success'] = True
                
            except Exception as e:
                self.logger.warning(f"Firecrawl extraction failed: {str(e)}")
                # Continue with whatever we got from selenium
        
        # Determine the primary extraction method used
        if results['selenium_success'] and results['firecrawl_success']:
            results['method'] = 'super_hybrid'
        elif results['selenium_success']:
            results['method'] = 'selenium'
        elif results['firecrawl_success']:
            results['method'] = 'firecrawl'
        else:
            results['method'] = 'failed'
        
        # Clean up the results before returning (keep method info but remove other metadata)
        clean_results = {
            'emails': results['emails'],
            'phones': results['phones'],
            'address': results['address'],
            'staff': results['staff'],
            'method': results['method']  # Keep the method information
        }
        
        # Save staff information to database if dealership_id is provided
        if dealership_id is not None and clean_results['staff']:
            try:
                # Import here to avoid circular imports
                from repositories import StaffRepository
                
                # Store staff information in the database
                StaffRepository.bulk_create_staff(dealership_id, clean_results['staff'])
                
                # Update the dealership to indicate it has staff info
                from repositories import DealershipRepository
                DealershipRepository.update_dealership(dealership_id, {
                    'has_staff_info': True,
                    'extraction_method': clean_results['method']
                })
                
                self.logger.info(f"Saved {len(clean_results['staff'])} staff members to database for dealership ID {dealership_id}")
            except Exception as e:
                self.logger.error(f"Error saving staff information to database: {str(e)}")
        
        self.logger.info(f"Extraction complete. Method: {results['method']}, " + 
                        f"Emails: {len(clean_results['emails'])}, " + 
                        f"Phones: {len(clean_results['phones'])}, " + 
                        f"Staff: {len(clean_results['staff'])}, " + 
                        f"Address: {'Found' if clean_results['address'] else 'Not found'}")
        
        return clean_results
    
    def extract_contacts(self, url, dealership_id=None):
        """
        Legacy method to maintain backward compatibility.
        Only extracts contact information (no staff).
        
        Args:
            url (str): URL to extract from
            dealership_id (int, optional): Dealership ID for database storage
            
        Returns:
            dict: Contact information (emails, phones, address)
        """
        self.logger.info(f"Using legacy extract_contacts method (backward compatibility)")
        
        # Use the new extract_all method but only return contact information
        all_results = self.extract_all(url, dealership_id)
        
        # Filter out staff information
        contact_results = {
            'emails': all_results['emails'],
            'phones': all_results['phones'],
            'address': all_results['address'],
            'method': all_results['method']
        }
        
        return contact_results
    
    def cleanup(self):
        """Clean up all resources"""
        if hasattr(self, 'contact_extractor'):
            self.contact_extractor.cleanup()
        
        if self.firecrawl_extractor:
            self.firecrawl_extractor.cleanup()


# Example usage
if __name__ == "__main__":
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description='Super Hybrid Dealership Data Extractor')
    parser.add_argument('url', help='URL to extract information from')
    parser.add_argument('--api-key', default="fc-73aeb0d1ae814693ba39bdbafbbd505d", help='Firecrawl API key')
    parser.add_argument('--mode', choices=['auto', 'fallback', 'combine'], default='auto',
                      help='Extraction mode (auto, fallback, or combine)')
    parser.add_argument('--headless', action='store_true', default=True, 
                      help='Run browsers in headless mode')
    parser.add_argument('--contacts-only', action='store_true',
                      help='Extract only contact info (no staff)')
    args = parser.parse_args()
    
    extractor = SuperHybridExtractor(api_key=args.api_key, mode=args.mode, headless=args.headless)
    
    try:
        if args.contacts_only:
            results = extractor.extract_contacts(args.url)
            print("\nExtracted Contacts:")
        else:
            results = extractor.extract_all(args.url)
            print("\nExtracted Dealership Information:")
        
        print(json.dumps(results, indent=2))
    finally:
        extractor.cleanup()