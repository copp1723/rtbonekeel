#!/usr/bin/env python3

import os
import sys
import argparse
import pandas as pd
import json
import glob
from pathlib import Path
import time
from datetime import datetime
from log_manager import get_logger, with_logging
from database import init_db
from repositories import DealershipRepository, JobRepository, ErrorRepository
from tqdm import tqdm

logger = get_logger(__name__)

@with_logging
def migrate_dealerships_from_csv(csv_file):
    """Migrate dealership data from a CSV file."""
    try:
        logger.info(f"Migrating dealerships from CSV file: {csv_file}")
        
        # Read CSV file
        df = pd.read_csv(csv_file)
        logger.info(f"Found {len(df)} dealerships in CSV file")
        
        # Convert DataFrame to list of dictionaries
        dealerships_data = df.to_dict('records')
        
        # Bulk create or update dealerships
        created, updated = DealershipRepository.bulk_create_or_update(dealerships_data)
        
        logger.info(f"Migration completed: {created} dealerships created, {updated} dealerships updated")
        return created, updated
    except Exception as e:
        logger.error(f"Error migrating dealerships from CSV: {str(e)}")
        raise

@with_logging
def migrate_verification_results(results_dir):
    """Migrate verification results from results directory."""
    try:
        logger.info(f"Migrating verification results from directory: {results_dir}")
        
        # Find all CSV files in results directory
        csv_files = glob.glob(os.path.join(results_dir, "verified_dealerships_*.csv"))
        
        if not csv_files:
            logger.warning(f"No results files found in {results_dir}")
            return 0, 0
        
        logger.info(f"Found {len(csv_files)} result files")
        
        total_created = 0
        total_updated = 0
        
        # Process each CSV file
        for csv_file in tqdm(csv_files, desc="Migrating result files"):
            # Extract job ID from filename
            job_id = os.path.basename(csv_file).replace("verified_dealerships_", "").replace(".csv", "")
            
            # Check if job exists
            job = JobRepository.get_job(job_id)
            if not job:
                # Create job
                job = JobRepository.create_job(
                    job_id=job_id,
                    name=f"Imported Job {job_id}",
                    status="completed"
                )
                logger.info(f"Created job record for {job_id}")
            
            # Read CSV file
            df = pd.read_csv(csv_file)
            logger.info(f"Processing {len(df)} dealerships from job {job_id}")
            
            # Convert DataFrame to list of dictionaries
            dealerships_data = df.to_dict('records')
            
            # Bulk create or update dealerships
            created, updated = DealershipRepository.bulk_create_or_update(dealerships_data)
            total_created += created
            total_updated += updated
            
            # Look for stats file
            stats_file = os.path.join(results_dir, f"verification_stats_{job_id}.json")
            if os.path.exists(stats_file):
                with open(stats_file, 'r') as f:
                    stats = json.load(f)
                
                # Update job with stats
                JobRepository.update_job_status(
                    job_id=job_id,
                    status="completed",
                    processed_dealerships=stats.get('total_processed', 0),
                    active_websites=stats.get('active_websites', 0),
                    stats=stats
                )
                logger.info(f"Updated job {job_id} with stats")
        
        logger.info(f"Migration completed: {total_created} dealerships created, {total_updated} dealerships updated")
        return total_created, total_updated
    except Exception as e:
        logger.error(f"Error migrating verification results: {str(e)}")
        raise

@with_logging
def migrate_log_files(logs_dir):
    """Migrate error logs from log files."""
    try:
        logger.info(f"Migrating error logs from directory: {logs_dir}")
        
        # Find all log files
        log_files = glob.glob(os.path.join(logs_dir, "*.log"))
        
        if not log_files:
            logger.warning(f"No log files found in {logs_dir}")
            return 0
        
        logger.info(f"Found {len(log_files)} log files")
        
        total_errors = 0
        
        # Process each log file
        for log_file in tqdm(log_files, desc="Migrating log files"):
            # Read log file
            with open(log_file, 'r') as f:
                log_lines = f.readlines()
            
            # Extract error lines
            error_lines = [line for line in log_lines if " ERROR " in line]
            logger.info(f"Found {len(error_lines)} error lines in {log_file}")
            
            # Process each error line
            for line in error_lines:
                try:
                    # Extract error details
                    parts = line.split(" ERROR: ")
                    if len(parts) < 2:
                        continue
                    
                    timestamp_str = parts[0].split(" - ")[0].strip()
                    timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S,%f")
                    error_message = parts[1].strip()
                    
                    # Extract error type
                    error_type = "Unknown"
                    if ":" in error_message:
                        error_type = error_message.split(":")[0].strip()
                    
                    # Look for job ID or dealership identifier
                    job_id = None
                    dealership_id = None
                    
                    if "job_id" in error_message.lower():
                        # Try to extract job ID
                        start = error_message.lower().find("job_id") + 7
                        end = error_message.find(" ", start)
                        if end > start:
                            job_id = error_message[start:end].strip()
                    
                    # Log error
                    ErrorRepository.log_error(
                        error_type=error_type,
                        error_message=error_message,
                        job_id=job_id,
                        dealership_id=dealership_id,
                        timestamp=timestamp
                    )
                    total_errors += 1
                except Exception as e:
                    logger.error(f"Error processing log line: {str(e)}")
                    continue
        
        logger.info(f"Migration completed: {total_errors} errors migrated")
        return total_errors
    except Exception as e:
        logger.error(f"Error migrating log files: {str(e)}")
        raise

def main():
    parser = argparse.ArgumentParser(description='Migrate existing data to the database')
    parser.add_argument('--db-url', help='Database URL (default: use environment DATABASE_URL or SQLite)')
    parser.add_argument('--csv', help='CSV file containing dealership data')
    parser.add_argument('--results-dir', default='results', help='Directory containing verification results (default: results)')
    parser.add_argument('--logs-dir', default='logs', help='Directory containing log files (default: logs)')
    parser.add_argument('--skip-logs', action='store_true', help='Skip migrating log files')
    
    args = parser.parse_args()
    
    try:
        # Initialize database
        init_db(args.db_url)
        logger.info("Database connection initialized")
        
        # Migrate data from CSV file if provided
        if args.csv and os.path.exists(args.csv):
            migrate_dealerships_from_csv(args.csv)
        
        # Migrate verification results
        if os.path.exists(args.results_dir):
            migrate_verification_results(args.results_dir)
        else:
            logger.warning(f"Results directory not found: {args.results_dir}")
        
        # Migrate log files
        if not args.skip_logs and os.path.exists(args.logs_dir):
            migrate_log_files(args.logs_dir)
        elif args.skip_logs:
            logger.info("Skipping log file migration")
        else:
            logger.warning(f"Logs directory not found: {args.logs_dir}")
        
        logger.info("Data migration completed successfully")
        return 0
    except Exception as e:
        logger.error(f"Data migration failed: {str(e)}")
        return 1

if __name__ == '__main__':
    sys.exit(main())