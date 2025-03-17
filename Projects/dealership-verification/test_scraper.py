#!/usr/bin/env python3
"""
Test script for the enhanced dealership scraper
"""

import sys
import json
from dealership_scraper import DealershipScraper


def test_dealership(url, visible=False, debug=True):
    """Test the scraper with a single dealership URL"""
    print(f"Testing scraper on: {url}")
    
    # Create and run the scraper with debug mode enabled
    scraper = DealershipScraper(headless=not visible, debug=debug)
    results = scraper.scrape_dealership(url)
    
    # Print results summary
    if results["success"]:
        print(f"\n✅ Successfully scraped {results['staff_count']} staff members from {url}")
        
        # Print staff with emails
        staff_with_emails = [s for s in results["staff"] if s.get("email")]
        print(f"\nFound {len(staff_with_emails)} staff members with email addresses:")
        
        for staff in staff_with_emails:
            print(f"- {staff.get('name', 'Unknown')}: {staff.get('email')}")
            
        # Calculate email coverage
        if results['staff_count'] > 0:
            email_coverage = (len(staff_with_emails) / results['staff_count']) * 100
            print(f"\nEmail coverage: {email_coverage:.1f}% ({len(staff_with_emails)}/{results['staff_count']})")
        
        # Print extraction method stats
        print("\nExtraction method stats:")
        for method, count in scraper.contact_extractor.stats.items():
            if method != "emails_found" and count > 0:
                print(f"- {method}: {count}")
    else:
        print(f"\n❌ Failed to scrape {url}: {results.get('error', 'Unknown error')}")
    
    return results


def main():
    """Main function"""
    # Check if URL was provided
    if len(sys.argv) < 2:
        print("Usage: python test_scraper.py <dealership_url> [--visible]")
        return 1
    
    url = sys.argv[1]
    visible = "--visible" in sys.argv
    
    # Run the test
    results = test_dealership(url, visible)
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("\nResults saved to test_results.json")
    
    return 0


if __name__ == "__main__":
    sys.exit(main()) 