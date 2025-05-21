#!/usr/bin/env python3
"""
Extract Clean Content Script

This script uses trafilatura to extract clean text from webpages.
It takes a URL as input and returns the extracted content as JSON.
"""
import sys
import json
import traceback

try:
    import trafilatura
except ImportError:
    print(json.dumps({
        "error": "trafilatura package not installed. Install with: pip install trafilatura"
    }))
    sys.exit(1)

def extract_content(url):
    """Extract clean content from a URL using trafilatura"""
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded is None:
            return {"error": f"Failed to download content from {url}"}
        
        content = trafilatura.extract(downloaded)
        if content is None:
            return {"error": f"Failed to extract content from {url}"}
        
        return {"content": content}
    except Exception as e:
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "URL argument is required"}))
        sys.exit(1)
    
    url = sys.argv[1]
    result = extract_content(url)
    print(json.dumps(result))
