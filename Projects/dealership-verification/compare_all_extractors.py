#!/usr/bin/env python3
"""
Compare All Extractors

This script compares all three extraction methods:
1. Standard Selenium (original ContactExtractor)
2. Undetected ChromeDriver
3. Firecrawl API

It runs all three on the same problematic URL and compares the results.
"""

import sys
import time
import json
import argparse
import logging
from firecrawl_extractor_simple import FirecrawlExtractor
from undetected_extractor import UndetectedExtractor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("extractor_comparison")

def try_import_contact_extractor():
    """Try to import the original ContactExtractor or return None if it fails"""
    try:
        from contact_extractor import ContactExtractor
        return ContactExtractor
    except (ImportError, SyntaxError) as e:
        logger.warning(f"Could not import original ContactExtractor: {str(e)}")
        logger.warning("Skipping original Selenium test")
        return None

def run_extractor(name, extractor_instance, url):
    """Run an extractor and return timing and results"""
    logger.info(f"Testing {name} on {url}")
    
    result = {
        "name": name,
        "success": False,
        "time_taken": 0,
        "contacts": None,
        "error": None
    }
    
    start_time = time.time()
    try:
        contacts = extractor_instance.extract_contacts(url)
        result["success"] = True
        result["contacts"] = contacts
    except Exception as e:
        result["error"] = str(e)
        logger.error(f"Error with {name}: {str(e)}")
    finally:
        end_time = time.time()
        result["time_taken"] = end_time - start_time
    
    return result

def summarize_results(results):
    """Print a summary of the extraction results"""
    print("\n" + "="*80)
    print("EXTRACTOR COMPARISON RESULTS")
    print("="*80)
    
    # Print timing comparison
    print("\nTIMING COMPARISON:")
    for result in results:
        status = "✅ SUCCESS" if result["success"] else "❌ FAILED"
        print(f"{result['name']}: {result['time_taken']:.2f} seconds - {status}")
    
    # Print data comparison
    print("\nDATA COMPARISON:")
    for result in results:
        if result["success"]:
            contacts = result["contacts"]
            print(f"\n{result['name']}:")
            print(f"  Emails: {len(contacts['emails'])} found")
            for email in contacts['emails']:
                print(f"    - {email}")
                
            print(f"  Phones: {len(contacts['phones'])} found")
            for phone in contacts['phones']:
                print(f"    - {phone}")
                
            print(f"  Address: {'Found' if contacts['address'] else 'Not found'}")
            if contacts['address']:
                print(f"    {contacts['address']}")
        else:
            print(f"\n{result['name']}: Failed - {result['error']}")
    
    # Determine the winner
    print("\n" + "="*80)
    print("CONCLUSION:")
    
    # Filter only successful extractions
    successful = [r for r in results if r["success"]]
    
    if not successful:
        print("All extractors failed.")
        return
    
    # Compare by email count
    max_emails = max(len(r["contacts"]["emails"]) for r in successful)
    email_winners = [r["name"] for r in successful if len(r["contacts"]["emails"]) == max_emails]
    
    # Compare by phone count
    max_phones = max(len(r["contacts"]["phones"]) for r in successful)
    phone_winners = [r["name"] for r in successful if len(r["contacts"]["phones"]) == max_phones]
    
    # Compare by presence of address
    address_winners = [r["name"] for r in successful if r["contacts"]["address"]]
    
    # Compare by speed
    fastest = min(successful, key=lambda r: r["time_taken"])
    
    print(f"Most emails ({max_emails}): {', '.join(email_winners)}")
    print(f"Most phones ({max_phones}): {', '.join(phone_winners)}")
    print(f"Address found: {', '.join(address_winners) if address_winners else 'None'}")
    print(f"Fastest: {fastest['name']} ({fastest['time_taken']:.2f} seconds)")
    
    # Overall recommendation
    print("\nRECOMMENDATION:")
    
    # Score each method
    scores = {}
    for result in successful:
        name = result["name"]
        scores[name] = 0
        
        # Score for email finding
        if name in email_winners:
            scores[name] += 5
        elif len(result["contacts"]["emails"]) > 0:
            scores[name] += 3
            
        # Score for phone finding
        if name in phone_winners:
            scores[name] += 5
        elif len(result["contacts"]["phones"]) > 0:
            scores[name] += 3
            
        # Score for address finding
        if name in address_winners:
            scores[name] += 5
            
        # Score for speed (1-5 points, with fastest getting 5)
        if result["time_taken"] == fastest["time_taken"]:
            scores[name] += 5
        else:
            # Calculate relative speed score
            relative_speed = 1 - min((result["time_taken"] / fastest["time_taken"] - 1), 1)
            scores[name] += max(1, int(relative_speed * 5))
    
    # Get winner
    if scores:
        winner = max(scores.items(), key=lambda x: x[1])
        print(f"Based on data quality and performance, {winner[0]} is the recommended method for this URL.")
        
        # Special hybrid recommendation
        undetected_score = scores.get("Undetected ChromeDriver", 0)
        firecrawl_score = scores.get("Firecrawl API", 0)
        
        if undetected_score > 0 and firecrawl_score > 0:
            print("\nHYBRID APPROACH RECOMMENDATION:")
            print("Consider using the Hybrid Extractor which tries Undetected ChromeDriver first")
            print("and falls back to Firecrawl API when needed. This gives the best balance of:")
            print("  - Speed (Undetected ChromeDriver is faster when it works)")
            print("  - Reliability (Firecrawl API has higher success rates)")
            print("  - Cost-effectiveness (only use Firecrawl API when necessary)")
    
    print("="*80)

def main():
    parser = argparse.ArgumentParser(description='Compare all extraction methods')
    parser.add_argument('url', help='URL to test extraction on')
    parser.add_argument('--api-key', default="fc-73aeb0d1ae814693ba39bdbafbbd505d", help='Firecrawl API key')
    parser.add_argument('--headless', action='store_true', default=True, help='Run in headless mode')
    args = parser.parse_args()
    
    # Initialize the results array
    results = []
    
    # Try to import the original ContactExtractor
    ContactExtractor = try_import_contact_extractor()
    
    # Test the original Selenium extractor if available
    if ContactExtractor:
        try:
            logger.info("Initializing original Selenium extractor...")
            selenium_extractor = ContactExtractor(headless=args.headless)
            selenium_result = run_extractor("Standard Selenium", selenium_extractor, args.url)
            results.append(selenium_result)
        except Exception as e:
            logger.error(f"Error setting up original Selenium extractor: {str(e)}")
        finally:
            if 'selenium_extractor' in locals():
                selenium_extractor.cleanup()
    
    # Test undetected-chromedriver
    try:
        logger.info("Initializing Undetected ChromeDriver extractor...")
        undetected_extractor = UndetectedExtractor(headless=args.headless)
        undetected_result = run_extractor("Undetected ChromeDriver", undetected_extractor, args.url)
        results.append(undetected_result)
    except Exception as e:
        logger.error(f"Error setting up Undetected ChromeDriver extractor: {str(e)}")
    finally:
        if 'undetected_extractor' in locals():
            undetected_extractor.cleanup()
    
    # Test Firecrawl API
    try:
        logger.info("Initializing Firecrawl API extractor...")
        firecrawl_extractor = FirecrawlExtractor(api_key=args.api_key)
        firecrawl_result = run_extractor("Firecrawl API", firecrawl_extractor, args.url)
        results.append(firecrawl_result)
    except Exception as e:
        logger.error(f"Error setting up Firecrawl API extractor: {str(e)}")
    finally:
        if 'firecrawl_extractor' in locals():
            firecrawl_extractor.cleanup()
    
    # Summarize the results
    summarize_results(results)
    
    # Save results to file
    try:
        with open("extractor_comparison_results.json", "w") as f:
            json.dump(results, f, indent=2, default=str)
        logger.info("Results saved to extractor_comparison_results.json")
    except Exception as e:
        logger.error(f"Error saving results: {str(e)}")

if __name__ == "__main__":
    main()