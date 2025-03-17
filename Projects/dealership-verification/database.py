import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import QueuePool
from models import Base
from contextlib import contextmanager
from log_manager import get_logger

logger = get_logger(__name__)

class DatabaseManager:
    """
    Manages database connections and sessions.
    """
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self, db_url=None):
        if self._initialized:
            return
            
        # Get database URL from environment or use default SQLite
        self.db_url = db_url or os.environ.get(
            'DATABASE_URL', 
            'sqlite:///dealership_verification.db'
        )
        
        logger.info(f"Initializing database connection to {self.db_url.split('://')[0]}")
        
        # Create engine with connection pooling
        self.engine = create_engine(
            self.db_url,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_timeout=30,
            pool_recycle=1800,  # Recycle connections after 30 minutes
            echo=False  # Set to True for SQL logging
        )
        
        # Create session factory
        self.session_factory = sessionmaker(bind=self.engine)
        
        # Create scoped session for thread-local sessions
        self.Session = scoped_session(self.session_factory)
        
        self._initialized = True
        logger.info("Database manager initialized")
    
    def create_tables(self):
        """Create all tables defined in models."""
        logger.info("Creating database tables if they don't exist")
        Base.metadata.create_all(self.engine)
    
    def drop_tables(self):
        """Drop all tables. Use with caution!"""
        logger.warning("Dropping all database tables")
        Base.metadata.drop_all(self.engine)
    
    @contextmanager
    def session_scope(self):
        """
        Provide a transactional scope around a series of operations.
        
        Usage:
            with db_manager.session_scope() as session:
                session.add(some_object)
        """
        session = self.Session()
        try:
            yield session
            session.commit()
        except Exception as e:
            logger.error(f"Error in database session: {str(e)}")
            session.rollback()
            raise
        finally:
            session.close()
    
    def get_session(self):
        """Get a new session."""
        return self.Session()
    
    def dispose(self):
        """Dispose of the connection pool."""
        if hasattr(self, 'engine'):
            self.engine.dispose()
            logger.info("Database connection pool disposed")


# Create a global instance
db_manager = DatabaseManager()


# Module-level functions for easy access
def create_tables():
    """Create all tables."""
    db_manager.create_tables()

def get_session():
    """Get a new session."""
    return db_manager.get_session()

@contextmanager
def session_scope():
    """Context manager for database sessions."""
    with db_manager.session_scope() as session:
        yield session

def init_db(db_url=None):
    """Initialize the database with a specific URL."""
    global db_manager
    db_manager = DatabaseManager(db_url)
    create_tables()
    return db_manager