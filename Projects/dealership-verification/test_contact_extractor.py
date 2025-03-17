import logging
from contact_extractor import ContactExtractor

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def test_contact_extraction():
    # Test URLs - replace with actual dealership URLs for testing
    test_urls = [
        "https://www.toyotaofseattle.com/",  # Example dealership
        "https://www.hondaofseattle.com/",   # Example dealership
    ]
    
    extractor = None
    try:
        extractor = ContactExtractor(headless=True)
        
        for url in test_urls:
            print(f"\nTesting URL: {url}")
            try:
                contacts = extractor.extract_contacts(url)
                print("\nExtracted Contacts:")
                print("Emails:", contacts['emails'])
                print("Phones:", contacts['phones'])
                print("Address:", contacts['address'])
            except Exception as e:
                print(f"Error processing {url}: {str(e)}")
    
    finally:
        if extractor:
            extractor.cleanup()

if __name__ == "__main__":
    test_contact_extraction() 