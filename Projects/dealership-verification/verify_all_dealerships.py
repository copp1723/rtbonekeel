#!/usr/bin/env python3

import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import time
from datetime import datetime
import os
import sys
import argparse
from fuzzywuzzy import process, fuzz
import json
import re
import random
import socket
from typing import Dict, Any, List, Tuple, Optional
from urllib.parse import urlparse
import threading
import queue
import signal
from filelock import FileLock

# Import custom modules for contact extraction, logging and error handling
from contact_extractor import ContactExtractor
from log_manager import get_logger, with_logging, LogSynchronizer
from error_handler import (
    retry_with_backoff, 
    ResourceGuard, 
    ProcessSupervisor,
    ErrorTracker,
    handle_network_error,
    CircuitOpenException
)

# Import Selenium and BeautifulSoup for contact scraping
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from webdriver_manager.chrome import ChromeDriverManager
    from bs4 import BeautifulSoup
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    get_logger(__name__).warning("Selenium and/or BeautifulSoup not installed. Contact scraping will be disabled.")
    get_logger(__name__).warning("Install with: pip install selenium webdriver-manager beautifulsoup4")

# Get a properly synchronized logger
logger = get_logger(__name__)

# Mapping dictionaries for standardization
STATE_MAPPING = {
    'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR',
    'CALIFORNIA': 'CA', 'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE',
    'FLORIDA': 'FL', 'GEORGIA': 'GA', 'HAWAII': 'HI', 'IDAHO': 'ID',
    'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA', 'KANSAS': 'KS',
    'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
    'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS',
    'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV',
    'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
    'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK',
    'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
    'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT',
    'VERMONT': 'VT', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV',
    'WISCONSIN': 'WI', 'WYOMING': 'WY', 'DISTRICT OF COLUMBIA': 'DC'
}

CAR_BRAND_ABBREVIATIONS = {
    'Gmc': 'GMC',
    'Bmw': 'BMW',
    'Vw': 'VW',
    'Mercedes Benz': 'Mercedes-Benz',
    'Kia Motors': 'KIA',
    'Gm': 'GM',
    'Buik': 'Buick',
    'Cadilac': 'Cadillac',
    'Chevrolet': 'Chevy',
    'Chrysler Dodge Jeep Ram': 'CDJR',
    'Chrysler Dodge Jeep': 'CDJ',
}

# Staff page related constants
STAFF_PAGE_KEYWORDS = [
    "meet the team",
    "our team", 
    "meet our team",
    "staff",
    "team",
    "leadership",
    "executive team",
    "management team",
    "dealership team",
    "about us",
    "contact us"
]

# Define automotive leadership titles by category
EXECUTIVE_TITLES = {
    "Executive Level": [
        "ceo", "chief executive officer",
        "coo", "chief operating officer",
        "cmo", "chief marketing officer",
        "president", "vice president", "vp",
        "owner", "dealer principal", "managing partner", "partner",
        "founder", "chief", "executive"
    ],
    "Dealership Management": [
        "general manager", "gm",
        "platform general manager",
        "executive manager",
        "general sales manager",
        "executive gm",
        "dealer operator"
    ],
    "Department Directors": [
        "bdc director", "bdc manager",
        "service director", "service manager",
        "fixed operations director", "fixed operations manager",
        "internet director",
        "marketing director", "marketing manager",
        "director", "managing director",
        "sales director"
    ]
}

class DealershipVerifier:
    def __init__(self, input_file, batch_size=50, max_workers=4, save_interval=50):
        # Initialize logger with correlation tracking
        self.logger = get_logger(__name__)
        self.log_sync = LogSynchronizer()
        self.correlation_id = self.log_sync.start_correlation()
        
        # Process supervision and resource tracking
        self.process_supervisor = ProcessSupervisor()
        self.error_tracker = ErrorTracker()
        
        # Basic configuration
        self.input_file = input_file
        self.batch_size = batch_size
        self.max_workers = max_workers
        self.save_interval = save_interval
        
        # Set up file paths with proper error handling
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.results_dir = os.path.join(self.base_dir, 'results')
        self.logs_dir = os.path.join(self.base_dir, 'logs')
        
        # Create required directories
        for directory in [self.results_dir, self.logs_dir]:
            try:
                os.makedirs(directory, exist_ok=True)
            except OSError as e:
                self.logger.error(f"Failed to create directory {directory}: {str(e)}")
                raise
        
        # Load manufacturer data
        self.manufacturer_data = {
            "Toyota": ["toyota", "lexus"],
            "Ford": ["ford", "lincoln"],
            "GM": ["chevrolet", "chevy", "gmc", "buick", "cadillac"],
            "Honda": ["honda", "acura"],
            "BMW": ["bmw", "mini"],
            "Mercedes": ["mercedes", "benz"],
            "Hyundai": ["hyundai", "genesis"],
            "Kia": ["kia"],
            "Stellantis": ["chrysler", "dodge", "jeep", "ram", "fiat"],
            "VW": ["volkswagen", "vw", "audi", "porsche"],
            "Nissan": ["nissan", "infiniti"],
            "Mazda": ["mazda"],
            "Subaru": ["subaru"],
            "Volvo": ["volvo"],
            "Jaguar Land Rover": ["jaguar", "land rover"],
            "Tesla": ["tesla"]
        }
        
        # Thread-safe progress tracking with lock
        self.progress_lock = threading.RLock()
        self.total_processed = 0
        self.active_websites = 0
        self.manufacturer_counts = {}
        self.failed_dealerships = []
        
        # Multi-processing and thread coordination
        self.executor = None  # Will be initialized when processing starts
        self.progress_queue = queue.Queue()
        self.stop_event = threading.Event()
        
        # Persistent job tracking
        self.job_id = None
        self.progress_file = os.path.join(self.base_dir, 'progress.json')
        self.progress_lock_file = f"{self.progress_file}.lock"
        
        # Register cleanup handler for graceful shutdown
        self.process_supervisor.register_cleanup_handler(self.cleanup)
        
        # Load existing progress with proper locking
        self.load_progress()
        
        self.logger.info(f"DealershipVerifier initialized with batch_size={batch_size}, max_workers={max_workers}")

    @with_logging
    def load_progress(self):
        """Load existing progress with file locking for thread safety."""
        try:
            with FileLock(self.progress_lock_file):
                if os.path.exists(self.progress_file):
                    with open(self.progress_file, 'r') as f:
                        progress = json.load(f)
                        with self.progress_lock:
                            self.total_processed = progress.get('total_processed', 0)
                            self.active_websites = progress.get('active_websites', 0)
                            self.manufacturer_counts = progress.get('manufacturer_counts', {})
                            self.failed_dealerships = progress.get('failed_dealerships', [])
                            self.job_id = progress.get('job_id')
                            
                    self.logger.info(f"Progress loaded: {self.total_processed} dealerships processed, " 
                                     f"{self.active_websites} active websites")
                else:
                    self.logger.info("No previous progress found, starting fresh")
        except Exception as e:
            self.logger.error(f"Error loading progress: {str(e)}")
            # Continue with default values if load fails

    @with_logging
    def save_progress(self):
        """Save current progress to file with thread-safe locking."""
        try:
            with self.progress_lock:
                progress = {
                    'total_processed': self.total_processed,
                    'active_websites': self.active_websites,
                    'manufacturer_counts': self.manufacturer_counts,
                    'failed_dealerships': self.failed_dealerships,
                    'job_id': self.job_id,
                    'last_updated': datetime.now().isoformat()
                }
            
            with FileLock(self.progress_lock_file):
                # Ensure atomic write with temp file
                temp_file = f"{self.progress_file}.tmp"
                with open(temp_file, 'w') as f:
                    json.dump(progress, f, indent=2)
                
                # Atomic file replacement
                os.replace(temp_file, self.progress_file)
                
            self.logger.info(f"Progress saved: {self.total_processed} dealerships processed")
        except Exception as e:
            self.logger.error(f"Error saving progress: {str(e)}")
            
    def cleanup(self):
        """Clean up resources during shutdown."""
        self.logger.info("Cleaning up resources...")
        self.save_progress()
        self.stop_event.set()
        
        # Additional cleanup can be added here as needed

    def clean_url(self, url):
        """Clean and standardize URL format."""
        if not url or pd.isna(url):
            return ""
        
        url = str(url).strip().lower()
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        return url

    @retry_with_backoff(max_retries=3, initial_backoff=1, max_backoff=15)
    def verify_url(self, url, resource_key=None):
        """Verify if a URL is active and accessible with improved error handling."""
        if not url or pd.isna(url):
            return False, None

        # Generate a resource key for the circuit breaker if not provided
        if resource_key is None:
            parsed_url = urlparse(url)
            resource_key = parsed_url.netloc if parsed_url.netloc else url
        
        # Check if the circuit is open for this domain
        if self.error_tracker.check_circuit(resource_key):
            self.logger.warning(f"Circuit breaker open for {resource_key}, skipping URL verification")
            return False, None
        
        # Use a randomized user agent for each request to avoid detection
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
        ]
        
        headers = {
            'User-Agent': random.choice(user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }
            
        try:
            url = self.clean_url(url)
            self.logger.debug(f"Verifying URL: {url}")
            
            # First try a HEAD request (faster)
            response = requests.head(url, headers=headers, allow_redirects=True, timeout=15)
            
            # If HEAD request doesn't return 200, try GET (some sites block HEAD requests)
            if response.status_code != 200:
                response = requests.get(url, headers=headers, allow_redirects=True, timeout=15, stream=True)
                # Close connection immediately after getting headers
                response.close()
            
            # Check if redirected to a login page or error page
            if any(x in response.url.lower() for x in [
                'login', 'error', '404', 'not-found', 'blocked', 'unavailable', 'robot'
            ]):
                self.logger.debug(f"URL {url} redirected to login/error page: {response.url}")
                return False, response.url
            
            # Check for anti-bot measures in response headers
            if 'cf-ray' in response.headers or 'captcha' in response.text.lower():
                self.logger.warning(f"Possible anti-bot protection detected for {url}")
                # Record the issue but still return the status based on HTTP code
                
            is_active = 200 <= response.status_code < 300
            return is_active, response.url
            
        except requests.RequestException as e:
            # Use our specialized error handler
            is_recoverable = handle_network_error(url, e)
            
            if not is_recoverable:
                # Record the error for circuit breaker tracking
                self.error_tracker.record_error(
                    resource_key, 
                    type(e).__name__, 
                    {'url': url, 'error': str(e)}
                )
            
            # Let the retry decorator handle retries
            raise
            
        except Exception as e:
            self.logger.error(f"Unexpected error verifying {url}: {str(e)}")
            # Record the error for circuit breaker tracking
            self.error_tracker.record_error(resource_key, type(e).__name__)
            raise

    @with_logging
    def identify_manufacturer(self, row):
        """Identify the manufacturer based on dealership name and URL."""
        try:
            name = str(row['DealershipName']).lower()
            url = str(row['Website']).lower()
            
            # First check for direct matches
            for manufacturer, keywords in self.manufacturer_data.items():
                if any(keyword in name or keyword in url for keyword in keywords):
                    return manufacturer
            
            # If no direct match, use fuzzy matching
            best_match = None
            highest_ratio = 0
            
            for manufacturer, keywords in self.manufacturer_data.items():
                for keyword in keywords:
                    ratio = fuzz.ratio(keyword, name)
                    if ratio > highest_ratio and ratio > 80:
                        highest_ratio = ratio
                        best_match = manufacturer
            
            result = best_match if best_match else "Other"
            return result
            
        except Exception as e:
            self.logger.error(f"Error identifying manufacturer for {row.get('DealershipName', 'Unknown')}: {str(e)}")
            return "Unknown"

    @retry_with_backoff(max_retries=2, initial_backoff=2)
    def scrape_contacts(self, url):
        """Scrape contact information from the dealership website with improved error handling."""
        if not url or pd.isna(url):
            return []
        
        # Create a resource guard to ensure cleanup
        with ResourceGuard() as resource_guard:
            try:
                # Use correlation ID for tracking related log messages
                correlation_id = f"extract_{int(time.time())}_{url.replace('://', '_').replace('.', '_')}"
                self.log_sync.start_correlation(correlation_id)
                
                # Create and register the extractor
                extractor = ContactExtractor(headless=True)
                resource_guard.add_resource(extractor)
                
                # Extract contacts with retry capability
                contacts = extractor.extract_contacts(url)
                
                # Convert the contacts dict to our expected format
                formatted_contacts = []
                
                # Add emails
                for email in contacts['emails']:
                    formatted_contacts.append({
                        'type': 'email',
                        'value': email
                    })
                
                # Add phones
                for phone in contacts['phones']:
                    formatted_contacts.append({
                        'type': 'phone',
                        'value': phone
                    })
                
                # Add address if found
                if contacts['address']:
                    formatted_contacts.append({
                        'type': 'address',
                        'value': contacts['address']
                    })
                
                self.logger.info(f"Successfully extracted {len(formatted_contacts)} contacts from {url}")
                return formatted_contacts
                
            except Exception as e:
                self.logger.error(f"Error scraping contacts from {url}: {str(e)}")
                
                # Record error for circuit breaker pattern
                parsed_url = urlparse(url)
                domain = parsed_url.netloc
                self.error_tracker.record_error(domain, type(e).__name__, {'url': url, 'error': str(e)})
                
                # Re-raise for retry decorator
                raise
                
            finally:
                # End correlation and ensure extractor cleanup
                self.log_sync.end_correlation()
                if 'extractor' in locals():
                    try:
                        extractor.cleanup()
                    except Exception as cleanup_error:
                        self.logger.error(f"Error during extractor cleanup: {str(cleanup_error)}")

    @with_logging
    def process_batch(self, batch):
        """Process a batch of dealerships with improved error handling and logging."""
        batch_id = f"batch_{int(time.time())}"
        self.logger.info(f"Starting batch {batch_id} with {len(batch)} dealerships")
        
        results = []
        failed_in_batch = []
        
        for _, row in batch.iterrows():
            dealership_id = f"{row.get('DealershipName', 'Unknown')}_{int(time.time())}"
            
            # Skip processing if shutdown requested
            if self.process_supervisor.is_shutdown_requested():
                self.logger.info(f"Shutdown requested, stopping batch {batch_id}")
                break
                
            try:
                # Set correlation ID for this dealership
                self.log_sync.start_correlation(dealership_id)
                self.logger.info(f"Processing dealership: {row.get('DealershipName', 'Unknown')}")
                
                url = self.clean_url(row['Website'])
                
                # Get domain for circuit breaker tracking
                parsed_url = urlparse(url)
                domain = parsed_url.netloc
                
                # Check if circuit breaker is open for this domain
                if self.error_tracker.check_circuit(domain):
                    self.logger.warning(f"Circuit breaker open for {domain}, skipping verification")
                    is_active, final_url = False, None
                else:
                    # Verify URL with retry capability
                    is_active, final_url = self.verify_url(url, resource_key=domain)
                
                # Thread-safe increment of active websites count
                if is_active:
                    with self.progress_lock:
                        self.active_websites += 1
                    
                    # Scrape contacts if the site is active
                    try:
                        contacts = self.scrape_contacts(final_url)
                    except CircuitOpenException:
                        self.logger.warning(f"Circuit breaker prevented contact scraping for {domain}")
                        contacts = []
                    except Exception as scrape_error:
                        self.logger.error(f"Error scraping contacts: {str(scrape_error)}")
                        contacts = []
                else:
                    contacts = []
                
                # Identify manufacturer
                manufacturer = self.identify_manufacturer(row)
                
                # Thread-safe update of manufacturer counts
                with self.progress_lock:
                    self.manufacturer_counts[manufacturer] = self.manufacturer_counts.get(manufacturer, 0) + 1
                
                # Create result record
                result = {
                    'DealershipName': row['DealershipName'],
                    'Website': url,
                    'IsActive': is_active,
                    'FinalURL': final_url if final_url else url,
                    'Manufacturer': manufacturer,
                    'Contacts': json.dumps(contacts),
                    'LastChecked': datetime.now().isoformat(),
                    'ProcessingTime': time.time(),
                    'CorrelationId': dealership_id
                }
                
                results.append(result)
                
                # Thread-safe increment of processed count
                with self.progress_lock:
                    self.total_processed += 1
                    
                self.logger.info(f"Successfully processed dealership: {row.get('DealershipName', 'Unknown')}")
                
            except Exception as e:
                self.logger.error(f"Error processing dealership {row.get('DealershipName', 'Unknown')}: {str(e)}")
                failed_record = {
                    'DealershipName': row.get('DealershipName', 'Unknown'),
                    'Website': row.get('Website', ''),
                    'Error': str(e),
                    'Timestamp': datetime.now().isoformat()
                }
                failed_in_batch.append(failed_record)
                
            finally:
                # End correlation for this dealership
                self.log_sync.end_correlation()
        
        # Update failed dealerships list
        if failed_in_batch:
            with self.progress_lock:
                self.failed_dealerships.extend(failed_in_batch)
        
        self.logger.info(f"Completed batch {batch_id}: {len(results)} successful, {len(failed_in_batch)} failed")
        return results

    @with_logging
    def process_dealerships(self):
        """Process all dealerships in the input file with improved synchronization and error handling."""
        # Start a new correlation context for the entire processing run
        process_correlation_id = f"process_{int(time.time())}"
        self.log_sync.start_correlation(process_correlation_id)
        
        # Register the main process with the supervisor
        self.process_supervisor.register_thread("main_process", threading.current_thread())
        
        # Initialize result collection with thread-safe queue
        result_queue = queue.Queue()
        self.logger.info(f"Starting dealership verification process with correlation ID: {process_correlation_id}")
        
        try:
            # Generate job ID if not exists
            if not self.job_id:
                self.job_id = str(int(time.time()))
                self.logger.info(f"Created new job ID: {self.job_id}")
            
            # Read input file with error handling
            try:
                df = pd.read_csv(self.input_file)
                total_dealerships = len(df)
                self.logger.info(f"Loaded {total_dealerships} dealerships from {self.input_file}")
            except Exception as e:
                self.logger.error(f"Failed to read input file {self.input_file}: {str(e)}")
                raise
            
            # Set up progress monitoring thread
            progress_monitor = threading.Thread(
                target=self._monitor_progress, 
                args=(total_dealerships,),
                daemon=True
            )
            self.process_supervisor.register_thread("progress_monitor", progress_monitor)
            progress_monitor.start()
            
            # Create ThreadPoolExecutor with process supervision
            self.executor = self.process_supervisor.create_supervised_executor(
                max_workers=self.max_workers, 
                name="dealer_batch"
            )
            
            # Process in batches with robust error handling
            with self.executor as executor:
                # Submit all batch jobs
                futures = []
                batches_submitted = 0
                
                for i in range(0, len(df), self.batch_size):
                    # Check if shutdown requested
                    if self.process_supervisor.is_shutdown_requested():
                        self.logger.warning("Shutdown requested, stopping batch submission")
                        break
                        
                    batch = df[i:i + self.batch_size]
                    batch_num = batches_submitted + 1
                    self.logger.info(f"Submitting batch {batch_num} with {len(batch)} dealerships")
                    
                    futures.append(executor.submit(self.process_batch, batch))
                    batches_submitted += 1
                    
                    # Small delay between batch submissions to prevent overloading
                    time.sleep(0.5)
                
                # Process completed batches with error handling
                results = []
                completed_batches = 0
                
                for future in as_completed(futures):
                    try:
                        batch_results = future.result()
                        results.extend(batch_results)
                        completed_batches += 1
                        
                        # Save progress periodically
                        if len(results) % self.save_interval == 0 or completed_batches % 5 == 0:
                            self.save_intermediate_results(results)
                            self.save_progress()
                            self.logger.info(f"Saved intermediate results: {len(results)} dealerships processed")
                    except Exception as e:
                        self.logger.error(f"Batch processing failed: {str(e)}")
                        continue
            
            # Save final results with atomic file operations
            try:
                self.save_final_results(results)
                self.logger.info("Final results saved successfully")
            except Exception as e:
                self.logger.error(f"Error saving final results: {str(e)}")
            
            # Log completion with detailed statistics
            success_rate = round((self.active_websites / self.total_processed) * 100, 2) if self.total_processed > 0 else 0
            self.logger.info(
                f"Processing completed. Total processed: {self.total_processed}, "
                f"Active websites: {self.active_websites}, Success rate: {success_rate}%, "
                f"Failed dealerships: {len(self.failed_dealerships)}"
            )
            
        except Exception as e:
            self.logger.critical(f"Fatal error in process_dealerships: {str(e)}", exc_info=True)
            raise
        finally:
            # Clean up resources
            self.stop_event.set()
            if hasattr(self, 'executor') and self.executor:
                self.executor.shutdown(wait=False)
            
            # End correlation context
            self.log_sync.end_correlation()

    def _monitor_progress(self, total_dealerships):
        """Background thread to monitor and log progress."""
        self.logger.info("Progress monitoring started")
        last_save_time = time.time()
        last_count = 0
        
        try:
            while not self.stop_event.is_set():
                current_count = self.total_processed
                current_time = time.time()
                time_elapsed = current_time - last_save_time
                
                if time_elapsed >= 30:  # Log every 30 seconds
                    # Calculate processing rate
                    dealerships_processed = current_count - last_count
                    rate = dealerships_processed / time_elapsed if time_elapsed > 0 else 0
                    
                    # Calculate progress percentage
                    progress = (current_count / total_dealerships) * 100 if total_dealerships > 0 else 0
                    
                    # Estimate time remaining
                    remaining_dealerships = total_dealerships - current_count
                    eta_seconds = remaining_dealerships / rate if rate > 0 else 0
                    eta_minutes = eta_seconds / 60
                    
                    self.logger.info(
                        f"Progress: {current_count}/{total_dealerships} dealerships ({progress:.1f}%), "
                        f"Rate: {rate:.2f} dealerships/sec, "
                        f"ETA: {eta_minutes:.1f} minutes"
                    )
                    
                    # Save progress periodically
                    self.save_progress()
                    
                    # Update tracking variables
                    last_save_time = current_time
                    last_count = current_count
                
                # Sleep briefly to prevent CPU usage
                time.sleep(5)
                
        except Exception as e:
            self.logger.error(f"Error in progress monitoring: {str(e)}")
        finally:
            self.logger.info("Progress monitoring stopped")

    @with_logging
    def save_intermediate_results(self, results):
        """Save intermediate results to CSV file with enhanced error handling."""
        if not results:
            self.logger.warning("No results to save")
            return
            
        try:
            # Create a DataFrame from results
            df = pd.DataFrame(results)
            
            # Generate output file path
            output_file = os.path.join(self.results_dir, f'verified_dealerships_{self.job_id}.csv')
            temp_file = f"{output_file}.tmp"
            
            # Write to temporary file first
            df.to_csv(temp_file, index=False)
            
            # Atomic file replacement
            os.replace(temp_file, output_file)
            
            self.logger.info(f"Saved {len(results)} results to {output_file}")
        except Exception as e:
            self.logger.error(f"Failed to save intermediate results: {str(e)}")

    @with_logging
    def save_final_results(self, results):
        """Save final results and statistics with atomic file operations."""
        try:
            # Save verified dealerships with error handling
            if results:
                df = pd.DataFrame(results)
                output_file = os.path.join(self.results_dir, f'verified_dealerships_{self.job_id}.csv')
                temp_file = f"{output_file}.tmp"
                
                # Write to temporary file first
                df.to_csv(temp_file, index=False)
                
                # Atomic file replacement
                os.replace(temp_file, output_file)
                
                self.logger.info(f"Saved {len(results)} final results to {output_file}")
            else:
                self.logger.warning("No results to save for final output")
            
            # Save failed dealerships
            if self.failed_dealerships:
                failed_file = os.path.join(self.results_dir, f'failed_dealerships_{self.job_id}.csv')
                failed_df = pd.DataFrame(self.failed_dealerships)
                failed_df.to_csv(failed_file, index=False)
                self.logger.info(f"Saved {len(self.failed_dealerships)} failed dealerships to {failed_file}")
            
            # Calculate statistics
            with self.progress_lock:
                total = self.total_processed
                active = self.active_websites
                manufacturers = self.manufacturer_counts.copy()
            
            success_rate = round((active / total) * 100, 2) if total > 0 else 0
            
            # Prepare comprehensive statistics
            stats = {
                'total_processed': total,
                'active_websites': active,
                'manufacturer_distribution': manufacturers,
                'failed_count': len(self.failed_dealerships),
                'success_rate': success_rate,
                'start_time': self.job_id,
                'completion_time': datetime.now().isoformat(),
                'processing_duration_seconds': int(time.time()) - int(self.job_id),
                'batch_size': self.batch_size,
                'max_workers': self.max_workers,
                'hostname': socket.gethostname() if hasattr(socket, 'gethostname') else 'unknown'
            }
            
            # Save statistics with atomic write
            stats_file = os.path.join(self.results_dir, f'verification_stats_{self.job_id}.json')
            temp_stats_file = f"{stats_file}.tmp"
            
            with open(temp_stats_file, 'w') as f:
                json.dump(stats, f, indent=2)
                
            # Atomic file replacement
            os.replace(temp_stats_file, stats_file)
            
            self.logger.info(f"Saved statistics to {stats_file}")
            
        except Exception as e:
            self.logger.error(f"Error saving final results: {str(e)}")
            raise

def main():
    parser = argparse.ArgumentParser(description='Verify dealership websites and extract contact information.')
    parser.add_argument('input_file', help='Path to the CSV file containing dealership data')
    parser.add_argument('--batch-size', type=int, default=50, help='Number of dealerships to process in each batch')
    parser.add_argument('--max-workers', type=int, default=4, help='Maximum number of concurrent workers')
    parser.add_argument('--save-interval', type=int, default=50, help='Save progress after processing this many dealerships')
    
    args = parser.parse_args()
    
    verifier = DealershipVerifier(
        input_file=args.input_file,
        batch_size=args.batch_size,
        max_workers=args.max_workers,
        save_interval=args.save_interval
    )
    
    verifier.process_dealerships()

if __name__ == '__main__':
    main() 