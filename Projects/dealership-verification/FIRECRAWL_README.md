# Using Firecrawl for Dealership Verification

This document provides guidance on integrating Firecrawl into your dealership verification project to overcome challenges with website scraping and data extraction.

## Overview

Firecrawl is a powerful web crawling and scraping service that provides several advantages over traditional scraping methods:

1. **Bypass Anti-Bot Measures**: Firecrawl may be better at handling websites with anti-bot protections
2. **Improved Performance**: Cloud-based crawling can be faster than local Selenium
3. **Simplified Code**: Declarative configuration reduces complex extraction logic
4. **Reduced Maintenance**: Less sensitive to website changes and browser updates

## Getting Started

### 1. Install Firecrawl

```bash
pip install firecrawl
```

### 2. Verify Installation

```bash
python test_firecrawl.py
```

You should see the message: "Firecrawl installed successfully!"

### 3. Set Up Your API Key

Replace `fc-YOUR_API_KEY` with your actual Firecrawl API key in all scripts.

## Using the Firecrawl Extractor

### Option 1: Direct Integration

We've created a `FirecrawlExtractor` class that follows the same interface as the existing `ContactExtractor` class. This makes it easy to integrate with your existing codebase.

```python
from firecrawl_extractor import FirecrawlExtractor

# Initialize extractor
extractor = FirecrawlExtractor(api_key="fc-YOUR_API_KEY")

# Extract contacts from a URL
contacts = extractor.extract_contacts("https://example-dealership.com")

# Process the extracted contacts
print(contacts)
```

### Option 2: Standalone Script

For quick experimentation, use the provided example script:

```bash
python firecrawl_example.py dealership_data.csv --api-key=fc-YOUR_API_KEY --limit=10
```

This will extract contact information from 10 random dealerships and save the results to `firecrawl_contacts.csv`.

### Option 3: Comparative Testing

To compare Firecrawl with your existing Selenium-based solution:

```bash
python compare_extractors.py dealership_data.csv --api-key=fc-YOUR_API_KEY --sample=5
```

This will run both extractors on 5 dealership websites and generate a detailed performance comparison.

## Key Configuration Options

When using Firecrawl, you can customize these key parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `max_pages` | Maximum number of pages to crawl per website | 10 |
| `follow_links` | Whether to follow internal links | True |
| `follow_link_keywords` | Keywords to identify relevant internal links | ["contact", "about", "locations"] |
| `wait_time` | Time to wait between requests (seconds) | 2 |
| `extract_selectors` | What data to extract and how | See examples |

## Example: Advanced Configuration

```python
crawler_config = {
    "max_pages": 15,  # Crawl up to 15 pages per dealership
    "follow_links": True,
    "follow_link_keywords": ["contact", "about", "locations", "find us", "visit", "hours"],
    "wait_time": 1.5,  # Faster crawling
    "extract_selectors": [
        # Custom selectors for challenging websites
        {"name": "emails", "type": "regex", "pattern": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'},
        {"name": "special_emails", "type": "css", "selector": "[data-email], .email, .e-mail, .mail"},
        {"name": "phones", "type": "regex", "pattern": r'(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})'},
        {"name": "address", "type": "css", "selector": "[itemtype*='PostalAddress'], .address, .location"},
    ],
    "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
}
```

## Troubleshooting

If you encounter issues:

1. **API Key Errors**: Ensure your API key is correctly formatted and has sufficient credits
2. **Empty Results**: Try adjusting selectors or increasing `max_pages`
3. **Rate Limiting**: Introduce delays between requests with `wait_time`
4. **Blocked Websites**: Some websites may still employ advanced anti-bot measures

## Best Practices

1. **Respect Robots.txt**: Consider checking robots.txt before crawling
2. **Rate Limiting**: Add appropriate delays to avoid overloading websites
3. **Caching**: Consider caching results to avoid redundant requests
4. **Validation**: Always validate extracted data before use

## Getting Help

For more information on Firecrawl and its capabilities, please refer to the official documentation at [firecrawl.io/docs](https://firecrawl.io/docs).

## Next Steps

1. Conduct a comprehensive test of Firecrawl on problematic dealership websites
2. Gradually migrate your extraction pipeline from Selenium to Firecrawl
3. Consider a hybrid approach for websites that still require Selenium for complex interactions