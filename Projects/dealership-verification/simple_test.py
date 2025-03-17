#!/usr/bin/env python3

import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import re
import urllib.parse

def extract_emails(url, use_modified=True):
    """Extract emails from a URL using either the original or modified approach"""
    print(f"\n=== Testing {'MODIFIED' if use_modified else 'ORIGINAL'} email extraction on {url} ===")
    
    # Setup Chrome
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    driver = None
    try:
        # Initialize the driver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_page_load_timeout(30)
        
        # Load the page
        print(f"Loading {url}...")
        driver.get(url)
        time.sleep(3)  # Wait for page to load
        
        # Get page source and create BeautifulSoup object
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Extract emails
        emails = set()
        
        # 1. Extract emails from text content
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        for element in soup.find_all(string=re.compile(email_pattern)):
            found_emails = re.findall(email_pattern, element.strip())
            for email in found_emails:
                if _validate_email(email):
                    emails.add(email.lower())
        
        # 2. Extract emails from mailto links
        for link in soup.find_all('a', href=re.compile(r'mailto:')):
            email = link['href'].replace('mailto:', '').strip()
            
            # Modified approach includes URL decoding
            if use_modified:
                email = urllib.parse.unquote(email)
                
            if re.match(email_pattern, email) and _validate_email(email):
                emails.add(email.lower())
        
        # 3. If using modified approach, also check for "Email Me" text
        if use_modified and driver:
            # --- "Email Me" Text Recognition ---
            email_prompt_phrases = [
                "Email me", "Email us", "Contact us by email", "Email for more info",
                "Email our team", "Send us an email", " вопросам пишите"
            ]
            
            for phrase in email_prompt_phrases:
                try:
                    # Find elements containing the phrase (case-insensitive)
                    xpath_selector = f"//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{phrase.lower()}')]"
                    prompt_elements = driver.find_elements("xpath", xpath_selector)
                    
                    for prompt_element in prompt_elements:
                        try:
                            # Search for emails in the same element
                            element_text = prompt_element.text
                            emails_in_element = re.findall(email_pattern, element_text)
                            if emails_in_element:
                                for email in emails_in_element:
                                    if _validate_email(email):
                                        emails.add(email.lower())
                                continue
                            
                            # Search for emails in the following sibling
                            try:
                                following_sibling = prompt_element.find_element("xpath", "./following-sibling::*[1]")
                                if following_sibling:
                                    sibling_text = following_sibling.text
                                    emails_in_sibling = re.findall(email_pattern, sibling_text)
                                    if emails_in_sibling:
                                        for email in emails_in_sibling:
                                            if _validate_email(email):
                                                emails.add(email.lower())
                            except:
                                pass
                        except:
                            continue
                except:
                    continue
        
        # Display results
        print(f"\nFound {len(emails)} emails:")
        print("=== Emails ===")
        for email in emails:
            print(email)
        
        return emails
        
    except Exception as e:
        print(f"Error testing {url}: {str(e)}")
        return set()
    finally:
        # Clean up resources
        if driver:
            try:
                driver.quit()
            except:
                pass

def _validate_email(email):
    """Validate email format and filter out common non-valid patterns"""
    if not email or '@' not in email:
        return False
        
    # Check for common invalid patterns
    invalid_patterns = [
        'example.com',
        'domain.com',
        'email@example',
        'yourdomain',
        'yourname',
        '@.'
    ]
    
    if any(pattern in email.lower() for pattern in invalid_patterns):
        return False
        
    # Validate basic email format
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_regex, email))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python simple_test.py <url> [--original]")
        sys.exit(1)
    
    url = sys.argv[1]
    use_modified = "--original" not in sys.argv
    
    extract_emails(url, use_modified) 