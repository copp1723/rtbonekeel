#!/usr/bin/env python3

import pandas as pd
import argparse
import re
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def clean_dealership_name(name):
    """Standardize dealership name format."""
    if pd.isna(name) or not name:
        return ""
    
    # Convert to title case
    name = str(name).strip().title()
    
    # Fix common abbreviations
    name = re.sub(r'\bAuto\b', 'Auto', name, flags=re.IGNORECASE)
    name = re.sub(r'\bGmc\b', 'GMC', name)
    name = re.sub(r'\bBmw\b', 'BMW', name)
    name = re.sub(r'\bVw\b', 'VW', name)
    
    return name

def clean_website(url):
    """Standardize website URL format."""
    if pd.isna(url) or not url:
        return ""
    
    # Convert to lowercase
    url = str(url).strip().lower()
    
    # Remove http/https and www
    url = re.sub(r'^https?://', '', url)
    url = re.sub(r'^www\.', '', url)
    
    # Remove trailing slashes
    url = url.rstrip('/')
    
    return url

def clean_address(address):
    """Standardize address format."""
    if pd.isna(address) or not address:
        return ""
    
    # Convert to title case
    address = str(address).strip().title()
    
    # Fix common abbreviations
    address = re.sub(r'\bSt\b', 'St', address)
    address = re.sub(r'\bAve\b', 'Ave', address)
    address = re.sub(r'\bRd\b', 'Rd', address)
    address = re.sub(r'\bBlvd\b', 'Blvd', address)
    address = re.sub(r'\bPkwy\b', 'Pkwy', address)
    address = re.sub(r'\bHwy\b', 'Hwy', address)
    
    return address

def clean_state(state):
    """Standardize state format."""
    if pd.isna(state) or not state:
        return ""
    
    # Convert to uppercase
    state = str(state).strip().upper()
    
    # Ensure 2-letter state code
    if len(state) > 2:
        # This is a simplified example - a real implementation would have a full state name to code mapping
        state_mapping = {
            'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR',
            'CALIFORNIA': 'CA', 'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE',
            'FLORIDA': 'FL', 'GEORGIA': 'GA', 'HAWAII': 'HI', 'IDAHO': 'ID',
            'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA', 'KANSAS': 'KS',
            'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
            'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS',
            'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV',
            'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
            'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK',
            'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
            'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT',
            'VERMONT': 'VT', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV',
            'WISCONSIN': 'WI', 'WYOMING': 'WY', 'DISTRICT OF COLUMBIA': 'DC'
        }
        state = state_mapping.get(state, state[:2])
    
    return state

def clean_zip(zip_code):
    """Standardize ZIP code format."""
    if pd.isna(zip_code) or not zip_code:
        return ""
    
    # Convert to string and strip
    zip_code = str(zip_code).strip()
    
    # Extract digits only
    zip_digits = re.sub(r'\D', '', zip_code)
    
    # Format as 5-digit ZIP
    if len(zip_digits) >= 5:
        return zip_digits[:5]
    else:
        return zip_digits.zfill(5)

def clean_phone(phone):
    """Standardize phone number format."""
    if pd.isna(phone) or not phone:
        return ""
    
    # Extract digits only
    phone_digits = re.sub(r'\D', '', str(phone))
    
    # Format as (XXX) XXX-XXXX
    if len(phone_digits) >= 10:
        return f"({phone_digits[-10:-7]}) {phone_digits[-7:-4]}-{phone_digits[-4:]}"
    else:
        return phone_digits

def clean_and_standardize(df):
    """Clean and standardize the dealership data."""
    logging.info("Cleaning and standardizing data...")
    
    # Make a copy to avoid warnings
    cleaned_df = df.copy()
    
    # Apply cleaning functions to each column if it exists
    if 'Dealership' in cleaned_df.columns:
        cleaned_df['Dealership'] = cleaned_df['Dealership'].apply(clean_dealership_name)
    
    if 'Website' in cleaned_df.columns:
        cleaned_df['Website'] = cleaned_df['Website'].apply(clean_website)
    
    if 'Address' in cleaned_df.columns:
        cleaned_df['Address'] = cleaned_df['Address'].apply(clean_address)
    
    if 'City' in cleaned_df.columns:
        cleaned_df['City'] = cleaned_df['City'].apply(lambda x: str(x).strip().title() if not pd.isna(x) else "")
    
    if 'State' in cleaned_df.columns:
        cleaned_df['State'] = cleaned_df['State'].apply(clean_state)
    
    if 'Zip' in cleaned_df.columns:
        cleaned_df['Zip'] = cleaned_df['Zip'].apply(clean_zip)
    
    if 'Phone' in cleaned_df.columns:
        cleaned_df['Phone'] = cleaned_df['Phone'].apply(clean_phone)
    
    # Remove duplicates
    before_count = len(cleaned_df)
    if all(col in cleaned_df.columns for col in ['Dealership', 'City', 'State']):
        cleaned_df = cleaned_df.drop_duplicates(subset=['Dealership', 'City', 'State'])
        logging.info(f"Removed {before_count - len(cleaned_df)} duplicates")
    
    return cleaned_df

def main():
    parser = argparse.ArgumentParser(description='Clean and standardize dealership data')
    parser.add_argument('input_file', help='Path to the input CSV file')
    parser.add_argument('--output', help='Path to the output CSV file', default='cleaned_dealerships.csv')
    
    args = parser.parse_args()
    
    try:
        # Load the data
        logging.info(f"Loading data from {args.input_file}...")
        df = pd.read_csv(args.input_file)
        logging.info(f"Loaded {len(df)} records")
        
        # Clean and standardize
        cleaned_df = clean_and_standardize(df)
        
        # Save the cleaned data
        cleaned_df.to_csv(args.output, index=False)
        logging.info(f"Saved {len(cleaned_df)} cleaned records to {args.output}")
        
        # Print sample of cleaned data
        print("\nSample of cleaned data:")
        print(cleaned_df.head())
        
    except Exception as e:
        logging.error(f"Error: {str(e)}")

if __name__ == '__main__':
    main() 