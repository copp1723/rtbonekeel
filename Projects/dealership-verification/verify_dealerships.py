#!/usr/bin/env python3

import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import time
import argparse

def verify_url(url):
    """Verify if a URL is active and accessible."""
    if not url or pd.isna(url):
        return False, None

    try:
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'

        response = requests.head(
            url,
            timeout=5,
            allow_redirects=True,
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        return response.status_code < 400, response.url
    except Exception as e:
        print(f"Error checking {url}: {str(e)}")
        return False, None

def identify_manufacturer(name, url=""):
    """Identify manufacturer based on dealership name and URL."""
    manufacturer_data = {
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
    
    name_and_url = (str(name).lower() + " " + str(url).lower()) if url else str(name).lower()
    
    for brand, keywords in manufacturer_data.items():
        if any(kw in name_and_url for kw in keywords):
            return brand
    
    return "Other"

def main():
    parser = argparse.ArgumentParser(description='Dealership URL Verification Sample')
    parser.add_argument('input_file', help='Path to the dealership data CSV file')
    parser.add_argument('--sample', type=int, default=10, help='Number of dealerships to sample')
    args = parser.parse_args()
    
    print(f"🚗 Dealership Verification Sample")
    print(f"Loading data from {args.input_file}...")
    
    try:
        df = pd.read_csv(args.input_file)
        print(f"Loaded {len(df)} dealerships")
        
        # Take a sample
        sample_size = min(args.sample, len(df))
        sample_df = df.sample(sample_size) if sample_size < len(df) else df
        print(f"Processing sample of {len(sample_df)} dealerships")
        
        # Process the sample
        results = []
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_idx = {
                executor.submit(verify_url, row['Website']): idx 
                for idx, row in sample_df.iterrows()
            }
            
            for future in tqdm(as_completed(future_to_idx), total=len(future_to_idx)):
                idx = future_to_idx[future]
                is_active, final_url = future.result()
                
                row = sample_df.loc[idx]
                manufacturer = identify_manufacturer(row['Dealership'], row['Website'])
                
                results.append({
                    'Dealership': row['Dealership'],
                    'Website': row['Website'],
                    'City': row['City'],
                    'State': row['State'],
                    'is_active': is_active,
                    'verified_url': final_url,
                    'manufacturer': manufacturer
                })
        
        # Create results DataFrame and save
        results_df = pd.DataFrame(results)
        output_file = 'verified_sample.csv'
        results_df.to_csv(output_file, index=False)
        
        # Print summary
        active_count = results_df['is_active'].sum()
        print(f"\n✅ Verification complete!")
        print(f"Total dealerships: {len(results_df)}")
        print(f"Active websites: {active_count} ({active_count/len(results_df)*100:.1f}%)")
        print(f"Results saved to {output_file}")
        
        # Show manufacturer distribution
        print("\nManufacturer Distribution:")
        for manufacturer, count in results_df['manufacturer'].value_counts().items():
            print(f"  {manufacturer}: {count}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    main() 