# Firecrawl and Hybrid Extractor Usage Guide

This guide explains how to use the Firecrawl and hybrid scraping tools for the dealership verification project.

## Comparing Selenium and Firecrawl

To evaluate whether Firecrawl can help with problematic dealership websites, use the comparison script:

```bash
# Compare both approaches on specific URLs
python run_comparison.py --api-key=YOUR_FIRECRAWL_API_KEY --urls https://www.problematic-site1.com https://www.problematic-site2.com

# Or use a file containing URLs (one per line)
python run_comparison.py --api-key=YOUR_FIRECRAWL_API_KEY --file problem_urls.txt

# Specify an output file (default is a timestamped file)
python run_comparison.py --api-key=YOUR_FIRECRAWL_API_KEY --urls https://www.example.com --output=my_results.json
```

This will generate:
- A detailed JSON report of all extractions
- A CSV summary for easy analysis
- A console output with key metrics and recommendations

## Using the Hybrid Extractor

The hybrid extractor combines Selenium and Firecrawl for optimal results:

```bash
# Extract contacts for a single URL
python hybrid_extractor.py https://www.example-dealership.com --api-key=YOUR_FIRECRAWL_API_KEY

# Specify when to use Firecrawl
python hybrid_extractor.py https://www.example-dealership.com --api-key=YOUR_FIRECRAWL_API_KEY --mode=auto
```

Fallback modes:
- `auto` (default): Use Firecrawl if Selenium fails or returns incomplete data
- `on_failure`: Use Firecrawl only if Selenium completely fails
- `always`: Always run both methods and combine their results

## Integrating Into Your Pipeline

To integrate the hybrid approach into your existing verification pipeline:

1. Import the hybrid extractor:

```python
from hybrid_extractor import HybridContactExtractor
```

2. Replace your existing extractor with the hybrid one:

```python
# Before
extractor = ContactExtractor(headless=True)

# After
extractor = HybridContactExtractor(
    api_key="YOUR_FIRECRAWL_API_KEY",
    fallback_mode="auto"
)
```

3. The rest of your code can remain unchanged, as the hybrid extractor maintains the same interface as the original ContactExtractor.

## Recommended Approach for Production

For production, we recommend:

1. Start with a small batch of problematic URLs
2. Run comparison tests to validate Firecrawl's benefits
3. Implement the hybrid approach with automatic fallback
4. Monitor success rates and extraction quality
5. Adjust the fallback strategy based on performance data

This approach gives you the best of both worlds: the speed of Selenium and the reliability of Firecrawl.

## Customizing Firecrawl Configuration

For challenging websites, you can fine-tune the Firecrawl configuration by modifying the `crawl_config` in `firecrawl_extractor_simple.py`:

```python
# Increase crawl depth
crawl_config["max_pages"] = 10

# Add more follow keywords
crawl_config["follow_link_keywords"].extend(["staff", "our-team", "directory"])

# Customize extraction selectors
crawl_config["extract_selectors"].append({
    "name": "special_phones",
    "type": "css",
    "selector": ".phone, [class*='phone'], [id*='phone']"
})
```

## Troubleshooting

If you encounter issues:

1. **API Key Problems**: Ensure your Firecrawl API key is valid and has sufficient credits
2. **Selenium Crashes**: Check that you have the correct ChromeDriver version installed
3. **No Data Extracted**: Try increasing the crawl depth and adding more selective patterns
4. **Rate Limiting**: Add delays between requests in the configuration