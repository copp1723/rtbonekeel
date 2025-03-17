#!/usr/bin/env python3

import os
import sys
import argparse
from database import init_db, create_tables
from models import Base
from log_manager import get_logger

logger = get_logger(__name__)

def setup_database(db_url=None, drop_existing=False):
    """Set up the database."""
    try:
        # Initialize the database
        db_manager = init_db(db_url)
        logger.info(f"Connected to database: {db_manager.db_url}")
        
        if drop_existing:
            logger.warning("Dropping existing tables...")
            db_manager.drop_tables()
            logger.info("Existing tables dropped")
        
        # Create tables
        logger.info("Creating database tables...")
        create_tables()
        logger.info("Database tables created successfully")
        
        return True
    except Exception as e:
        logger.error(f"Error setting up database: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Initialize the dealership verification database')
    parser.add_argument('--db-url', help='Database URL (default: use environment DATABASE_URL or SQLite)')
    parser.add_argument('--drop', action='store_true', help='Drop existing tables before creating new ones')
    
    args = parser.parse_args()
    
    if setup_database(args.db_url, args.drop):
        logger.info("Database initialization completed successfully")
        return 0
    else:
        logger.error("Database initialization failed")
        return 1

if __name__ == '__main__':
    sys.exit(main())