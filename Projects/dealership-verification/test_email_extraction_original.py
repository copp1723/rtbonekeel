#!/usr/bin/env python3

import argparse
import sys
import importlib.util
import os

# Dynamically import the original ContactExtractor
spec = importlib.util.spec_from_file_location("contact_extractor_original", 
                                             os.path.join(os.path.dirname(__file__), "contact_extractor_original.py"))
contact_extractor_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(contact_extractor_module)
ContactExtractor = contact_extractor_module.ContactExtractor

def test_dealership(url, no_cache=True):
    """Test email extraction on a dealership website using the original implementation"""
    print(f"\n=== Testing ORIGINAL email extraction on {url} ===")
    
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
        
        # Display phone numbers
        phones = contacts.get('phones', [])
        print(f"\nFound {len(phones)} phone numbers:")
        print("=== Phone Numbers ===")
        for phone in phones:
            print(phone)
        
        # Display address
        address = contacts.get('address')
        print("\n=== Address ===")
        print(address if address else "No address found")
        
        return True
    except Exception as e:
        print(f"Error testing {url}: {str(e)}")
        return False
    finally:
        # Clean up resources
        if 'extractor' in locals():
            extractor.cleanup()

def main():
    parser = argparse.ArgumentParser(description='Test email extraction on dealership websites using original implementation')
    parser.add_argument('url', help='URL of the dealership website to test')
    parser.add_argument('--no-cache', action='store_true', help='Disable caching')
    
    args = parser.parse_args()
    
    success = test_dealership(args.url, args.no_cache)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 