import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import time
from datetime import datetime
from fuzzywuzzy import process
import os
import sys

def verify_dealership_url(url):
    """Check if dealership website is active and valid."""
    if not url or url == "N/A" or pd.isna(url):
        return False
    
    try:
        # Standardize URL format
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
            
        response = requests.head(
            url,
            timeout=5,
            allow_redirects=True
        )
        return response.status_code < 400
    except:
        return False

def batch_verify_urls(df, url_column='Website', batch_size=50):
    """Verify URLs in batches to prevent API overload."""
    print(f"Verifying {len(df)} URLs in batches of {batch_size}...")
    verified_status = []
    start_time = time.time()
    
    if url_column not in df.columns:
        print(f"⚠️ Column '{url_column}' not found. Available columns: {', '.join(df.columns)}")
        return [False] * len(df)
    
    for i in range(0, len(df), batch_size):
        end_idx = min(i + batch_size, len(df))
        batch = df.iloc[i:end_idx]
        batch_results = []
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(verify_dealership_url, url): idx 
                      for idx, url in enumerate(batch[url_column]) if not pd.isna(url)}
            
            for future in tqdm(as_completed(futures), 
                              total=len(futures), 
                              desc=f"Batch {i//batch_size + 1}"):
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
        
        print(f"✅ Verified {end_idx}/{len(df)} dealerships in {time.time() - start_time:.2f} sec")
        time.sleep(1)  # Prevent potential API throttling
    
    return verified_status

def extract_manufacturer(dealership_name, url=""):
    """Identify dealership brand using dealership name and URL."""
    major_brands = {
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
    
    # Check dealership name and URL for keywords
    name_and_url = (dealership_name.lower() + " " + str(url).lower()) if url else dealership_name.lower()
    
    for brand, keywords in major_brands.items():
        if any(kw in name_and_url for kw in keywords):
            return brand
    
    # Try fuzzy matching as last resort
    best_match = process.extractOne(dealership_name, major_brands.keys())
    return best_match[0] if best_match and best_match[1] > 80 else "Other"

def clean_and_standardize(df):
    """Clean and standardize the dealership data."""
    print("Cleaning and standardizing data...")
    
    # Make a copy to avoid warnings
    cleaned_df = df.copy()
    
    # Basic cleaning - map to your specific column names
    column_mapping = {
        'name': 'Dealership',
        'address': 'Address',
        'city': 'City',
        'state': 'State',
        'zip': 'Zip',
        'url': 'Website'
    }
    
    # Check if columns exist
    for std_col, data_col in column_mapping.items():
        if data_col not in cleaned_df.columns:
            print(f"⚠️ Warning: Column '{data_col}' not found in the data")
    
    # Clean each column if it exists
    for std_col, data_col in column_mapping.items():
        if data_col in cleaned_df.columns and cleaned_df[data_col].dtype == 'object':
            cleaned_df[data_col] = cleaned_df[data_col].fillna("")
            
            if std_col in ['name', 'address', 'city']:
                cleaned_df[data_col] = cleaned_df[data_col].str.strip().str.title()
            elif std_col == 'state':
                cleaned_df[data_col] = cleaned_df[data_col].str.strip().str.upper()
            elif std_col == 'zip':
                cleaned_df[data_col] = cleaned_df[data_col].astype(str).str.strip()
            elif std_col == 'url':
                # Handle URLs - remove http/https and www for standardization
                cleaned_df[data_col] = cleaned_df[data_col].str.strip().str.lower()
                cleaned_df[data_col] = cleaned_df[data_col].str.replace(r'^https?://', '', regex=True)
                cleaned_df[data_col] = cleaned_df[data_col].str.replace(r'^www\.', '', regex=True)
    
    # Remove duplicates
    before_count = len(cleaned_df)
    if all(col in cleaned_df.columns for col in ['Dealership', 'City', 'State']):
        cleaned_df = cleaned_df.drop_duplicates(subset=['Dealership', 'City', 'State'])
        print(f"Removed {before_count - len(cleaned_df)} duplicates")
    
    return cleaned_df

def main():
    print("🚗 Starting dealership verification process...")
    
    # Figure out which file to use
    input_file = None
    
    # Check for command line argument
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        if not os.path.exists(input_file):
            print(f"⚠️ File not found: {input_file}")
            input_file = None
    
    # If no command line argument, look for files in the directory
    if input_file is None:
        for file in os.listdir('.'):
            if file.endswith('.csv') or file.endswith('.xlsx') or file.endswith('.xls'):
                input_file = file
                break
    
    if input_file is None:
        print("❌ No CSV or Excel file found. Please provide a file path.")
        return
    
    print(f"📊 Using input file: {input_file}")
    
    # Load the input file based on extension
    try:
        if input_file.endswith('.csv'):
            raw_df = pd.read_csv(input_file)
        elif input_file.endswith(('.xlsx', '.xls')):
            raw_df = pd.read_excel(input_file)
        else:
            print(f"❌ Unsupported file format: {input_file}")
            return
            
        print(f"✓ Loaded {len(raw_df)} records from {input_file}")
        
        # Display column names to help debug
        print(f"📋 Columns found: {', '.join(raw_df.columns)}")
        
        # Check if we need to create a master file or append to existing
        if os.path.exists('master_dealerships.csv'):
            print("Updating existing master file...")
            master_df = pd.read_csv('master_dealerships.csv')
            print(f"Existing records: {len(master_df)}")
            
            # Clean new data
            cleaned_df = clean_and_standardize(raw_df)
            
            # Find which ones are new
            if 'Dealership' in cleaned_df.columns and 'City' in cleaned_df.columns and 'State' in cleaned_df.columns:
                existing_keys = set()
                for _, row in master_df.iterrows():
                    key = (row['Dealership'], row['City'], row['State'])
                    existing_keys.add(key)
                
                new_records = []
                for _, row in cleaned_df.iterrows():
                    key = (row['Dealership'], row['City'], row['State'])
                    if key not in existing_keys:
                        new_row = row.copy()
                        new_row['verification_status'] = 'unverified'
                        new_row['last_checked'] = None
                        new_row['data_source'] = os.path.basename(input_file)
                        new_records.append(new_row)
                
                if new_records:
                    new_df = pd.DataFrame(new_records)
                    master_df = pd.concat([master_df, new_df], ignore_index=True)
                    print(f"Added {len(new_records)} new records to master file")
                else:
                    print("No new records found to add")
            else:
                print("⚠️ Cannot match records without Dealership, City, and State columns")
        else:
            # First time creating master file
            cleaned_df = clean_and_standardize(raw_df)
            master_df = cleaned_df.copy()
            master_df['verification_status'] = 'unverified'
            master_df['last_checked'] = None
            master_df['data_source'] = os.path.basename(input_file)
            print(f"Created new master dataset with {len(master_df)} records")
        
        # Save master file
        master_df.to_csv('master_dealerships.csv', index=False)
        
        # Run verification on a batch
        batch_size = min(50, len(master_df))  # Start small for testing
        batch = master_df[master_df['verification_status'] == 'unverified'].head(batch_size)
        
        if not batch.empty:
            print(f"Verifying batch of {len(batch)} dealerships...")
            
            # Verify URLs
            url_statuses = batch_verify_urls(batch, url_column='Website')
            
            # Update verification info in the batch
            batch_copy = batch.copy()
            batch_copy['url_active'] = url_statuses
            batch_copy['verification_status'] = 'verified'
            batch_copy['last_checked'] = datetime.now().strftime('%Y-%m-%d')
            
            # Add manufacturer categorization
            batch_copy['manufacturer'] = batch_copy.apply(
                lambda row: extract_manufacturer(row['Dealership'], row.get('Website', '')), axis=1
            )
            
            # Update master dataset with verified results
            for idx, row in batch_copy.iterrows():
                match_mask = (
                    (master_df['Dealership'] == row['Dealership']) & 
                    (master_df['City'] == row['City']) & 
                    (master_df['State'] == row['State'])
                )
                
                if match_mask.any():
                    master_df.loc[match_mask, 'verification_status'] = row['verification_status']
                    master_df.loc[match_mask, 'last_checked'] = row['last_checked']
                    master_df.loc[match_mask, 'url_active'] = row['url_active']
                    master_df.loc[match_mask, 'manufacturer'] = row['manufacturer']
            
            # Save updated master dataset
            master_df.to_csv('master_dealerships.csv', index=False)
            batch_copy.to_csv('last_verified_batch.csv', index=False)
            
            # URL status summary
            active_urls = sum(url_statuses)
            print(f"\nVerification complete!")
            print(f"Active URLs: {active_urls}/{len(url_statuses)} ({active_urls/len(url_statuses)*100:.1f}%)")
            
            # Manufacturer breakdown
            print("\n🏢 Manufacturer Breakdown (this batch):")
            mfr_counts = batch_copy['manufacturer'].value_counts()
            for mfr, count in mfr_counts.items():
                print(f"  {mfr}: {count} ({count/len(batch_copy)*100:.1f}%)")
        else:
            print("No unverified dealerships found in the dataset")
            
    except Exception as e:
        print(f"❌ Error processing file: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
