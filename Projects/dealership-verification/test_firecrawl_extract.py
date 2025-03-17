#!/usr/bin/env python3
"""
Test Script for Firecrawl Extract API
"""

from firecrawl import FirecrawlApp
import json
import re

# Use the actual API key
API_KEY = "fc-73aeb0d1ae814693ba39bdbafbbd505d"
app = FirecrawlApp(api_key=API_KEY)
print("Firecrawl initialized successfully!")

# Test the extract method which is suitable for extracting specific data
try:
    print("Testing extract method on a dealership website...")
    
    # URL to extract from
    url = "https://www.robsightford.com/"
    
    # Use extract method with a prompt to extract contact information
    result = app.extract(
        [url],
        params=app.ExtractParams(
            prompt="Extract all contact information from this dealership website, including email addresses, phone numbers, and physical address."
        )
    )
    
    print("Extraction completed!")
    print("\nResult structure:")
    print(json.dumps({k: type(v).__name__ for k, v in result.items()}, indent=2))
    
    # Determine what to do based on the structure
    if "data" in result:
        print("\nExtracted data:")
        data = result["data"]
        
        # Just print the data structure (likely AI-generated JSON)
        print(json.dumps(data, indent=2))
        
        # Extract contact info if it's in a parseable format
        if isinstance(data, dict):
            # Try to find contact info in common fields
            emails = []
            phones = []
            address = None
            
            # Extract emails
            if "emails" in data:
                emails = data["emails"]
            elif "email" in data:
                if isinstance(data["email"], list):
                    emails = data["email"]
                else:
                    emails = [data["email"]]
                    
            # Extract phones
            if "phones" in data:
                phones = data["phones"]
            elif "phone_numbers" in data:
                phones = data["phone_numbers"]
            elif "phone" in data:
                if isinstance(data["phone"], list):
                    phones = data["phone"]
                else:
                    phones = [data["phone"]]
                    
            # Extract address
            if "address" in data:
                address = data["address"]
            elif "physical_address" in data:
                address = data["physical_address"]
                
            # Display the extracted info
            if emails:
                print("\nEmails:")
                for email in emails[:5]:
                    print(f"  - {email}")
                    
            if phones:
                print("\nPhone Numbers:")
                for phone in phones[:5]:
                    print(f"  - {phone}")
                    
            if address:
                print("\nAddress:")
                print(f"  {address}")
    else:
        print("Result doesn't contain data field. Structure:")
        print(json.dumps(result, indent=2)[:1000])
    
except Exception as e:
    print(f"Error during test: {str(e)}")