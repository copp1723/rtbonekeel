import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import time
from datetime import datetime
import os

def verify_dealership_url(url):
    """Check if dealership website is active."""
    if not url or pd.isna(url):
        return False
    
    try:
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
            
        response = requests.head(url, timeout=5, allow_redirects=True)
        return response.status_code < 400
    except:
        return False

def batch_verify_urls(df, url_column='Website', batch_size=10):
    """Verify URLs in batches to prevent API overload."""
    print(f"Verifying {len(df)} URLs in batches of {batch_size}...")
    verified_status = []
    
    for i in range(0, len(df), batch_size):
        end_idx = min(i + batch_size, len(df))
        batch = df.iloc[i:end_idx]
        batch_results = []
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {executor.submit(verify_dealership_url, url): idx 
                      for idx, url in enumerate(batch[url_column]) if not pd.isna(url)}
            
            for future in as_completed(futures):
                batch_results.append((futures[future], future.result()))
        
        # Sort by original index and extract just the results
        batch_results.sort()
        batch_verified = [result for _, result in batch_results]
        
        # Fill in False for any NaN URLs
        batch_status = []
        url_idx = 0
        for j in range(len(batch)):
            if pd.isna(batch.iloc[j][url_column]):
                batch_status.append(False)
            else:
                batch_status.append(batch_verified[url_idx])
                url_idx += 1
        
        verified_status.extend(batch_status)
        print(f"Completed batch {i//batch_size + 1}/{(len(df) + batch_size - 1)//batch_size}")
        time.sleep(1)  # Prevent API throttling
    
    return verified_status

def main():
    print("\n=== Dealership Verification Tool ===\n")
    
    # 1. Find input file
    csv_file = None
    for file in os.listdir():
        if file.endswith('.csv'):
            csv_file = file
            break
    
    if csv_file is None:
        print("No CSV file found in current directory.")
        return
    
    print(f"Found file: {csv_file}")
    
    # 2. Load the data
    try:
        df = pd.read_csv(csv_file)
        print(f"Loaded {len(df)} records")
        print(f"Columns found: {', '.join(df.columns)}")
    except Exception as e:
        print(f"Error loading file: {e}")
        return
    
    # 3. Check for Website column
    website_col = None
    for col in df.columns:
        if col.lower() in ['website', 'url', 'web', 'site']:
            website_col = col
            break
    
    if website_col is None:
        print("Error: Website column not found in the file.")
        print(f"Available columns: {', '.join(df.columns)}")
        return
    
    print(f"Using '{website_col}' as website column")
    
    # 4. Verify a sample of websites (first 10)
    sample_size = min(10, len(df))
    sample = df.head(sample_size)
    
    print(f"\nVerifying {sample_size} websites as a test...")
    url_statuses = batch_verify_urls(sample, url_column=website_col, batch_size=5)
    
    # 5. Print results
    print("\n=== Results ===")
    active_urls = sum(url_statuses)
    print(f"Active URLs: {active_urls}/{len(url_statuses)} ({active_urls/len(url_statuses)*100:.1f}%)")
    
    # 6. Save results
    sample['url_active'] = url_statuses
    sample['last_checked'] = datetime.now().strftime('%Y-%m-%d')
    sample.to_csv('verified_sample.csv', index=False)
    print("\nResults saved to 'verified_sample.csv'")
    
    print("\nTo verify all dealerships, modify the script to use the full dataset instead of a sample.")

if __name__ == "__main__":
    main()
