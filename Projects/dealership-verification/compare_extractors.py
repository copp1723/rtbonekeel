#!/usr/bin/env python3
"""
Comparison script to evaluate Selenium-based extraction vs. Firecrawl-based extraction.
This script will:
1. Load a list of dealership URLs
2. Run both extractors on the same set of URLs
3. Compare results for coverage, quality, and performance
4. Output a comparison report
"""

import pandas as pd
import time
import argparse
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import os
import sys

# Import the extractors
from contact_extractor import ContactExtractor
from firecrawl_extractor import FirecrawlExtractor

class ExtractorComparison:
    def __init__(self, api_key, sample_size=10, headless=True, timeout=30):
        self.api_key = api_key
        self.sample_size = sample_size
        self.headless = headless
        self.timeout = timeout
        
        # Initialize extractors
        self.selenium_extractor = ContactExtractor(headless=headless, timeout=timeout)
        self.firecrawl_extractor = FirecrawlExtractor(api_key=api_key, timeout=timeout)
        
        # Results storage
        self.results = {
            "selenium": [],
            "firecrawl": [],
            "comparison": []
        }
        
    def load_urls(self, csv_path):
        """Load dealership URLs from a CSV file"""
        print(f"Loading dealership data from {csv_path}...")
        
        df = pd.read_csv(csv_path)
        if 'Website' not in df.columns:
            raise ValueError(f"CSV file must contain a 'Website' column. Found columns: {df.columns.tolist()}")
        
        # Filter out empty or invalid URLs
        df = df[df['Website'].notna() & df['Website'].str.strip().astype(bool)]
        
        # Take a sample
        sample_size = min(self.sample_size, len(df))
        sample_df = df.sample(sample_size) if sample_size < len(df) else df
        print(f"Selected sample of {len(sample_df)} dealerships for comparison")
        
        return sample_df
    
    def run_comparison(self, sample_df):
        """Run both extractors on the same set of URLs and compare results"""
        print("\n📊 Starting extractor comparison...")
        print("This will run both the Selenium-based extractor and the Firecrawl-based extractor")
        print(f"on {len(sample_df)} dealership websites and compare the results.\n")
        
        # Track metrics
        metrics = {
            "selenium": {
                "success_count": 0,
                "failure_count": 0,
                "total_time": 0,
                "email_count": 0,
                "phone_count": 0,
                "address_count": 0
            },
            "firecrawl": {
                "success_count": 0,
                "failure_count": 0,
                "total_time": 0,
                "email_count": 0,
                "phone_count": 0,
                "address_count": 0
            }
        }
        
        # Process each URL
        for idx, row in tqdm(sample_df.iterrows(), total=len(sample_df), desc="Processing URLs"):
            url = row['Website']
            dealership_name = row.get('Dealership', f"Dealership {idx}")
            
            # Ensure URL has http/https prefix
            if not url.startswith(('http://', 'https://')):
                url = f'https://{url}'
            
            # Create result entry
            result_entry = {
                "dealership": dealership_name,
                "url": url,
                "selenium": {
                    "success": False,
                    "time_taken": 0,
                    "emails": [],
                    "phones": [],
                    "address": None,
                    "error": None
                },
                "firecrawl": {
                    "success": False,
                    "time_taken": 0,
                    "emails": [],
                    "phones": [],
                    "address": None,
                    "error": None
                }
            }
            
            # Run Selenium extractor
            print(f"\nExtracting from {url} using Selenium...")
            selenium_start = time.time()
            try:
                selenium_contacts = self.selenium_extractor.extract_contacts(url)
                selenium_time = time.time() - selenium_start
                
                result_entry["selenium"].update({
                    "success": True,
                    "time_taken": selenium_time,
                    "emails": selenium_contacts.get("emails", []),
                    "phones": selenium_contacts.get("phones", []),
                    "address": selenium_contacts.get("address")
                })
                
                metrics["selenium"]["success_count"] += 1
                metrics["selenium"]["total_time"] += selenium_time
                metrics["selenium"]["email_count"] += len(selenium_contacts.get("emails", []))
                metrics["selenium"]["phone_count"] += len(selenium_contacts.get("phones", []))
                metrics["selenium"]["address_count"] += 1 if selenium_contacts.get("address") else 0
                
                print(f"  ✅ Selenium extraction successful in {selenium_time:.2f}s")
                print(f"  Found {len(selenium_contacts.get('emails', []))} emails, {len(selenium_contacts.get('phones', []))} phones")
                
            except Exception as e:
                selenium_time = time.time() - selenium_start
                result_entry["selenium"]["time_taken"] = selenium_time
                result_entry["selenium"]["error"] = str(e)
                metrics["selenium"]["failure_count"] += 1
                metrics["selenium"]["total_time"] += selenium_time
                print(f"  ❌ Selenium extraction failed: {str(e)}")
            
            # Run Firecrawl extractor
            print(f"Extracting from {url} using Firecrawl...")
            firecrawl_start = time.time()
            try:
                firecrawl_contacts = self.firecrawl_extractor.extract_contacts(url)
                firecrawl_time = time.time() - firecrawl_start
                
                result_entry["firecrawl"].update({
                    "success": True,
                    "time_taken": firecrawl_time,
                    "emails": firecrawl_contacts.get("emails", []),
                    "phones": firecrawl_contacts.get("phones", []),
                    "address": firecrawl_contacts.get("address")
                })
                
                metrics["firecrawl"]["success_count"] += 1
                metrics["firecrawl"]["total_time"] += firecrawl_time
                metrics["firecrawl"]["email_count"] += len(firecrawl_contacts.get("emails", []))
                metrics["firecrawl"]["phone_count"] += len(firecrawl_contacts.get("phones", []))
                metrics["firecrawl"]["address_count"] += 1 if firecrawl_contacts.get("address") else 0
                
                print(f"  ✅ Firecrawl extraction successful in {firecrawl_time:.2f}s")
                print(f"  Found {len(firecrawl_contacts.get('emails', []))} emails, {len(firecrawl_contacts.get('phones', []))} phones")
                
            except Exception as e:
                firecrawl_time = time.time() - firecrawl_start
                result_entry["firecrawl"]["time_taken"] = firecrawl_time
                result_entry["firecrawl"]["error"] = str(e)
                metrics["firecrawl"]["failure_count"] += 1
                metrics["firecrawl"]["total_time"] += firecrawl_time
                print(f"  ❌ Firecrawl extraction failed: {str(e)}")
            
            # Compare results
            if result_entry["selenium"]["success"] and result_entry["firecrawl"]["success"]:
                # Calculate comparison metrics
                common_emails = set(result_entry["selenium"]["emails"]).intersection(set(result_entry["firecrawl"]["emails"]))
                common_phones = set(result_entry["selenium"]["phones"]).intersection(set(result_entry["firecrawl"]["phones"]))
                
                result_entry["comparison"] = {
                    "faster_method": "selenium" if result_entry["selenium"]["time_taken"] < result_entry["firecrawl"]["time_taken"] else "firecrawl",
                    "time_difference": abs(result_entry["selenium"]["time_taken"] - result_entry["firecrawl"]["time_taken"]),
                    "common_emails": len(common_emails),
                    "common_phones": len(common_phones),
                    "address_match": (result_entry["selenium"]["address"] is not None) == (result_entry["firecrawl"]["address"] is not None)
                }
            
            # Add to results
            self.results["comparison"].append(result_entry)
        
        # Calculate summary metrics
        self.calculate_summary_metrics(metrics)
        
        return self.results
    
    def calculate_summary_metrics(self, metrics):
        """Calculate summary metrics from the comparison results"""
        selenium_success_rate = metrics["selenium"]["success_count"] / (metrics["selenium"]["success_count"] + metrics["selenium"]["failure_count"]) if (metrics["selenium"]["success_count"] + metrics["selenium"]["failure_count"]) > 0 else 0
        firecrawl_success_rate = metrics["firecrawl"]["success_count"] / (metrics["firecrawl"]["success_count"] + metrics["firecrawl"]["failure_count"]) if (metrics["firecrawl"]["success_count"] + metrics["firecrawl"]["failure_count"]) > 0 else 0
        
        selenium_avg_time = metrics["selenium"]["total_time"] / metrics["selenium"]["success_count"] if metrics["selenium"]["success_count"] > 0 else 0
        firecrawl_avg_time = metrics["firecrawl"]["total_time"] / metrics["firecrawl"]["success_count"] if metrics["firecrawl"]["success_count"] > 0 else 0
        
        # Count how many times each method was faster
        faster_counts = {"selenium": 0, "firecrawl": 0, "tie": 0}
        for result in self.results["comparison"]:
            if "comparison" in result and "faster_method" in result["comparison"]:
                faster_counts[result["comparison"]["faster_method"]] += 1
        
        self.summary = {
            "total_urls": len(self.results["comparison"]),
            "selenium": {
                "success_count": metrics["selenium"]["success_count"],
                "failure_count": metrics["selenium"]["failure_count"],
                "success_rate": selenium_success_rate,
                "avg_time": selenium_avg_time,
                "email_count": metrics["selenium"]["email_count"],
                "phone_count": metrics["selenium"]["phone_count"],
                "address_count": metrics["selenium"]["address_count"]
            },
            "firecrawl": {
                "success_count": metrics["firecrawl"]["success_count"],
                "failure_count": metrics["firecrawl"]["failure_count"],
                "success_rate": firecrawl_success_rate,
                "avg_time": firecrawl_avg_time,
                "email_count": metrics["firecrawl"]["email_count"],
                "phone_count": metrics["firecrawl"]["phone_count"],
                "address_count": metrics["firecrawl"]["address_count"]
            },
            "comparison": {
                "faster_counts": faster_counts,
                "avg_time_difference": sum([r["comparison"]["time_difference"] for r in self.results["comparison"] if "comparison" in r and "time_difference" in r["comparison"]]) / len([r for r in self.results["comparison"] if "comparison" in r and "time_difference" in r["comparison"]]) if len([r for r in self.results["comparison"] if "comparison" in r and "time_difference" in r["comparison"]]) > 0 else 0
            }
        }
        
        return self.summary
    
    def print_summary(self):
        """Print a summary of the comparison results"""
        if not hasattr(self, 'summary'):
            print("No summary available. Run comparison first.")
            return
        
        print("\n" + "="*80)
        print("📊 EXTRACTOR COMPARISON SUMMARY")
        print("="*80)
        
        print(f"\nTotal URLs tested: {self.summary['total_urls']}")
        
        print("\n📈 SUCCESS RATES:")
        print(f"  Selenium:  {self.summary['selenium']['success_rate']*100:.1f}% ({self.summary['selenium']['success_count']}/{self.summary['total_urls']})")
        print(f"  Firecrawl: {self.summary['firecrawl']['success_rate']*100:.1f}% ({self.summary['firecrawl']['success_count']}/{self.summary['total_urls']})")
        
        print("\n⏱️ PERFORMANCE:")
        print(f"  Selenium average time:  {self.summary['selenium']['avg_time']:.2f}s")
        print(f"  Firecrawl average time: {self.summary['firecrawl']['avg_time']:.2f}s")
        print(f"  Average time difference: {self.summary['comparison']['avg_time_difference']:.2f}s")
        print(f"  Faster method counts:")
        print(f"    - Selenium:  {self.summary['comparison']['faster_counts']['selenium']}")
        print(f"    - Firecrawl: {self.summary['comparison']['faster_counts']['firecrawl']}")
        
        print("\n📧 DATA EXTRACTION RESULTS:")
        print(f"  Emails found:")
        print(f"    - Selenium:  {self.summary['selenium']['email_count']} (avg: {self.summary['selenium']['email_count']/self.summary['selenium']['success_count']:.2f} per success)" if self.summary['selenium']['success_count'] > 0 else "    - Selenium:  0")
        print(f"    - Firecrawl: {self.summary['firecrawl']['email_count']} (avg: {self.summary['firecrawl']['email_count']/self.summary['firecrawl']['success_count']:.2f} per success)" if self.summary['firecrawl']['success_count'] > 0 else "    - Firecrawl: 0")
        
        print(f"  Phones found:")
        print(f"    - Selenium:  {self.summary['selenium']['phone_count']} (avg: {self.summary['selenium']['phone_count']/self.summary['selenium']['success_count']:.2f} per success)" if self.summary['selenium']['success_count'] > 0 else "    - Selenium:  0")
        print(f"    - Firecrawl: {self.summary['firecrawl']['phone_count']} (avg: {self.summary['firecrawl']['phone_count']/self.summary['firecrawl']['success_count']:.2f} per success)" if self.summary['firecrawl']['success_count'] > 0 else "    - Firecrawl: 0")
        
        print(f"  Addresses found:")
        print(f"    - Selenium:  {self.summary['selenium']['address_count']} ({self.summary['selenium']['address_count']/self.summary['selenium']['success_count']*100:.1f}% of successes)" if self.summary['selenium']['success_count'] > 0 else "    - Selenium:  0")
        print(f"    - Firecrawl: {self.summary['firecrawl']['address_count']} ({self.summary['firecrawl']['address_count']/self.summary['firecrawl']['success_count']*100:.1f}% of successes)" if self.summary['firecrawl']['success_count'] > 0 else "    - Firecrawl: 0")
        
        print("\n" + "="*80)
        print("CONCLUSION:")
        if self.summary['firecrawl']['success_rate'] > self.summary['selenium']['success_rate']:
            print("✅ Firecrawl has a HIGHER SUCCESS RATE than Selenium")
        elif self.summary['firecrawl']['success_rate'] < self.summary['selenium']['success_rate']:
            print("⚠️ Firecrawl has a LOWER SUCCESS RATE than Selenium")
        else:
            print("ℹ️ Firecrawl and Selenium have EQUAL SUCCESS RATES")
            
        if self.summary['firecrawl']['avg_time'] < self.summary['selenium']['avg_time']:
            print("✅ Firecrawl is FASTER than Selenium")
        elif self.summary['firecrawl']['avg_time'] > self.summary['selenium']['avg_time']:
            print("⚠️ Firecrawl is SLOWER than Selenium")
        else:
            print("ℹ️ Firecrawl and Selenium have SIMILAR PERFORMANCE")
            
        emails_per_success_selenium = self.summary['selenium']['email_count']/self.summary['selenium']['success_count'] if self.summary['selenium']['success_count'] > 0 else 0
        emails_per_success_firecrawl = self.summary['firecrawl']['email_count']/self.summary['firecrawl']['success_count'] if self.summary['firecrawl']['success_count'] > 0 else 0
        
        if emails_per_success_firecrawl > emails_per_success_selenium:
            print("✅ Firecrawl finds MORE EMAILS per successful extraction")
        elif emails_per_success_firecrawl < emails_per_success_selenium:
            print("⚠️ Firecrawl finds FEWER EMAILS per successful extraction")
        else:
            print("ℹ️ Firecrawl and Selenium find a SIMILAR NUMBER OF EMAILS")
        
        print("="*80)
    
    def save_results(self, output_path):
        """Save results to a JSON file"""
        if not hasattr(self, 'summary'):
            print("No results available. Run comparison first.")
            return
        
        output_data = {
            "summary": self.summary,
            "detailed_results": self.results["comparison"]
        }
        
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"\nDetailed results saved to {output_path}")
    
    def cleanup(self):
        """Clean up resources"""
        try:
            self.selenium_extractor.cleanup()
            print("Resources cleaned up")
        except Exception as e:
            print(f"Error during cleanup: {str(e)}")


def main():
    parser = argparse.ArgumentParser(description='Compare Selenium-based and Firecrawl-based contact extraction')
    parser.add_argument('input_file', help='Path to the dealership data CSV file')
    parser.add_argument('--api-key', help='Firecrawl API key', required=True)
    parser.add_argument('--sample', type=int, default=5, help='Number of dealerships to sample')
    parser.add_argument('--output', default='extractor_comparison.json', help='Output file path for detailed results')
    parser.add_argument('--headless', action='store_true', help='Run Selenium in headless mode', default=True)
    args = parser.parse_args()
    
    try:
        # Create comparison object
        comparison = ExtractorComparison(
            api_key=args.api_key,
            sample_size=args.sample,
            headless=args.headless
        )
        
        # Load URLs
        sample_df = comparison.load_urls(args.input_file)
        
        # Run comparison
        comparison.run_comparison(sample_df)
        
        # Print summary
        comparison.print_summary()
        
        # Save results
        comparison.save_results(args.output)
        
    except Exception as e:
        print(f"Error during comparison: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if 'comparison' in locals():
            comparison.cleanup()

if __name__ == "__main__":
    main()