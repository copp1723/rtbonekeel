import sys
import os
import logging

# Configure absolute paths for PythonAnywhere
project_home = '/home/copp1723/dealership-verification'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Configure logging with absolute paths
log_file = os.path.join(project_home, 'logs/app.log')
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
)

try:
    # Import the Flask application
    from app import app as application
    
    # Configure application paths
    application.config['BASE_DIR'] = project_home
    application.template_folder = os.path.join(project_home, 'templates')
    application.static_folder = os.path.join(project_home, 'static')
    
    # Ensure required directories exist
    required_dirs = ['uploads', 'results', 'logs']
    for directory in required_dirs:
        dir_path = os.path.join(project_home, directory)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            os.chmod(dir_path, 0o755)
            logging.info(f'Created directory: {dir_path}')
    
    # Set environment variables if needed
    if 'SECRET_KEY' not in os.environ:
        os.environ['SECRET_KEY'] = os.urandom(24).hex()
    
    logging.info('WSGI application initialized successfully')
    
except Exception as e:
    logging.error(f'Failed to initialize application: {str(e)}')
    raise
