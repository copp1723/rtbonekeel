#!/usr/bin/env python3
"""
Test script to verify dealership extraction enhancements
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime

# Import our enhanced modules
from logging_config import configure_logging
from debug_helper import DebugHelper
from contact_extractor import ContactExtractor


def test_extraction(url, debug_mode=False, capture_screenshots=False):
    """Test the enhanced extraction capabilities on a single URL"""
    # Configure logging
    logging_config = configure_logging()
    logger = logging_config.get_logger("verification_test")
    
    if debug_mode:
        logging_config.set_debug_mode(True)
        logger.debug("Debug mode enabled")
    
    # Initialize debug helper
    debug_helper = DebugHelper()
    
    # Create a timestamp for this test
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Extract dealership name from URL
    dealership_name = url.replace("https://", "").replace("http://", "").split("/")[0]
    
    logger.info(f"Testing enhanced extraction on: {url}")
    
    try:
        # Initialize contact extractor
        contact_extractor = ContactExtractor(headless=not capture_screenshots)
        
        start_time = time.time()
        
        # Extract contacts
        contacts = contact_extractor.extract_contacts(url)
        
        elapsed_time = time.time() - start_time
        
        # Print results
        print(f"\n=== Extraction Results for {url} ===")
        print(f"Completed in {elapsed_time:.2f} seconds")
        
        # Print found emails
        emails = contacts.get('emails', [])
        print(f"\nFound {len(emails)} emails:")
        for email in emails:
            print(f"- {email}")
        
        # Print extraction method stats
        print("\nExtraction method stats:")
        for method, count in contact_extractor.stats.items():
            if method != "emails_found" and count > 0:
                print(f"- {method}: {count}")
        
        # If debug mode, capture page state and analyze
        if debug_mode:
            print("\nRunning email presence analysis...")
            analysis = debug_helper.analyze_email_presence(contact_extractor.driver)
            print("Analysis findings:")
            for pattern, findings in analysis.get('findings', {}).items():
                print(f"- Pattern '{pattern}': {len(findings)} matches")
        
        # If capture screenshots, save page state
        if capture_screenshots:
            print("\nCapturing page state...")
            debug_helper.capture_page_state(
                contact_extractor.driver,
                dealership_name,
                timestamp
            )
            print("Page state captured")
        
        # Save results to file
        results = {
            'url': url,
            'timestamp': timestamp,
            'elapsed_time': elapsed_time,
            'emails': emails,
            'phones': contacts.get('phones', []),
            'address': contacts.get('address'),
            'extraction_stats': contact_extractor.stats
        }
        
        output_file = f"extraction_results_{dealership_name}_{timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\nResults saved to: {output_file}")
        
        return True
    
    except Exception as e:
        logger.error(f"Error during extraction test: {str(e)}")
        print(f"\n❌ Error: {str(e)}")
        return False
    
    finally:
        # Clean up
        if 'contact_extractor' in locals():
            contact_extractor.cleanup()


def main():
    parser = argparse.ArgumentParser(description="Test enhanced dealership extraction")
    parser.add_argument("url", help="URL of the dealership website to test")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode with extra logging")
    parser.add_argument("--screenshots", action="store_true", help="Capture screenshots and HTML during extraction")
    
    args = parser.parse_args()
    
    success = test_extraction(args.url, args.debug, args.screenshots)
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main()) 