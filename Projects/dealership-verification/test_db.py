#!/usr/bin/env python3

import os
import sys
import argparse
from log_manager import get_logger
from database import init_db, session_scope
from models import Dealership, Contact, VerificationJob, ErrorLog
from repositories import DealershipRepository, JobRepository, ErrorRepository
from datetime import datetime

logger = get_logger(__name__)

def test_database_connection(db_url=None):
    """Test database connection."""
    try:
        logger.info("Testing database connection...")
        db_manager = init_db(db_url)
        logger.info(f"Successfully connected to database: {db_manager.db_url}")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        return False

def test_crud_operations():
    """Test CRUD operations on the database."""
    try:
        logger.info("Testing CRUD operations...")
        
        # Create test dealership
        test_name = f"Test Dealership {datetime.now().timestamp()}"
        test_website = f"https://test-{int(datetime.now().timestamp())}.example.com"
        
        # Create
        logger.info("Testing create operation...")
        dealership_id = DealershipRepository.create_dealership(
            name=test_name,
            website=test_website,
            manufacturer="Test"
        )
        
        # Read
        logger.info("Testing read operation...")
        retrieved = DealershipRepository.get_dealership_by_id(dealership_id)
        assert retrieved is not None, "Failed to retrieve dealership by ID"
        assert retrieved['name'] == test_name, "Retrieved dealership has incorrect name"
        
        # Update
        logger.info("Testing update operation...")
        DealershipRepository.update_dealership(
            dealership_id=dealership_id,
            is_active=True,
            status="tested"
        )
        
        # Read again to verify update
        retrieved = DealershipRepository.get_dealership_by_id(dealership_id)
        assert retrieved['is_active'] is True, "Update failed: is_active not set to True"
        assert retrieved['status'] == "tested", "Update failed: status not set to 'tested'"
        
        # Add contact
        logger.info("Testing contact creation...")
        contact = DealershipRepository.add_contact(
            dealership_id=dealership_id,
            contact_type="email",
            value=f"test-{int(datetime.now().timestamp())}@example.com"
        )
        assert contact is not None, "Failed to create contact"
        
        # Get contacts
        contacts = DealershipRepository.get_contacts(dealership_id)
        assert len(contacts) > 0, "No contacts found for dealership"
        
        # Create job
        logger.info("Testing job creation...")
        test_job_id = f"test-job-{int(datetime.now().timestamp())}"
        created_job_id = JobRepository.create_job(
            job_id=test_job_id,
            name="Test Job"
        )
        assert created_job_id == test_job_id, "Job ID mismatch"
        
        # Add dealership to job
        JobRepository.add_dealership_to_job(
            job_id=test_job_id,
            dealership_id=dealership_id
        )
        
        # Update job status
        JobRepository.update_job_status(
            job_id=test_job_id,
            status="completed",
            processed_dealerships=1,
            active_websites=1
        )
        
        # Retrieve job
        job = JobRepository.get_job(test_job_id)
        assert job is not None, "Failed to retrieve job"
        assert job['status'] == "completed", "Job status not updated"
        
        # Log error
        logger.info("Testing error logging...")
        error = ErrorRepository.log_error(
            error_type="TestError",
            error_message="This is a test error",
            dealership_id=dealership_id,
            job_id=test_job_id
        )
        assert error is not None, "Failed to log error"
        
        # Get errors
        errors = ErrorRepository.get_errors_by_job(test_job_id)
        assert len(errors) > 0, "No errors found for job"
        
        # Clean up
        logger.info("Cleaning up test data...")
        with session_scope() as session:
            # Delete error logs
            session.query(ErrorLog).filter_by(job_id=test_job_id).delete()
            
            # Delete job
            job = session.query(VerificationJob).filter_by(job_id=test_job_id).first()
            if job:
                session.delete(job)
            
            # Delete dealership (contacts will be cascade deleted)
            dealership = session.query(Dealership).filter_by(id=dealership_id).first()
            if dealership:
                session.delete(dealership)
        
        logger.info("CRUD tests completed successfully")
        return True
    except Exception as e:
        logger.error(f"Error during CRUD tests: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Test the database setup')
    parser.add_argument('--db-url', help='Database URL (default: use environment DATABASE_URL or SQLite)')
    parser.add_argument('--skip-crud', action='store_true', help='Skip CRUD tests')
    
    args = parser.parse_args()
    
    # Test database connection
    if not test_database_connection(args.db_url):
        logger.error("Database connection test failed")
        return 1
    
    # Test CRUD operations
    if not args.skip_crud:
        if not test_crud_operations():
            logger.error("CRUD tests failed")
            return 1
    
    logger.info("All database tests passed successfully")
    return 0

if __name__ == '__main__':
    sys.exit(main())