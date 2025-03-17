from models import Dealership, Contact, VerificationJob, ErrorLog, StaffMember
from database import session_scope, get_session
from log_manager import get_logger
from sqlalchemy import and_, or_, func
from datetime import datetime
import json
from typing import List, Dict, Any, Optional, Tuple, Union

logger = get_logger(__name__)

class DealershipRepository:
    """
    Repository class for dealership data operations.
    """
    
    @staticmethod
    def create_dealership(name: str, website: str, manufacturer: str = None, **kwargs) -> int:
        """Create a new dealership record and return its ID."""
        with session_scope() as session:
            dealership = Dealership(
                name=name,
                website=website,
                manufacturer=manufacturer,
                **kwargs
            )
            session.add(dealership)
            session.flush()  # Flush to get the ID
            dealership_id = dealership.id
            logger.info(f"Created dealership: {name} (ID: {dealership_id})")
            return dealership_id
    
    @staticmethod
    def get_dealership_by_id(dealership_id: int) -> Optional[Dict]:
        """Get a dealership by ID as a dictionary."""
        with session_scope() as session:
            dealership = session.query(Dealership).filter(Dealership.id == dealership_id).first()
            if dealership:
                # Convert to dictionary
                return {
                    'id': dealership.id,
                    'name': dealership.name,
                    'website': dealership.website,
                    'manufacturer': dealership.manufacturer,
                    'is_active': dealership.is_active,
                    'final_url': dealership.final_url,
                    'status': dealership.status,
                    'last_checked': dealership.last_checked,
                    'date_added': dealership.date_added
                }
            return None
    
    @staticmethod
    def get_dealership_by_website(website: str) -> Optional[Dealership]:
        """Get a dealership by website URL."""
        with session_scope() as session:
            return session.query(Dealership).filter(Dealership.website == website).first()
    
    @staticmethod
    def update_dealership(dealership_id: int, **kwargs) -> bool:
        """Update a dealership's attributes."""
        with session_scope() as session:
            dealership = session.query(Dealership).filter(Dealership.id == dealership_id).first()
            if not dealership:
                logger.warning(f"Attempted to update non-existent dealership ID: {dealership_id}")
                return False
            
            # Update attributes
            for key, value in kwargs.items():
                if hasattr(dealership, key):
                    setattr(dealership, key, value)
            
            # Update last_updated timestamp
            dealership.last_updated = datetime.utcnow()
            return True
    
    @staticmethod
    def get_dealerships(offset: int = 0, limit: int = 100, 
                         filters: Dict = None) -> Tuple[List[Dealership], int]:
        """
        Get dealerships with pagination and filtering.
        
        Args:
            offset: Number of records to skip
            limit: Maximum number of records to return
            filters: Dictionary of filter conditions
            
        Returns:
            Tuple of (list of dealerships, total count)
        """
        with session_scope() as session:
            query = session.query(Dealership)
            
            # Apply filters if provided
            if filters:
                if 'manufacturer' in filters:
                    query = query.filter(Dealership.manufacturer == filters['manufacturer'])
                if 'is_active' in filters:
                    query = query.filter(Dealership.is_active == filters['is_active'])
                if 'status' in filters:
                    query = query.filter(Dealership.status == filters['status'])
                if 'search' in filters and filters['search']:
                    search_term = f"%{filters['search']}%"
                    query = query.filter(
                        or_(
                            Dealership.name.ilike(search_term),
                            Dealership.website.ilike(search_term)
                        )
                    )
            
            # Get total count before pagination
            total_count = query.count()
            
            # Apply pagination
            dealerships = query.order_by(Dealership.date_added.desc()).offset(offset).limit(limit).all()
            
            return dealerships, total_count
    
    @staticmethod
    def add_contact(dealership_id: int, contact_type: str, value: str) -> Optional[Contact]:
        """Add a contact to a dealership."""
        with session_scope() as session:
            # Check if the dealership exists
            dealership = session.query(Dealership).filter(Dealership.id == dealership_id).first()
            if not dealership:
                logger.warning(f"Attempted to add contact to non-existent dealership ID: {dealership_id}")
                return None
            
            # Check if the contact already exists
            existing_contact = session.query(Contact).filter(
                and_(
                    Contact.dealership_id == dealership_id,
                    Contact.type == contact_type,
                    Contact.value == value
                )
            ).first()
            
            if existing_contact:
                logger.debug(f"Contact already exists: {contact_type} - {value}")
                return existing_contact
            
            # Create new contact
            contact = Contact(
                dealership_id=dealership_id,
                type=contact_type,
                value=value,
                date_extracted=datetime.utcnow()
            )
            session.add(contact)
            session.flush()
            return contact
    
    @staticmethod
    def get_contacts(dealership_id: int, contact_type: str = None) -> List[Contact]:
        """Get all contacts for a dealership."""
        with session_scope() as session:
            query = session.query(Contact).filter(Contact.dealership_id == dealership_id)
            
            if contact_type:
                query = query.filter(Contact.type == contact_type)
                
            return query.all()
    
    @staticmethod
    def delete_dealership(dealership_id: int) -> bool:
        """Delete a dealership and its contacts."""
        with session_scope() as session:
            dealership = session.query(Dealership).filter(Dealership.id == dealership_id).first()
            if not dealership:
                logger.warning(f"Attempted to delete non-existent dealership ID: {dealership_id}")
                return False
            
            session.delete(dealership)  # Cascade will delete contacts
            return True
    
    @staticmethod
    def bulk_create_or_update(dealerships_data: List[Dict]) -> Tuple[int, int]:
        """
        Bulk create or update dealerships.
        
        Args:
            dealerships_data: List of dictionaries with dealership data
            
        Returns:
            Tuple of (created count, updated count)
        """
        created_count = 0
        updated_count = 0
        
        with session_scope() as session:
            for data in dealerships_data:
                website = data.get('Website')
                if not website:
                    logger.warning("Skipping dealership record without website")
                    continue
                
                # Check if dealership exists
                dealership = session.query(Dealership).filter(Dealership.website == website).first()
                
                if dealership:
                    # Update existing dealership
                    dealership.name = data.get('DealershipName', dealership.name)
                    dealership.is_active = data.get('IsActive', dealership.is_active)
                    dealership.final_url = data.get('FinalURL', dealership.final_url)
                    dealership.manufacturer = data.get('Manufacturer', dealership.manufacturer)
                    dealership.last_checked = datetime.utcnow()
                    dealership.status = data.get('Status', 'processed')
                    updated_count += 1
                else:
                    # Create new dealership
                    dealership = Dealership(
                        name=data.get('DealershipName', ''),
                        website=website,
                        is_active=data.get('IsActive', False),
                        final_url=data.get('FinalURL', website),
                        manufacturer=data.get('Manufacturer', 'Unknown'),
                        last_checked=datetime.utcnow(),
                        status='processed'
                    )
                    session.add(dealership)
                    session.flush()  # Get ID
                    created_count += 1
                
                # Process contacts if provided
                contacts_json = data.get('Contacts')
                if contacts_json:
                    try:
                        if isinstance(contacts_json, str):
                            contacts = json.loads(contacts_json)
                        else:
                            contacts = contacts_json
                            
                        for contact in contacts:
                            contact_type = contact.get('type')
                            value = contact.get('value')
                            if contact_type and value:
                                # Check if contact exists
                                existing = session.query(Contact).filter(
                                    and_(
                                        Contact.dealership_id == dealership.id,
                                        Contact.type == contact_type,
                                        Contact.value == value
                                    )
                                ).first()
                                
                                if not existing:
                                    new_contact = Contact(
                                        dealership_id=dealership.id,
                                        type=contact_type,
                                        value=value,
                                        date_extracted=datetime.utcnow()
                                    )
                                    session.add(new_contact)
                    except Exception as e:
                        logger.error(f"Error processing contacts for {website}: {str(e)}")
        
        return created_count, updated_count


class JobRepository:
    """
    Repository class for verification job operations.
    """
    
    @staticmethod
    def create_job(job_id: str, name: str = None, **kwargs) -> str:
        """Create a new verification job and return its job_id."""
        with session_scope() as session:
            job = VerificationJob(
                job_id=job_id,
                name=name or f"Job {job_id}",
                status='pending',
                start_time=datetime.utcnow(),
                **kwargs
            )
            session.add(job)
            session.flush()
            logger.info(f"Created verification job: {job.id} (job_id: {job_id})")
            return job_id
    
    @staticmethod
    def get_job(job_id: str) -> Optional[Dict]:
        """Get a job by its job_id as a dictionary."""
        with session_scope() as session:
            job = session.query(VerificationJob).filter(VerificationJob.job_id == job_id).first()
            if job:
                # Convert to dictionary
                return {
                    'id': job.id,
                    'job_id': job.job_id,
                    'name': job.name,
                    'status': job.status,
                    'start_time': job.start_time,
                    'end_time': job.end_time,
                    'total_dealerships': job.total_dealerships,
                    'processed_dealerships': job.processed_dealerships,
                    'active_websites': job.active_websites
                }
            return None
    
    @staticmethod
    def update_job_status(job_id: str, status: str, **kwargs) -> bool:
        """Update a job's status and other attributes."""
        with session_scope() as session:
            job = session.query(VerificationJob).filter(VerificationJob.job_id == job_id).first()
            if not job:
                logger.warning(f"Attempted to update non-existent job: {job_id}")
                return False
            
            job.status = status
            
            # Set end time if job is completed or failed
            if status in ('completed', 'failed'):
                job.end_time = datetime.utcnow()
            
            # Update other attributes
            for key, value in kwargs.items():
                if hasattr(job, key):
                    setattr(job, key, value)
            
            # Update stats
            if status == 'completed':
                job.update_stats()
                
            return True
    
    @staticmethod
    def add_dealership_to_job(job_id: str, dealership_id: int) -> bool:
        """Add a dealership to a job."""
        with session_scope() as session:
            job = session.query(VerificationJob).filter(VerificationJob.job_id == job_id).first()
            if not job:
                logger.warning(f"Attempted to add dealership to non-existent job: {job_id}")
                return False
                
            dealership = session.query(Dealership).filter(Dealership.id == dealership_id).first()
            if not dealership:
                logger.warning(f"Attempted to add non-existent dealership ID: {dealership_id} to job")
                return False
            
            # Check if already in job
            if dealership in job.dealerships:
                return True
                
            job.dealerships.append(dealership)
            job.total_dealerships = len(job.dealerships)
            return True
    
    @staticmethod
    def get_recent_jobs(limit: int = 10) -> List[VerificationJob]:
        """Get recent verification jobs."""
        with session_scope() as session:
            return session.query(VerificationJob).order_by(VerificationJob.start_time.desc()).limit(limit).all()


class ErrorRepository:
    """
    Repository class for error log operations.
    """
    
    @staticmethod
    def log_error(error_type: str, error_message: str, 
                  dealership_id: int = None, job_id: str = None, 
                  resource_key: str = None, correlation_id: str = None,
                  context: Dict = None) -> ErrorLog:
        """Log an error."""
        with session_scope() as session:
            error_log = ErrorLog(
                dealership_id=dealership_id,
                job_id=job_id,
                error_type=error_type,
                error_message=error_message,
                resource_key=resource_key,
                correlation_id=correlation_id,
                context=context or {}
            )
            session.add(error_log)
            return error_log
    
    @staticmethod
    def get_errors_by_job(job_id: str, limit: int = 100) -> List[ErrorLog]:
        """Get errors for a specific job."""
        with session_scope() as session:
            return session.query(ErrorLog).filter(ErrorLog.job_id == job_id).order_by(ErrorLog.timestamp.desc()).limit(limit).all()
    
    @staticmethod
    def get_errors_by_dealership(dealership_id: int, limit: int = 100) -> List[ErrorLog]:
        """Get errors for a specific dealership."""
        with session_scope() as session:
            return session.query(ErrorLog).filter(ErrorLog.dealership_id == dealership_id).order_by(ErrorLog.timestamp.desc()).limit(limit).all()
    
    @staticmethod
    def get_recent_errors(limit: int = 100) -> List[ErrorLog]:
        """Get recent errors."""
        with session_scope() as session:
            return session.query(ErrorLog).order_by(ErrorLog.timestamp.desc()).limit(limit).all()


class StaffRepository:
    """
    Repository class for staff member data operations.
    """
    
    @staticmethod
    def create_staff_member(dealership_id: int, name: str, **kwargs) -> int:
        """
        Create a new staff member record and return its ID.
        
        Args:
            dealership_id: ID of the dealership
            name: Name of the staff member
            **kwargs: Additional staff attributes
        
        Returns:
            int: New staff member ID
        """
        with session_scope() as session:
            staff_member = StaffMember(
                dealership_id=dealership_id,
                name=name,
                title=kwargs.get('title'),
                email=kwargs.get('email'),
                phone=kwargs.get('phone'),
                photo_url=kwargs.get('photo_url'),
                role_category=kwargs.get('role_category', 'general'),
                priority=kwargs.get('priority', 0),
                confidence=kwargs.get('confidence', 0),
                metadata=kwargs.get('metadata', {})
            )
            session.add(staff_member)
            session.flush()
            
            # Update the dealership to indicate it has staff info
            dealership = session.query(Dealership).filter(Dealership.id == dealership_id).first()
            if dealership:
                dealership.has_staff_info = True
                dealership.last_updated = datetime.utcnow()
            
            return staff_member.id
    
    @staticmethod
    def get_staff_by_dealership(dealership_id: int) -> List[StaffMember]:
        """
        Get all staff members for a dealership, sorted by priority.
        
        Args:
            dealership_id: ID of the dealership
            
        Returns:
            List[StaffMember]: List of staff members
        """
        with session_scope() as session:
            return session.query(StaffMember)\
                .filter(StaffMember.dealership_id == dealership_id)\
                .order_by(StaffMember.priority.desc(), StaffMember.confidence.desc())\
                .all()
    
    @staticmethod
    def get_management_staff(dealership_id: int) -> List[StaffMember]:
        """
        Get management staff members for a dealership.
        
        Args:
            dealership_id: ID of the dealership
            
        Returns:
            List[StaffMember]: List of management staff members
        """
        with session_scope() as session:
            return session.query(StaffMember)\
                .filter(and_(
                    StaffMember.dealership_id == dealership_id,
                    StaffMember.role_category == 'management'
                ))\
                .order_by(StaffMember.priority.desc(), StaffMember.confidence.desc())\
                .all()
    
    @staticmethod
    def get_sales_staff(dealership_id: int) -> List[StaffMember]:
        """
        Get sales staff members for a dealership.
        
        Args:
            dealership_id: ID of the dealership
            
        Returns:
            List[StaffMember]: List of sales staff members
        """
        with session_scope() as session:
            return session.query(StaffMember)\
                .filter(and_(
                    StaffMember.dealership_id == dealership_id,
                    StaffMember.role_category == 'sales'
                ))\
                .order_by(StaffMember.priority.desc(), StaffMember.confidence.desc())\
                .all()
    
    @staticmethod
    def bulk_create_staff(dealership_id: int, staff_data: List[Dict]) -> List[int]:
        """
        Bulk create staff members for a dealership.
        
        Args:
            dealership_id: ID of the dealership
            staff_data: List of staff member data dictionaries
            
        Returns:
            List[int]: List of created staff member IDs
        """
        if not staff_data:
            return []
            
        staff_ids = []
        with session_scope() as session:
            # Delete existing staff for this dealership to avoid duplicates
            session.query(StaffMember).filter(StaffMember.dealership_id == dealership_id).delete()
            
            # Add new staff members
            for staff_info in staff_data:
                staff_member = StaffMember(
                    dealership_id=dealership_id,
                    name=staff_info.get('name'),
                    title=staff_info.get('title'),
                    email=staff_info.get('email'),
                    phone=staff_info.get('phone'),
                    photo_url=staff_info.get('photo_url'),
                    role_category=staff_info.get('role_category', 'general'),
                    priority=staff_info.get('priority', 0),
                    confidence=staff_info.get('confidence', 0),
                    metadata=staff_info.get('metadata', {})
                )
                session.add(staff_member)
                session.flush()
                staff_ids.append(staff_member.id)
            
            # Update the dealership to indicate it has staff info
            dealership = session.query(Dealership).filter(Dealership.id == dealership_id).first()
            if dealership:
                dealership.has_staff_info = True
                dealership.last_updated = datetime.utcnow()
            
        return staff_ids