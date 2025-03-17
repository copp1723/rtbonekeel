import logging
import json
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup


class DebugHelper:
    """
    Helper class for debugging and diagnosing scraping issues
    """
    def __init__(self, debug_dir="debug_output"):
        self.logger = logging.getLogger("debug_helper")
        self.debug_dir = debug_dir
        
        # Create debug directory if it doesn't exist
        if not os.path.exists(debug_dir):
            os.makedirs(debug_dir)
            self.logger.info(f"Created debug directory: {debug_dir}")
        
        # Create subdirectories
        self.html_dir = os.path.join(debug_dir, "html")
        self.screenshot_dir = os.path.join(debug_dir, "screenshots")
        self.data_dir = os.path.join(debug_dir, "data")
        
        for directory in [self.html_dir, self.screenshot_dir, self.data_dir]:
            if not os.path.exists(directory):
                os.makedirs(directory)

    def capture_page_state(self, driver, dealership_name, page_name="main"):
        """
        Capture complete state of the current page for debugging
        
        Args:
            driver (WebDriver): Selenium webdriver instance
            dealership_name (str): Name of the dealership (for filename)
            page_name (str): Name of the page (for filename)
        """
        try:
            # Create safe filename
            safe_name = self._create_safe_filename(dealership_name)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            base_filename = f"{safe_name}_{page_name}_{timestamp}"
            
            # 1. Save HTML source
            self.save_html_source(driver, base_filename)
            
            # 2. Take screenshot
            self.take_screenshot(driver, base_filename)
            
            # 3. Log current URL
            current_url = driver.current_url
            self.logger.info(f"Current URL: {current_url}")
            
            # 4. Save page metadata
            metadata = {
                "url": current_url,
                "title": driver.title,
                "timestamp": timestamp,
                "dealership": dealership_name,
                "page": page_name
            }
            self._save_json(metadata, os.path.join(self.data_dir, f"{base_filename}_metadata.json"))
            
            self.logger.info(f"Captured page state for {dealership_name} ({page_name})")
            return True
        except Exception as e:
            self.logger.error(f"Error capturing page state: {str(e)}")
            return False
    
    def save_html_source(self, driver, filename_base):
        """
        Save the HTML source of the current page
        
        Args:
            driver (WebDriver): Selenium webdriver instance
            filename_base (str): Base filename (without extension)
        """
        try:
            html_path = os.path.join(self.html_dir, f"{filename_base}.html")
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            self.logger.debug(f"Saved HTML source to {html_path}")
            return html_path
        except Exception as e:
            self.logger.error(f"Error saving HTML source: {str(e)}")
            return None
    
    def take_screenshot(self, driver, filename_base):
        """
        Take a screenshot of the current page
        
        Args:
            driver (WebDriver): Selenium webdriver instance
            filename_base (str): Base filename (without extension)
        """
        try:
            screenshot_path = os.path.join(self.screenshot_dir, f"{filename_base}.png")
            driver.save_screenshot(screenshot_path)
            self.logger.debug(f"Saved screenshot to {screenshot_path}")
            return screenshot_path
        except Exception as e:
            self.logger.error(f"Error taking screenshot: {str(e)}")
            return None
    
    def log_extraction_results(self, dealership_name, results, extraction_type="staff_emails"):
        """
        Log extraction results to a JSON file
        
        Args:
            dealership_name (str): Name of the dealership
            results (dict/list): Results to log
            extraction_type (str): Type of extraction (for filename)
        """
        try:
            safe_name = self._create_safe_filename(dealership_name)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{safe_name}_{extraction_type}_{timestamp}.json"
            
            filepath = os.path.join(self.data_dir, filename)
            self._save_json(results, filepath)
            
            self.logger.info(f"Logged {extraction_type} results for {dealership_name}")
            return filepath
        except Exception as e:
            self.logger.error(f"Error logging extraction results: {str(e)}")
            return None
    
    def analyze_email_presence(self, driver, email_patterns=None):
        """
        Analyze the page for potential email patterns that might be missed
        
        Args:
            driver (WebDriver): Selenium webdriver instance
            email_patterns (list): List of regex patterns to check for
        """
        try:
            self.logger.info("Analyzing page for potential missed emails")
            
            # Default patterns to check if none provided
            if not email_patterns:
                email_patterns = [
                    r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+',  # Standard email
                    r'mailto:',                                          # mailto: links
                    r'email\s*=',                                      # match 'email=' in JS
                    r'user@domain\.com',                                # Placeholder emails
                    r'email',                                           # Email text
                    r'contact',                                         # Contact text
                ]
            
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Results dictionary
            analysis = {
                "url": driver.current_url,
                "findings": {}
            }
            
            # Check for patterns in page source
            for pattern in email_patterns:
                import re
                matches = re.findall(pattern, driver.page_source, re.IGNORECASE)
                if matches:
                    analysis["findings"][pattern] = matches[:10]  # Limit to first 10 matches
            
            # Check for potential email-related elements
            email_elements = soup.find_all('a', href=lambda href: href and 'mailto:' in href)
            if email_elements:
                analysis["findings"]["mailto_links"] = [e.get('href') for e in email_elements][:10]
            
            # Check for forms that might contain email functionality
            forms = soup.find_all('form')
            if forms:
                analysis["findings"]["forms"] = [{"id": f.get('id'), "action": f.get('action')} for f in forms][:5]
            
            # Check for scripts that might contain email functionality
            scripts = soup.find_all('script')
            email_related_scripts = []
            for script in scripts:
                script_text = script.string if script.string else ""
                if any(term in script_text.lower() for term in ['email', 'contact', 'mailto']):
                    email_related_scripts.append(script_text[:100] + "...")  # First 100 chars
            
            if email_related_scripts:
                analysis["findings"]["email_related_scripts"] = email_related_scripts[:3]
            
            return analysis
        except Exception as e:
            self.logger.error(f"Error analyzing email presence: {str(e)}")
            return {"error": str(e)}
    
    def _create_safe_filename(self, name):
        """Create a safe filename from a string"""
        return "".join([c if c.isalnum() else "_" for c in name])
    
    def _save_json(self, data, filepath):
        """Save data as JSON to the specified filepath"""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2) 