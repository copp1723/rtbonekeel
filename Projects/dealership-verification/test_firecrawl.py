#!/usr/bin/env python3

from firecrawl_extractor_simple import FirecrawlExtractor
import json
import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_firecrawl.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    api_key = "fc-73aeb0d1ae814693ba39bdbafbbd505d"
    
    extractor = FirecrawlExtractor(api_key=api_key)
    try:
        print(f"Extracting contacts from {url} using Firecrawl...")
        contacts = extractor.extract_contacts(url)
        print("\nExtracted Contacts:")
        print(json.dumps(contacts, indent=2))
    finally:
        extractor.cleanup()

if __name__ == "__main__":
    main()