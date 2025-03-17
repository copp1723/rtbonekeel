#!/usr/bin/env python3
"""
Simple test script for Firecrawl API
"""

from firecrawl import FirecrawlApp
import json
import time
import inspect

# Use the actual API key
API_KEY = "fc-73aeb0d1ae814693ba39bdbafbbd505d"
app = FirecrawlApp(api_key=API_KEY)
print("Firecrawl installed successfully!")

# Check available methods on the FirecrawlApp object
print("\nAvailable methods and attributes on FirecrawlApp:")
for method_name in dir(app):
    if not method_name.startswith('_'):  # Skip private methods
        attr = getattr(app, method_name)
        if callable(attr):
            try:
                signature = str(inspect.signature(attr))
                print(f"Method: {method_name}{signature}")
            except ValueError:
                print(f"Method: {method_name}()")
        else:
            print(f"Attribute: {method_name} = {attr}")
            
print("\n")

# Test extraction from a problematic dealership
try:
    # Configure a simple crawl job
    crawl_config = {
        "max_pages": 3,
        "follow_links": True,
        "follow_link_keywords": ["contact", "about", "locations"],
        "extract_selectors": [
            {"name": "emails", "type": "regex", "pattern": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'},
            {"name": "phones", "type": "regex", "pattern": r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'},
            {"name": "address", "type": "css", "selector": "[itemtype*='PostalAddress'], .address, .location"}
        ]
    }
    
    # Run the crawler on a known problematic site
    url = "https://www.robsightford.com/"
    print(f"Testing Firecrawl on {url}...")
    start_time = time.time()
    
    # Try the simplest API method first
    print("Using scrape_url method...")
    
    # Scrape the URL with default parameters
    result = app.scrape_url(url)
    
    # Check if we have content to process
    if result and isinstance(result, dict) and "content" in result:
        print("Successfully scraped the URL!")
    else:
        print("Trying crawl_url method with minimal parameters...")
        result = app.crawl_url(url)
    
    end_time = time.time()
    
    # Process and display results
    print(f"Extraction completed in {end_time - start_time:.2f} seconds!")
    print("\nResults structure:")
    print(json.dumps({k: type(v).__name__ for k, v in result.items()}, indent=2))
    
    # Display the actual result summary
    print("\nExtracted data:")
    
    # Handle different possible result structures
    if isinstance(result, dict):
        if "data" in result:
            # For nested data structure
            data = result["data"]
            if isinstance(data, list) and data:
                # Extract selectors from first page
                selectors = data[0].get("selectors", {})
                emails = selectors.get("email", [])
                phones = selectors.get("phone", [])
                addresses = selectors.get("address", [])
                
                print(f"Found {len(emails)} emails, {len(phones)} phones, {len(addresses)} address elements")
                print("\nSample data:")
                print(json.dumps({
                    "emails": emails[:5] if emails else [],
                    "phones": phones[:5] if phones else [],
                    "addresses": addresses[:2] if addresses else []
                }, indent=2))
            else:
                print("No data found in the result")
        else:
            # Try other common formats
            print(json.dumps(result, indent=2)[:1000])  # Show first 1000 chars
    else:
        print(f"Result is not a dictionary: {type(result).__name__}")
    
except Exception as e:
    print(f"Error during test: {str(e)}")