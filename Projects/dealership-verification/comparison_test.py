# comparison_test.py
from contact_extractor import ContactExtractor
from firecrawl_extractor_simple import FirecrawlExtractor
import time
import json
import pandas as pd
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("comparison_test")

def run_comparison(urls, api_key):
    """
    Run a comparison test between Selenium and Firecrawl for extracting contact information
    from dealership websites.
    
    Args:
        urls (list): List of URLs to test
        api_key (str): Firecrawl API key
        
    Returns:
        dict: Results of the comparison
    """
    logger.info(f"Starting comparison test for {len(urls)} URLs")
    
    # Initialize extractors
    selenium_extractor = ContactExtractor(headless=True)
    firecrawl_extractor = FirecrawlExtractor(api_key=api_key)
    
    results = []
    
    for url in urls:
        logger.info(f"Testing URL: {url}")
        result = {
            "url": url,
            "selenium": {
                "success": False,
                "time_taken": 0,
                "emails_count": 0,
                "phones_count": 0,
                "has_address": False,
                "error": None
            },
            "firecrawl": {
                "success": False,
                "time_taken": 0,
                "emails_count": 0,
                "phones_count": 0,
                "has_address": False,
                "error": None
            }
        }
        
        # Test Selenium extraction
        try:
            logger.info(f"Running Selenium extraction for {url}")
            start_time = time.time()
            selenium_result = selenium_extractor.extract_contacts(url)
            end_time = time.time()
            
            result["selenium"]["success"] = True
            result["selenium"]["time_taken"] = end_time - start_time
            result["selenium"]["emails_count"] = len(selenium_result.get("emails", []))
            result["selenium"]["phones_count"] = len(selenium_result.get("phones", []))
            result["selenium"]["has_address"] = selenium_result.get("address") is not None
            
            logger.info(f"Selenium extraction successful: {result['selenium']['emails_count']} emails, "
                        f"{result['selenium']['phones_count']} phones, "
                        f"address: {result['selenium']['has_address']}")
            
        except Exception as e:
            end_time = time.time()
            result["selenium"]["time_taken"] = end_time - start_time
            result["selenium"]["error"] = str(e)
            logger.error(f"Selenium extraction failed: {str(e)}")
        
        # Test Firecrawl extraction
        try:
            logger.info(f"Running Firecrawl extraction for {url}")
            start_time = time.time()
            firecrawl_result = firecrawl_extractor.extract_contacts(url)
            end_time = time.time()
            
            result["firecrawl"]["success"] = True
            result["firecrawl"]["time_taken"] = end_time - start_time
            result["firecrawl"]["emails_count"] = len(firecrawl_result.get("emails", []))
            result["firecrawl"]["phones_count"] = len(firecrawl_result.get("phones", []))
            result["firecrawl"]["has_address"] = firecrawl_result.get("address") is not None
            
            logger.info(f"Firecrawl extraction successful: {result['firecrawl']['emails_count']} emails, "
                        f"{result['firecrawl']['phones_count']} phones, "
                        f"address: {result['firecrawl']['has_address']}")
            
        except Exception as e:
            end_time = time.time()
            result["firecrawl"]["time_taken"] = end_time - start_time
            result["firecrawl"]["error"] = str(e)
            logger.error(f"Firecrawl extraction failed: {str(e)}")
        
        results.append(result)
    
    # Clean up
    selenium_extractor.cleanup()
    firecrawl_extractor.cleanup()
    
    return results

def save_results(results, filename=None):
    """
    Save the comparison results to a JSON file and generate a summary
    
    Args:
        results (dict): Results of the comparison
        filename (str, optional): Filename to save the results to
    """
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"comparison_results_{timestamp}.json"
    
    with open(filename, "w") as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Results saved to {filename}")
    
    # Create a summary of the results
    total_urls = len(results)
    selenium_success = sum(1 for r in results if r["selenium"]["success"])
    firecrawl_success = sum(1 for r in results if r["firecrawl"]["success"])
    
    selenium_avg_time = sum(r["selenium"]["time_taken"] for r in results) / total_urls
    firecrawl_avg_time = sum(r["firecrawl"]["time_taken"] for r in results) / total_urls
    
    selenium_emails = sum(r["selenium"]["emails_count"] for r in results if r["selenium"]["success"])
    firecrawl_emails = sum(r["firecrawl"]["emails_count"] for r in results if r["firecrawl"]["success"])
    
    selenium_phones = sum(r["selenium"]["phones_count"] for r in results if r["selenium"]["success"])
    firecrawl_phones = sum(r["firecrawl"]["phones_count"] for r in results if r["firecrawl"]["success"])
    
    selenium_addresses = sum(1 for r in results if r["selenium"]["has_address"])
    firecrawl_addresses = sum(1 for r in results if r["firecrawl"]["has_address"])
    
    # Print the summary
    print("\n" + "="*80)
    print("COMPARISON RESULTS SUMMARY")
    print("="*80)
    print(f"Total URLs tested: {total_urls}")
    print("\nSuccess Rates:")
    print(f"  Selenium:  {selenium_success}/{total_urls} ({selenium_success/total_urls*100:.1f}%)")
    print(f"  Firecrawl: {firecrawl_success}/{total_urls} ({firecrawl_success/total_urls*100:.1f}%)")
    
    print("\nAverage Extraction Time:")
    print(f"  Selenium:  {selenium_avg_time:.2f} seconds")
    print(f"  Firecrawl: {firecrawl_avg_time:.2f} seconds")
    print(f"  Difference: {'Selenium' if selenium_avg_time < firecrawl_avg_time else 'Firecrawl'} is {abs(selenium_avg_time - firecrawl_avg_time):.2f} seconds faster")
    
    print("\nData Extraction (total across all successful extractions):")
    print("  Emails:")
    print(f"    Selenium:  {selenium_emails} ({selenium_emails/selenium_success:.1f} per success)" if selenium_success > 0 else "    Selenium:  0")
    print(f"    Firecrawl: {firecrawl_emails} ({firecrawl_emails/firecrawl_success:.1f} per success)" if firecrawl_success > 0 else "    Firecrawl: 0")
    
    print("  Phones:")
    print(f"    Selenium:  {selenium_phones} ({selenium_phones/selenium_success:.1f} per success)" if selenium_success > 0 else "    Selenium:  0")
    print(f"    Firecrawl: {firecrawl_phones} ({firecrawl_phones/firecrawl_success:.1f} per success)" if firecrawl_success > 0 else "    Firecrawl: 0")
    
    print("  Addresses:")
    print(f"    Selenium:  {selenium_addresses}/{selenium_success} ({selenium_addresses/selenium_success*100:.1f}%)" if selenium_success > 0 else "    Selenium:  0")
    print(f"    Firecrawl: {firecrawl_addresses}/{firecrawl_success} ({firecrawl_addresses/firecrawl_success*100:.1f}%)" if firecrawl_success > 0 else "    Firecrawl: 0")
    
    print("\nConclusion:")
    # Success rate comparison
    if firecrawl_success > selenium_success:
        print("✅ Firecrawl has a HIGHER SUCCESS RATE than Selenium")
    elif firecrawl_success < selenium_success:
        print("⚠️ Firecrawl has a LOWER SUCCESS RATE than Selenium")
    else:
        print("ℹ️ Firecrawl and Selenium have EQUAL SUCCESS RATES")
        
    # Speed comparison
    if firecrawl_avg_time < selenium_avg_time:
        print("✅ Firecrawl is FASTER than Selenium")
    elif firecrawl_avg_time > selenium_avg_time:
        print("⚠️ Firecrawl is SLOWER than Selenium")
    else:
        print("ℹ️ Firecrawl and Selenium have SIMILAR PERFORMANCE")
    
    # Data extraction comparison (emails)
    if selenium_success > 0 and firecrawl_success > 0:
        selenium_emails_per_success = selenium_emails / selenium_success
        firecrawl_emails_per_success = firecrawl_emails / firecrawl_success
        
        if firecrawl_emails_per_success > selenium_emails_per_success:
            print("✅ Firecrawl finds MORE EMAILS per successful extraction")
        elif firecrawl_emails_per_success < selenium_emails_per_success:
            print("⚠️ Firecrawl finds FEWER EMAILS per successful extraction")
        else:
            print("ℹ️ Firecrawl and Selenium find a SIMILAR NUMBER OF EMAILS")
    
    print("="*80)
    
    # Save detailed summary as CSV
    url_results = []
    for r in results:
        url_results.append({
            "URL": r["url"],
            "Selenium_Success": r["selenium"]["success"],
            "Selenium_Time": r["selenium"]["time_taken"],
            "Selenium_Emails": r["selenium"]["emails_count"],
            "Selenium_Phones": r["selenium"]["phones_count"],
            "Selenium_Address": r["selenium"]["has_address"],
            "Firecrawl_Success": r["firecrawl"]["success"],
            "Firecrawl_Time": r["firecrawl"]["time_taken"],
            "Firecrawl_Emails": r["firecrawl"]["emails_count"],
            "Firecrawl_Phones": r["firecrawl"]["phones_count"],
            "Firecrawl_Address": r["firecrawl"]["has_address"],
        })
    
    csv_filename = filename.replace(".json", ".csv")
    pd.DataFrame(url_results).to_csv(csv_filename, index=False)
    print(f"Detailed results saved to {csv_filename}")
    
    return {
        "total_urls": total_urls,
        "selenium_success": selenium_success,
        "firecrawl_success": firecrawl_success,
        "selenium_avg_time": selenium_avg_time,
        "firecrawl_avg_time": firecrawl_avg_time,
    }