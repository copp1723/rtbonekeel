#!/usr/bin/env python3
"""
Test Script for Firecrawl Deep Research API
"""

from firecrawl import FirecrawlApp
import json

# Use the actual API key
API_KEY = "fc-73aeb0d1ae814693ba39bdbafbbd505d"
app = FirecrawlApp(api_key=API_KEY)
print("Firecrawl initialized successfully!")

# Test the deep_research method which is more suited for extraction tasks
try:
    print("Testing deep_research method on a dealership...")
    
    # Create a specific query about contact information
    query = "What is the contact information for Rob Sight Ford dealership? Extract all email addresses, phone numbers, and the physical address."
    
    # Call the deep_research method
    result = app.deep_research(query)
    
    print("Research completed!")
    print("\nResult structure:")
    print(json.dumps({k: type(v).__name__ for k, v in result.items()}, indent=2))
    
    # Display the actual result
    if "answer" in result:
        print("\nExtracted information:")
        print(result["answer"])
    else:
        print("\nFull result:")
        print(json.dumps(result, indent=2)[:2000])  # Show first 2000 chars
    
except Exception as e:
    print(f"Error during test: {str(e)}")