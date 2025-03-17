import os

# Base configuration
class Config:
    # Use current directory as base dir
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    RESULTS_FOLDER = os.path.join(BASE_DIR, 'results')
    LOG_FOLDER = os.path.join(BASE_DIR, 'logs')
    
    # File handling
    ALLOWED_EXTENSIONS = {'csv'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Resource limits for PythonAnywhere
    MAX_WORKERS = 3  # Limited workers for shared hosting
    BATCH_SIZE = 20  # Smaller batches for stability
    SAVE_INTERVAL = 25  # More frequent saves
    REQUEST_TIMEOUT = 30  # Timeout for external requests
    
    # Job persistence
    JOBS_FILE = os.path.join(BASE_DIR, 'jobs.json')
    
    # Selenium configuration for PythonAnywhere
    SELENIUM_OPTIONS = [
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--window-size=1920,1080'
    ]
    
    # Extractor configuration
    EXTRACTOR_TYPE = os.environ.get('EXTRACTOR_TYPE', 'hybrid')  # Options: selenium, undetected, firecrawl, hybrid
    FIRECRAWL_API_KEY = os.environ.get('FIRECRAWL_API_KEY', 'fc-73aeb0d1ae814693ba39bdbafbbd505d')
    HYBRID_MODE = os.environ.get('HYBRID_MODE', 'auto')  # Options: auto, fallback, combine
    
    # Error logging
    LOG_FILE = os.path.join(LOG_FOLDER, 'app.log')
    ERROR_LOG = os.path.join(LOG_FOLDER, 'error.log')
    LOG_FORMAT = '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    LOG_LEVEL = 'INFO'
    
    @classmethod
    def init_app(cls):
        # Create required directories
        required_dirs = [cls.UPLOAD_FOLDER, cls.RESULTS_FOLDER, cls.LOG_FOLDER]
        for directory in required_dirs:
            if not os.path.exists(directory):
                os.makedirs(directory)
                os.chmod(directory, 0o755)
        
        # Initialize log files
        for log_file in [cls.LOG_FILE, cls.ERROR_LOG]:
            if not os.path.exists(log_file):
                open(log_file, 'a').close()
                os.chmod(log_file, 0o644)

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    LOG_LEVEL = 'INFO'
    
    # Additional security for production
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False
    LOG_LEVEL = 'DEBUG'
    MAX_WORKERS = 5  # More workers in development
    
class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    LOG_LEVEL = 'DEBUG'
    
# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': ProductionConfig
}
