#!/usr/bin/env python3
"""
Test Script for Hybrid Extractor
"""

from firecrawl_extractor_simple import FirecrawlExtractor
import json
import time

# Test the Firecrawl extractor on a problematic dealership
API_KEY = "fc-73aeb0d1ae814693ba39bdbafbbd505d"

def main():
    print("Testing Firecrawl extractor on a problematic dealership...")
    
    # URL to extract from
    url = "https://www.robsightford.com/"
    
    # Initialize the extractor
    extractor = FirecrawlExtractor(api_key=API_KEY)
    
    try:
        # Extract contacts
        start_time = time.time()
        print(f"Extracting contacts from {url}...")
        contacts = extractor.extract_contacts(url)
        end_time = time.time()
        
        # Display results
        print(f"\nExtraction completed in {end_time - start_time:.2f} seconds")
        print("\nResults:")
        print(json.dumps(contacts, indent=2))
        
        # Summarize the results
        print("\nSummary:")
        print(f"Found {len(contacts['emails'])} email addresses")
        if contacts['emails']:
            print("Emails:")
            for email in contacts['emails']:
                print(f"  - {email}")
                
        print(f"Found {len(contacts['phones'])} phone numbers")
        if contacts['phones']:
            print("Phone numbers:")
            for phone in contacts['phones']:
                print(f"  - {phone}")
                
        print(f"Address: {contacts['address'] if contacts['address'] else 'Not found'}")
        
    except Exception as e:
        print(f"Error during test: {str(e)}")
    finally:
        extractor.cleanup()

if __name__ == "__main__":
    main()