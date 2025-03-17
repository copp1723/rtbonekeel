from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON, Table, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import json

Base = declarative_base()

class Dealership(Base):
    """
    Represents a car dealership.
    """
    __tablename__ = 'dealerships'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    website = Column(String(255), nullable=False)
    manufacturer = Column(String(100), index=True)
    is_active = Column(Boolean, default=False)
    final_url = Column(String(255))
    date_added = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_checked = Column(DateTime)
    status = Column(String(50), default='pending')
    processing_time = Column(Float)
    correlation_id = Column(String(50))
    attempts = Column(Integer, default=0)
    has_staff_info = Column(Boolean, default=False)  # Flag to indicate if staff info was extracted
    extraction_method = Column(String(50))  # Method used for extraction: selenium, firecrawl, hybrid
    
    # Relationships
    contacts = relationship("Contact", back_populates="dealership", cascade="all, delete-orphan")
    staff = relationship("StaffMember", back_populates="dealership", cascade="all, delete-orphan")
    verification_jobs = relationship("VerificationJob", secondary="dealership_jobs")
    
    __table_args__ = (
        UniqueConstraint('website', name='unique_website'),
    )
    
    def __repr__(self):
        return f"<Dealership(id={self.id}, name='{self.name}', manufacturer='{self.manufacturer}')>"


class Contact(Base):
    """
    Represents a contact extracted from a dealership.
    """
    __tablename__ = 'contacts'
    
    id = Column(Integer, primary_key=True)
    dealership_id = Column(Integer, ForeignKey('dealerships.id'), nullable=False)
    type = Column(String(50), nullable=False)  # email, phone, address
    value = Column(String(255), nullable=False)
    date_extracted = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    dealership = relationship("Dealership", back_populates="contacts")
    
    def __repr__(self):
        return f"<Contact(id={self.id}, type='{self.type}', value='{self.value}')>"
        
        
class StaffMember(Base):
    """
    Represents a staff member at a dealership.
    """
    __tablename__ = 'staff_members'
    
    id = Column(Integer, primary_key=True)
    dealership_id = Column(Integer, ForeignKey('dealerships.id'), nullable=False)
    name = Column(String(255), nullable=False)
    title = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    photo_url = Column(String(512))
    role_category = Column(String(50))  # management, sales, service, general
    priority = Column(Integer, default=0)
    confidence = Column(Float)
    date_extracted = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)
    
    # Relationships
    dealership = relationship("Dealership", back_populates="staff")
    
    def __repr__(self):
        return f"<StaffMember(id={self.id}, name='{self.name}', title='{self.title}')>"


class VerificationJob(Base):
    """
    Represents a job for verifying multiple dealerships.
    """
    __tablename__ = 'verification_jobs'
    
    id = Column(Integer, primary_key=True)
    job_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(255))
    status = Column(String(50), default='pending')  # pending, processing, completed, failed
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    total_dealerships = Column(Integer, default=0)
    processed_dealerships = Column(Integer, default=0)
    active_websites = Column(Integer, default=0)
    batch_size = Column(Integer)
    max_workers = Column(Integer)
    stats = Column(JSON)
    
    # Relationships
    dealerships = relationship("Dealership", secondary="dealership_jobs")
    
    def __repr__(self):
        return f"<VerificationJob(job_id='{self.job_id}', status='{self.status}')>"
    
    def update_stats(self):
        """Update job statistics."""
        self.processed_dealerships = len(self.dealerships)
        self.active_websites = sum(1 for d in self.dealerships if d.is_active)
        
        # Calculate manufacturer distribution
        manufacturers = {}
        for dealership in self.dealerships:
            if dealership.manufacturer:
                manufacturers[dealership.manufacturer] = manufacturers.get(dealership.manufacturer, 0) + 1
        
        # Create stats dictionary
        stats = {
            'total_processed': self.processed_dealerships,
            'active_websites': self.active_websites,
            'manufacturer_distribution': manufacturers,
            'success_rate': round((self.active_websites / self.processed_dealerships) * 100, 2) if self.processed_dealerships > 0 else 0,
            'processing_duration_seconds': (self.end_time - self.start_time).total_seconds() if self.end_time else None
        }
        
        self.stats = stats
        return stats


# Association table for many-to-many relationship between dealerships and jobs
dealership_jobs = Table(
    'dealership_jobs',
    Base.metadata,
    Column('dealership_id', Integer, ForeignKey('dealerships.id'), primary_key=True),
    Column('job_id', Integer, ForeignKey('verification_jobs.id'), primary_key=True)
)


class ErrorLog(Base):
    """
    Represents an error that occurred during verification.
    """
    __tablename__ = 'error_logs'
    
    id = Column(Integer, primary_key=True)
    dealership_id = Column(Integer, ForeignKey('dealerships.id'))
    job_id = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)
    error_type = Column(String(100))
    error_message = Column(Text)
    resource_key = Column(String(255))
    correlation_id = Column(String(50))
    context = Column(JSON)
    
    # Relationships
    dealership = relationship("Dealership")
    
    def __repr__(self):
        return f"<ErrorLog(id={self.id}, error_type='{self.error_type}')>"