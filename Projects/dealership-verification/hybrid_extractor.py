#!/usr/bin/env python3
"""
Hybrid Contact Extractor

This script combines Selenium and Firecrawl for contact extraction:
1. First attempts to extract using Selenium (faster for many sites)
2. Falls back to Firecrawl if Selenium fails or returns incomplete data
3. Combines results from both methods for the most comprehensive data
"""

import logging
from contact_extractor import ContactExtractor
from firecrawl_extractor_simple import FirecrawlExtractor

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("hybrid_extractor")

class HybridContactExtractor:
    """
    A hybrid extractor that first tries Selenium, then falls back to Firecrawl
    if necessary. This gives the best of both worlds - the speed of Selenium
    when it works, and the reliability of Firecrawl when Selenium fails.
    """
    
    def __init__(self, api_key, headless=True, timeout=30, fallback_mode="auto"):
        """
        Initialize the hybrid extractor.
        
        Args:
            api_key (str): Firecrawl API key
            headless (bool): Whether to run Selenium in headless mode
            timeout (int): Timeout for Selenium operations
            fallback_mode (str): When to fall back to Firecrawl:
                - "auto": Fall back if Selenium fails or returns incomplete data
                - "on_failure": Fall back only if Selenium fails
                - "always": Always run both and combine results
        """
        self.selenium_extractor = ContactExtractor(headless=headless, timeout=timeout)
        self.firecrawl_extractor = FirecrawlExtractor(api_key=api_key)
        self.fallback_mode = fallback_mode
        self.logger = logger
    
    def extract_contacts(self, url):
        """
        Extract contact information using the hybrid approach.
        
        Args:
            url (str): URL to extract contact information from
            
        Returns:
            dict: Contact information (emails, phones, address)
        """
        self.logger.info(f"Extracting contacts from {url} using hybrid method")
        
        # Initialize result dictionary
        result = {
            "emails": [],
            "phones": [],
            "address": None,
            "method_used": "hybrid"
        }
        
        # Track which methods were successful
        selenium_success = False
        firecrawl_success = False
        
        # First try Selenium
        try:
            self.logger.info(f"Attempting extraction with Selenium: {url}")
            selenium_result = self.selenium_extractor.extract_contacts(url)
            
            # Check if we got meaningful results
            selenium_has_emails = len(selenium_result.get("emails", [])) > 0
            selenium_has_phones = len(selenium_result.get("phones", [])) > 0
            selenium_has_address = selenium_result.get("address") is not None
            
            # Update our result with Selenium data
            result["emails"].extend(selenium_result.get("emails", []))
            result["phones"].extend(selenium_result.get("phones", []))
            if selenium_has_address:
                result["address"] = selenium_result.get("address")
            
            selenium_success = True
            result["selenium_data"] = {
                "emails": selenium_has_emails,
                "phones": selenium_has_phones,
                "address": selenium_has_address
            }
            
            self.logger.info(f"Selenium extraction successful: {len(result['emails'])} emails, "
                            f"{len(result['phones'])} phones, address: {bool(result['address'])}")
            
            # Determine if we need to fall back to Firecrawl
            needs_fallback = False
            if self.fallback_mode == "always":
                needs_fallback = True
                self.logger.info("Fallback mode is 'always', using Firecrawl regardless")
            elif self.fallback_mode == "auto":
                # Fall back if Selenium didn't find much
                if not (selenium_has_emails and selenium_has_phones and selenium_has_address):
                    needs_fallback = True
                    self.logger.info("Selenium results incomplete, falling back to Firecrawl")
            
            # If Selenium was successful and we don't need fallback, return now
            if not needs_fallback:
                result["method_used"] = "selenium"
                return result
                
        except Exception as e:
            self.logger.warning(f"Selenium extraction failed: {str(e)}")
            # Always fall back if Selenium failed completely
            needs_fallback = True
        
        # Fall back to Firecrawl if needed
        if needs_fallback or self.fallback_mode == "always":
            try:
                self.logger.info(f"Attempting extraction with Firecrawl: {url}")
                firecrawl_result = self.firecrawl_extractor.extract_contacts(url)
                
                # Track which data came from Firecrawl
                firecrawl_has_emails = len(firecrawl_result.get("emails", [])) > 0
                firecrawl_has_phones = len(firecrawl_result.get("phones", [])) > 0
                firecrawl_has_address = firecrawl_result.get("address") is not None
                
                # Combine emails and phones, ensuring uniqueness
                result["emails"] = list(set(result["emails"] + firecrawl_result.get("emails", [])))
                result["phones"] = list(set(result["phones"] + firecrawl_result.get("phones", [])))
                
                # Use Firecrawl address if we don't already have one
                if not result["address"] and firecrawl_has_address:
                    result["address"] = firecrawl_result.get("address")
                
                firecrawl_success = True
                result["firecrawl_data"] = {
                    "emails": firecrawl_has_emails,
                    "phones": firecrawl_has_phones,
                    "address": firecrawl_has_address
                }
                
                self.logger.info(f"Firecrawl extraction successful: {len(firecrawl_result.get('emails', []))} emails, "
                                f"{len(firecrawl_result.get('phones', []))} phones, address: {bool(firecrawl_result.get('address'))}")
                
            except Exception as e:
                self.logger.warning(f"Firecrawl extraction failed: {str(e)}")
        
        # Set the method used based on what succeeded
        if selenium_success and firecrawl_success:
            result["method_used"] = "hybrid"
        elif selenium_success:
            result["method_used"] = "selenium"
        elif firecrawl_success:
            result["method_used"] = "firecrawl"
        else:
            result["method_used"] = "failed"
        
        return result
    
    def cleanup(self):
        """Clean up resources"""
        self.selenium_extractor.cleanup()
        self.firecrawl_extractor.cleanup()

# Example usage
if __name__ == "__main__":
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description='Extract contact information using hybrid method')
    parser.add_argument('url', help='URL to extract contacts from')
    parser.add_argument('--api-key', required=True, help='Firecrawl API key')
    parser.add_argument('--mode', choices=['auto', 'on_failure', 'always'], default='auto',
                        help='When to use Firecrawl: auto (default), on_failure, or always')
    args = parser.parse_args()
    
    # Initialize and run extractor
    extractor = HybridContactExtractor(api_key=args.api_key, fallback_mode=args.mode)
    try:
        contacts = extractor.extract_contacts(args.url)
        print(json.dumps(contacts, indent=2))
    finally:
        extractor.cleanup()