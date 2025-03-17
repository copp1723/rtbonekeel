#!/usr/bin/env python3
"""
Minimal Test Script for Firecrawl API
"""

from firecrawl import FirecrawlApp
import json

# Use the actual API key
API_KEY = "fc-73aeb0d1ae814693ba39bdbafbbd505d"
app = FirecrawlApp(api_key=API_KEY)
print("Firecrawl initialized successfully!")

# Test a single simple method to ensure the API works
try:
    print("Testing search method with a simple query...")
    result = app.search("car dealership")
    
    if result and isinstance(result, dict) and "data" in result:
        print("Search successful!")
        print(f"Found {len(result['data'])} results")
    else:
        print("Search returned an unexpected format")
    
except Exception as e:
    print(f"Error during test: {str(e)}")