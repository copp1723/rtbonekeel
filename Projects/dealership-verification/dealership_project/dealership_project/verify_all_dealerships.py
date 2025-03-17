import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import time
from datetime import datetime
import os
import sys

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

def batch_verify_urls(df, url_column='Website', batch_size=50, start_idx=0, max_records=None):
    """Verify URLs in batches to prevent API overload."""
    end_idx = len(df) if max_records is None else min(start_idx + max_records, len(df))
    df_to_process = df.iloc[start_idx:end_idx].copy()
    
    print(f"Verifying {len(df_to_process)} URLs in batches of {batch_size}...")
    verified_status = []
    
    for i in range(0, len(df_to_process), batch_size):
        batch_end = min(i + batch_size, len(df_to_process))
        batch = df_to_process.iloc[i:batch_end]
        batch_results = []
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(verify_dealership_url, url): idx 
                      for idx, url in enumerate(batch[url_column]) if not pd.isna(url)}
            
            for future in tqdm(as_completed(futures), 
                              total=len(futures), 
                              desc=f"Batch {i//batch_size + 1}/{(len(df_to_process) + batch_size - 1)//batch_size}"):
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
        
        # Save progress after each batch
        progress_df = df_to_process.iloc[:batch_end].copy()
        progress_df.loc[:, 'url_active'] = verified_status
        progress_df.loc[:, 'last_checked'] = datetime.now().strftime('%Y-%m-%d')
        progress_df.to_csv(f'verification_progress.csv', index=False)
        
        # Status update
        active_count = sum(verified_status)
        print(f"Progress: {batch_end}/{len(df_to_process)} URLs processed, {active_count} active ({active_count/len(verified_status)*100:.1f}%)")
        
        # Prevent API throttling
        time.sleep(2)
    
    return verified_status

def main():
    print("\n=== Dealership Verification Tool ===\n")
    
    # Parse command line arguments
    batch_size = 50
    max_records = None
    start_idx = 0
    
    # Check for command line arguments
    if len(sys.argv) > 1:
        try:
            max_records = int(sys.argv[1])
            print(f"Will process up to {max_records} records")
        except:
            print(f"Invalid maximum records value: {sys.argv[1]}")
    
    if len(sys.argv) > 2:
        try:
            batch_size = int(sys.argv[2])
            print(f"Using batch size of {batch_size}")
        except:
            print(f"Invalid batch size: {sys.argv[2]}")
    
    if len(sys.argv) > 3:
        try:
            start_idx = int(sys.argv[3])
            print(f"Starting from record {start_idx}")
        except:
            print(f"Invalid start index: {sys.argv[3]}")
    
    # 1. Find input file
    csv_file = None
    for file in os.listdir():
        if file.endswith('.csv') and not file.startswith('verified_') and not file.startswith('verification_'):
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
    
    # 4. Process the specified range of records
    url_statuses = batch_verify_urls(
        df, 
        url_column=website_col, 
        batch_size=batch_size,
        start_idx=start_idx,
        max_records=max_records
    )
    
    # 5. Save final results
    result_df = df.iloc[start_idx:start_idx + len(url_statuses)].copy()
    result_df.loc[:, 'url_active'] = url_statuses
    result_df.loc[:, 'last_checked'] = datetime.now().strftime('%Y-%m-%d')
    
    # Calculate manufacturer if needed
    # This would require an additional function to identify manufacturers
    
    # Save results
    result_df.to_csv('verified_dealerships.csv', index=False)
    
    # 6. Print final summary
    print("\n=== Final Results ===")
    active_urls = sum(url_statuses)
    total_urls = len(url_statuses)
    print(f"Processed {total_urls} dealerships")
    print(f"Active URLs: {active_urls}/{total_urls} ({active_urls/total_urls*100:.1f}%)")
    print(f"Results saved to 'verified_dealerships.csv'")

if __name__ == "__main__":
    main()
