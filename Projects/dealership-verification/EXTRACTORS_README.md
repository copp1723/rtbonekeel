# Dealership Contact Extractors

This repository contains multiple contact extraction methods for dealership websites, each with different strengths.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Available Extractors](#available-extractors)
3. [Comparing Extractors](#comparing-extractors)
4. [Super Hybrid Extractor](#super-hybrid-extractor)
5. [Installation](#installation)
6. [Troubleshooting](#troubleshooting)

## Quick Start

If you want the best of both worlds, use the Super Hybrid Extractor:

```python
from super_hybrid_extractor import SuperHybridExtractor

# Initialize with your Firecrawl API key
extractor = SuperHybridExtractor(
    api_key="YOUR_FIRECRAWL_API_KEY",
    mode="auto"  # Options: "auto", "fallback", "combine"
)

# Extract contacts
contacts = extractor.extract_contacts("https://www.example-dealership.com")

# Process the results
print(f"Emails: {contacts['emails']}")
print(f"Phones: {contacts['phones']}")
print(f"Address: {contacts['address']}")

# Always clean up when done
extractor.cleanup()
```

## Available Extractors

### 1. Original Selenium Extractor (ContactExtractor)

The original Selenium-based scraper. Works well on many sites but can be blocked by anti-bot measures.

```python
from contact_extractor import ContactExtractor

extractor = ContactExtractor(headless=True)
contacts = extractor.extract_contacts(url)
extractor.cleanup()
```

### 2. Undetected ChromeDriver Extractor

Uses undetected-chromedriver to bypass many anti-bot measures. Faster than API-based solutions when it works.

```python
from undetected_extractor import UndetectedExtractor

extractor = UndetectedExtractor(headless=True)
contacts = extractor.extract_contacts(url)
extractor.cleanup()
```

### 3. Firecrawl API Extractor

Uses the Firecrawl API service for extraction. More reliable on difficult sites but requires an API key and has usage costs.

```python
from firecrawl_extractor_simple import FirecrawlExtractor

extractor = FirecrawlExtractor(api_key="YOUR_API_KEY")
contacts = extractor.extract_contacts(url)
extractor.cleanup()
```

### 4. Super Hybrid Extractor (Recommended)

Combines undetected-chromedriver and Firecrawl for optimal results. Tries the faster local method first, then falls back to Firecrawl only when needed.

```python
from super_hybrid_extractor import SuperHybridExtractor

extractor = SuperHybridExtractor(
    api_key="YOUR_API_KEY",
    mode="auto"  # Try local first, use API only when needed
)
contacts = extractor.extract_contacts(url)
extractor.cleanup()
```

## Comparing Extractors

To compare all extraction methods on a specific URL:

```bash
python compare_all_extractors.py https://problematic-dealership.com --api-key=YOUR_API_KEY
```

This will:
1. Run all available extractors on the URL
2. Compare their results and performance
3. Provide a recommendation on which to use
4. Save detailed results to `extractor_comparison_results.json`

## Super Hybrid Extractor

The Super Hybrid Extractor offers three operation modes:

1. **Auto Mode** (default): 
   - Tries undetected-chromedriver first 
   - Only uses Firecrawl if undetected-chromedriver finds incomplete data
   - Best balance of speed, cost, and coverage

2. **Fallback Mode**:
   - Only uses Firecrawl if undetected-chromedriver completely fails
   - Most cost-effective but might miss some data

3. **Combine Mode**:
   - Always runs both extractors and combines their results
   - Most comprehensive data coverage but highest cost

Example:

```bash
python super_hybrid_extractor.py https://dealership.com --api-key=YOUR_API_KEY --mode=auto
```

## Installation

1. Install the required packages:

```bash
pip install selenium beautifulsoup4 undetected-chromedriver firecrawl
```

2. Ensure you have Chrome installed on your system

3. Get a Firecrawl API key

## Troubleshooting

### Webdriver Issues

If you encounter issues with undetected-chromedriver:

1. Check that your Chrome browser is up to date
2. Try running without headless mode for debugging:
   ```python
   extractor = UndetectedExtractor(headless=False)
   ```

### Firecrawl API Issues

1. Check that your API key is valid
2. Ensure you have sufficient credits on your Firecrawl account
3. Check the Firecrawl API status at their website

### General Troubleshooting

1. Run the comparison tool to see which method works best for your specific URL
2. Try different extraction modes with the Super Hybrid Extractor
3. Check the logs for detailed error information