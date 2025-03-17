#!/usr/bin/env python3
"""
Firecrawl Example - Crawling Dealership Websites for Contact Information

This script demonstrates how to use Firecrawl to:
1. Crawl dealership websites
2. Extract contact information (emails, phones, addresses)
3. Process and validate the extracted data
4. Save the results
"""

import pandas as pd
import json
import time
import argparse
import os
from tqdm import tqdm
from datetime import datetime
from firecrawl import FirecrawlApp

def main():
    parser = argparse.ArgumentParser(description='Extract contact information from dealership websites using Firecrawl')
    parser.add_argument('input_file', help='Path to the dealership data CSV file')
    parser.add_argument('--api-key', help='Firecrawl API key', required=True)
    parser.add_argument('--output', default='firecrawl_contacts.csv', help='Output CSV file path')
    parser.add_argument('--limit', type=int, default=None, help='Limit the number of dealerships to process')
    parser.add_argument('--verbose', action='store_true', help='Print detailed progress information')
    args = parser.parse_args()
    
    # Initialize Firecrawl
    print(f"🚀 Initializing Firecrawl...")
    firecrawl = FirecrawlApp(api_key=args.api_key)
    
    # Load dealership data
    print(f"📊 Loading dealership data from {args.input_file}...")
    df = pd.read_csv(args.input_file)
    
    if 'Website' not in df.columns:
        print(f"❌ Error: Input file must contain a 'Website' column. Found columns: {df.columns.tolist()}")
        return
    
    # Filter out dealerships without websites
    df = df[df['Website'].notna() & df['Website'].str.strip().astype(bool)]
    print(f"✅ Loaded {len(df)} dealerships with websites")
    
    # Apply limit if specified
    if args.limit and args.limit < len(df):
        df = df.sample(args.limit)
        print(f"ℹ️ Limited to {args.limit} randomly selected dealerships")
    
    # Prepare results dataframe
    results = []
    
    # Define common crawler configuration
    crawler_config = {
        "max_pages": 10,  # Limit to 10 pages
        "follow_links": True,  # Follow internal links
        "follow_link_keywords": ["contact", "about", "locations", "find us", "directions"],
        "extract_selectors": [
            # Email extraction
            {"name": "emails", "type": "regex", "pattern": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'},
            
            # Phone extraction
            {"name": "phones", "type": "regex", "pattern": r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'},
            
            # Address extraction
            {"name": "address", "type": "css", "selector": "[itemtype*='PostalAddress'], .address, .location, [class*='address'], [class*='location']"},
            
            # Contact page elements
            {"name": "contact_elements", "type": "css", "selector": ".contact, #contact, [class*='contact'], [id*='contact']"}
        ],
        "http_headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    }
    
    # Process each dealership
    start_time = time.time()
    for idx, row in tqdm(df.iterrows(), total=len(df), desc="Processing dealerships"):
        dealership_name = row.get('Dealership', f"Dealership {idx}")
        url = row['Website']
        
        # Ensure URL has http/https prefix
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
            
        # Prepare result entry
        result_entry = {
            'Dealership': dealership_name,
            'Website': url,
            'Emails': '',
            'Phones': '',
            'Address': '',
            'Success': False,
            'Error': '',
            'ProcessTime': 0
        }
        
        crawl_start = time.time()
        try:
            if args.verbose:
                print(f"\n🔍 Crawling {url} ({dealership_name})...")
                
            # Run the crawler
            crawler_result = firecrawl.crawl(url, config=crawler_config)
            
            # Process emails
            emails = []
            if 'emails' in crawler_result and crawler_result['emails']:
                emails = [email.lower() for email in crawler_result['emails'] 
                          if '@' in email and 'example.com' not in email]
                
            # Process phones
            phones = []
            if 'phones' in crawler_result and crawler_result['phones']:
                for phone in crawler_result['phones']:
                    # Extract digits only
                    digits = ''.join(filter(str.isdigit, phone))
                    if len(digits) >= 10:
                        # Format the phone number
                        if len(digits) == 10:
                            phones.append(digits)
                        elif len(digits) == 11 and digits.startswith('1'):
                            phones.append(digits[1:])
                        else:
                            phones.append(digits[-10:])
            
            # Process address
            address = None
            if 'address' in crawler_result and crawler_result['address']:
                address_elements = crawler_result['address']
                if isinstance(address_elements, list) and address_elements:
                    address = " ".join([a.strip() for a in address_elements if a and len(a.strip()) > 0])
            
            # Update result entry
            result_entry.update({
                'Emails': ';'.join(emails),
                'Phones': ';'.join(phones),
                'Address': address or '',
                'Success': True,
                'ProcessTime': time.time() - crawl_start
            })
            
            if args.verbose:
                print(f"✅ Found {len(emails)} emails, {len(phones)} phones" + 
                      (f", and address information" if address else ""))
            
        except Exception as e:
            crawl_time = time.time() - crawl_start
            result_entry.update({
                'Success': False,
                'Error': str(e),
                'ProcessTime': crawl_time
            })
            
            if args.verbose:
                print(f"❌ Error: {str(e)}")
        
        # Add to results
        results.append(result_entry)
        
        # Introduce a small delay to avoid rate limiting
        time.sleep(0.5)
    
    # Create results DataFrame
    results_df = pd.DataFrame(results)
    
    # Save results
    results_df.to_csv(args.output, index=False)
    
    # Print summary
    total_time = time.time() - start_time
    success_count = results_df['Success'].sum()
    success_rate = success_count / len(results_df) * 100 if len(results_df) > 0 else 0
    
    emails_found = results_df[results_df['Emails'] != ''].shape[0]
    phones_found = results_df[results_df['Phones'] != ''].shape[0]
    addresses_found = results_df[results_df['Address'] != ''].shape[0]
    
    print("\n" + "="*80)
    print(f"📊 FIRECRAWL EXTRACTION SUMMARY")
    print("="*80)
    print(f"Total dealerships processed: {len(results_df)}")
    print(f"Successful extractions: {success_count} ({success_rate:.1f}%)")
    print(f"Total processing time: {total_time:.1f} seconds (avg: {total_time/len(results_df):.1f}s per dealership)")
    print(f"Dealerships with emails found: {emails_found} ({emails_found/len(results_df)*100:.1f}%)")
    print(f"Dealerships with phones found: {phones_found} ({phones_found/len(results_df)*100:.1f}%)")
    print(f"Dealerships with addresses found: {addresses_found} ({addresses_found/len(results_df)*100:.1f}%)")
    print(f"Results saved to: {args.output}")
    print("="*80)

if __name__ == "__main__":
    main()