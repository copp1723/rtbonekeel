#!/usr/bin/env python3

import argparse
import sys
import importlib.util
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from bs4 import BeautifulSoup

# Import our enhanced modules
from logging_config import configure_logging
from debug_helper import DebugHelper
from contact_extractor import ContactExtractor
from staff_extractor import StaffExtractor


class DealershipScraper:
    """
    Main class for scraping dealership websites to extract staff and contact information
    """
    def __init__(self, headless=True, debug=False):
        # Set up logging
        self.logging_config = configure_logging()
        self.logger = self.logging_config.get_logger("dealership_scraper")
        
        # Set debug mode if requested
        if debug:
            self.logging_config.set_debug_mode(True)
            self.logger.debug("Debug mode enabled")
        
        # Initialize debug helper
        self.debug_helper = DebugHelper()
        
        # Initialize extractors
        self.contact_extractor = ContactExtractor()
        self.staff_extractor = StaffExtractor()
        
        # Configure Chrome options
        self.chrome_options = Options()
        if headless:
            self.chrome_options.add_argument("--headless")
        
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--window-size=1920,1080")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        
        # Initialize webdriver to None (will be created when needed)
        self.driver = None
        
        self.logger.info("DealershipScraper initialized")
    
    def start_driver(self):
        """Start the Selenium webdriver"""
        try:
            self.logger.info("Starting Chrome webdriver")
            self.driver = webdriver.Chrome(options=self.chrome_options)
            self.driver.implicitly_wait(10)
            return True
        except Exception as e:
            self.logger.error(f"Failed to start webdriver: {str(e)}")
            return False
    
    def close_driver(self):
        """Close the Selenium webdriver"""
        if self.driver:
            self.logger.info("Closing Chrome webdriver")
            try:
                self.driver.quit()
            except Exception as e:
                self.logger.error(f"Error closing webdriver: {str(e)}")
            self.driver = None
    
    def navigate_to_url(self, url):
        """
        Navigate to the specified URL
        
        Args:
            url (str): The URL to navigate to
            
        Returns:
            bool: True if navigation successful, False otherwise
        """
        if not self.driver:
            if not self.start_driver():
                return False
        
        try:
            self.logger.info(f"Navigating to URL: {url}")
            self.driver.get(url)
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            self.logger.info(f"Successfully loaded URL: {url}")
            return True
        except TimeoutException:
            self.logger.error(f"Timeout while loading URL: {url}")
            return False
        except WebDriverException as e:
            self.logger.error(f"WebDriver error while loading URL: {url} - {str(e)}")
            return False
        except Exception as e:
            self.logger.error(f"Error navigating to URL: {url} - {str(e)}")
            return False
    
    def find_staff_page(self, base_url):
        """
        Find the staff/team/about page URL from the dealership's home page
        
        Args:
            base_url (str): The dealership's home page URL
            
        Returns:
            str: The URL of the staff page, or None if not found
        """
        self.logger.info(f"Looking for staff page on {base_url}")
        
        if not self.navigate_to_url(base_url):
            return None
        
        # Capture the home page state for debugging
        dealership_name = self.extract_dealership_name()
        self.debug_helper.capture_page_state(self.driver, dealership_name, "homepage")
        
        # Common staff page link texts
        staff_keywords = [
            'staff', 'team', 'about', 'meet', 'our team', 'our staff', 
            'employees', 'people', 'directory', 'personnel', 'meet the team'
        ]
        
        # Find all links on the page
        try:
            links = self.driver.find_elements(By.TAG_NAME, "a")
            self.logger.debug(f"Found {len(links)} links on home page")
            
            # Check each link for staff-related keywords
            staff_links = []
            for link in links:
                try:
                    href = link.get_attribute("href")
                    text = link.text.lower().strip()
                    
                    if not href or not text:
                        continue
                    
                    if any(keyword in text for keyword in staff_keywords):
                        staff_links.append((href, text))
                        self.logger.debug(f"Potential staff link found: {text} -> {href}")
                except Exception as e:
                    continue
            
            if staff_links:
                # Sort by relevance (prefer links with 'staff' or 'team' in them)
                staff_links.sort(key=lambda x: 
                    -1 if 'staff' in x[1] or 'team' in x[1] else 
                    -2 if 'meet' in x[1] else 0
                )
                
                # Return the most relevant staff page URL
                self.logger.info(f"Selected staff page: {staff_links[0][0]} ('{staff_links[0][1]}')")
                return staff_links[0][0]
            
            self.logger.warning("No staff page link found")
            return None
        except Exception as e:
            self.logger.error(f"Error finding staff page: {str(e)}")
            return None
    
    def extract_dealership_name(self):
        """Extract the dealership name from the current page"""
        try:
            return self.driver.title.split('-')[0].strip()
        except:
            return "Unknown Dealership"
    
    def scrape_staff_page(self, staff_url):
        """
        Scrape staff information from the staff page
        
        Args:
            staff_url (str): URL of the staff page
            
        Returns:
            list: List of staff members with their contact information
        """
        self.logger.info(f"Scraping staff page: {staff_url}")
        
        if not self.navigate_to_url(staff_url):
            return []
        
        # Capture the staff page state for debugging
        dealership_name = self.extract_dealership_name()
        self.debug_helper.capture_page_state(self.driver, dealership_name, "staff_page")
        
        # Extract staff members
        try:
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            staff_members = self.staff_extractor.extract_staff_members(self.driver, soup)
            
            self.logger.info(f"Found {len(staff_members)} staff members")
            
            # Log extraction stats
            extraction_stats = {
                "url": staff_url,
                "staff_count": len(staff_members),
                "contact_extraction_stats": self.contact_extractor.stats,
                "staff_members": staff_members
            }
            
            self.debug_helper.log_extraction_results(
                dealership_name, 
                extraction_stats, 
                "staff_extraction"
            )
            
            return staff_members
        except Exception as e:
            self.logger.error(f"Error scraping staff page: {str(e)}")
            return []
    
    def scrape_dealership(self, url):
        """
        Scrape a dealership website for staff contact information
        
        Args:
            url (str): The dealership website URL
            
        Returns:
            dict: Scraping results including staff information
        """
        self.logger.info(f"Starting to scrape dealership: {url}")
        
        try:
            # Find the staff page
            staff_url = self.find_staff_page(url)
            
            if not staff_url:
                self.logger.warning(f"Could not find staff page for {url}")
                
                # Try to analyze the home page for potential issues
                analysis = self.debug_helper.analyze_email_presence(self.driver)
                self.logger.info(f"Home page analysis: {analysis}")
                
                return {
                    "url": url,
                    "success": False,
                    "error": "Could not find staff page",
                    "staff": []
                }
            
            # Scrape the staff page
            staff_members = self.scrape_staff_page(staff_url)
            
            # If no staff members found, try to analyze the page for potential issues
            if not staff_members:
                analysis = self.debug_helper.analyze_email_presence(self.driver)
                self.logger.info(f"Staff page analysis: {analysis}")
            
            # Return results
            return {
                "url": url,
                "staff_url": staff_url,
                "success": len(staff_members) > 0,
                "staff_count": len(staff_members),
                "staff": staff_members
            }
        except Exception as e:
            self.logger.error(f"Error scraping dealership {url}: {str(e)}")
            return {
                "url": url,
                "success": False,
                "error": str(e),
                "staff": []
            }
        finally:
            # Always close the driver when done
            self.close_driver()
    
    def main(self):
        """Main function to run the scraper"""
        parser = argparse.ArgumentParser(description="Scrape dealership websites for staff contact info")
        parser.add_argument("url", help="Dealership website URL")
        parser.add_argument("--visible", action="store_true", help="Run in visible mode (not headless)")
        parser.add_argument("--debug", action="store_true", help="Enable debug mode with extra logging")
        
        args = parser.parse_args()
        
        # Create and run the scraper
        scraper = DealershipScraper(headless=not args.visible, debug=args.debug)
        results = scraper.scrape_dealership(args.url)
        
        # Print results summary
        if results["success"]:
            print(f"Successfully scraped {results['staff_count']} staff members from {args.url}")
            
            # Print staff with emails
            staff_with_emails = [s for s in results["staff"] if s.get("email")]
            print(f"Found {len(staff_with_emails)} staff members with email addresses:")
            
            for staff in staff_with_emails:
                print(f"- {staff.get('name', 'Unknown')}: {staff.get('email')}")
        else:
            print(f"Failed to scrape {args.url}: {results.get('error', 'Unknown error')}")
        
        return 0


def main():
    sys.exit(DealershipScraper().main())


if __name__ == "__main__":
    main() 