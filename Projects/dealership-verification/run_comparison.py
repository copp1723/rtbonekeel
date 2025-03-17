#!/usr/bin/env python3
"""
Run Comparison Script - Compare Selenium and Firecrawl for Dealership Contact Extraction

This script is used to benchmark and compare the performance of Selenium and Firecrawl
for extracting contact information from dealership websites.
"""

import argparse
from comparison_test import run_comparison, save_results

def main():
    parser = argparse.ArgumentParser(description='Compare Selenium and Firecrawl for dealership website scraping')
    parser.add_argument('--api-key', required=True, help='Firecrawl API key')
    parser.add_argument('--urls', nargs='+', help='List of URLs to test')
    parser.add_argument('--file', help='File containing URLs to test (one per line)')
    parser.add_argument('--output', help='Output filename for results')
    args = parser.parse_args()
    
    # Get URLs to test
    urls = []
    if args.urls:
        urls.extend(args.urls)
    
    if args.file:
        try:
            with open(args.file, 'r') as f:
                file_urls = [line.strip() for line in f if line.strip()]
                urls.extend(file_urls)
        except Exception as e:
            print(f"Error reading URL file: {str(e)}")
    
    # Default problematic URLs if none provided
    if not urls:
        print("No URLs provided. Using default problematic URLs for testing.")
        urls = [
            "https://www.robsightford.com/",
            "https://www.kengrodyford.com/",
            "https://www.hallhyundai.com/",
        ]
    
    print(f"Starting comparison test with {len(urls)} URLs...")
    for i, url in enumerate(urls, 1):
        print(f"{i}. {url}")
    
    # Run the comparison
    results = run_comparison(urls, args.api_key)
    
    # Save the results
    save_results(results, args.output)

if __name__ == "__main__":
    main()