#!/usr/bin/env python3

import sys
from contact_extractor import ContactExtractor

def test_dealership(url):
    """Test email extraction on a dealership website using the modified implementation"""
    print(f"\n=== Testing MODIFIED email extraction on {url} ===")
    
    extractor = None
    try:
        # Initialize the extractor
        extractor = ContactExtractor(headless=True)
        
        # Extract contacts
        print(f"Extracting contacts from {url}...")
        contacts = extractor.extract_contacts(url)
        
        # Display results
        emails = contacts.get('emails', [])
        print(f"\nFound {len(emails)} emails:")
        print("=== Emails ===")
        for email in emails:
            print(email)
        
        return True
    except Exception as e:
        print(f"Error testing {url}: {str(e)}")
        return False
    finally:
        # Clean up resources
        if extractor:
            try:
                extractor.cleanup()
            except:
                pass

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_modified.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    test_dealership(url) 