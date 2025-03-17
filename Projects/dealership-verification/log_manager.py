import logging
import logging.handlers
import os
import threading
import time
import queue
import atexit
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Optional, List
from functools import wraps
import traceback
import json
from datetime import datetime
import socket
import uuid
import sys
from config import config

# Get config based on environment
env = os.environ.get('FLASK_ENV', 'default')
current_config = config[env]

class LogSynchronizer:
    """
    Centralizes and synchronizes logging across multiple processes and threads.
    Provides robust error handling, log rotation, and correlation tracking.
    """
    _instance = None
    _lock = threading.RLock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(LogSynchronizer, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self, 
                log_file=current_config.LOG_FILE,
                error_log=current_config.ERROR_LOG, 
                max_bytes=10485760,  # 10MB
                backup_count=10,
                log_level=getattr(logging, current_config.LOG_LEVEL)):
        
        with self._lock:
            if self._initialized:
                return
                
            self.log_file = log_file
            self.error_log = error_log
            self.max_bytes = max_bytes
            self.backup_count = backup_count
            self.log_level = log_level
            
            # Create required directories
            log_dir = os.path.dirname(log_file)
            if not os.path.exists(log_dir):
                os.makedirs(log_dir, exist_ok=True)
                
            # Set up queue for asynchronous logging
            self.log_queue = queue.Queue()
            self.stop_event = threading.Event()
            
            # Dictionary to track correlation IDs
            self.correlation_map = {}
            
            # Set up root logger
            self.setup_root_logger()
            
            # Create and start log handler thread
            self.log_thread = threading.Thread(target=self._process_log_queue, daemon=True)
            self.log_thread.start()
            
            # Register cleanup on exit
            atexit.register(self.shutdown)
            
            # Process identifier for logs
            self.hostname = socket.gethostname()
            self.process_id = os.getpid()
            
            self._initialized = True
            
            logging.info(f"Log synchronization initialized: PID={self.process_id}, Host={self.hostname}")

    def setup_root_logger(self):
        """Configure the root logger with file and console handlers."""
        root_logger = logging.getLogger()
        root_logger.setLevel(self.log_level)
        
        # Clear existing handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Create formatters
        standard_formatter = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(process)d | %(thread)d | %(name)s | %(message)s'
        )
        
        # File handlers with rotation
        file_handler = logging.handlers.RotatingFileHandler(
            self.log_file, maxBytes=self.max_bytes, backupCount=self.backup_count
        )
        file_handler.setFormatter(standard_formatter)
        file_handler.setLevel(self.log_level)
        
        error_handler = logging.handlers.RotatingFileHandler(
            self.error_log, maxBytes=self.max_bytes, backupCount=self.backup_count
        )
        error_handler.setFormatter(standard_formatter)
        error_handler.setLevel(logging.ERROR)
        
        # Add a console handler for development
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(standard_formatter)
        console_handler.setLevel(self.log_level)
        
        # Add filter to add correlation_id to log records
        root_logger.addFilter(self.correlation_id_filter)
        
        # Add handlers to root logger through queue handler
        queue_handler = logging.handlers.QueueHandler(self.log_queue)
        root_logger.addHandler(queue_handler)
        
        # Store actual handlers to be used by the queue listener
        self.handlers = [file_handler, error_handler, console_handler]

    def correlation_id_filter(self, record):
        """Add correlation_id to log records."""
        if not hasattr(record, 'correlation_id'):
            if hasattr(threading.current_thread(), 'correlation_id'):
                record.correlation_id = threading.current_thread().correlation_id
            else:
                record.correlation_id = 'NONE'
        return True

    def get_logger(self, name):
        """Get a logger that uses the synchronized logging infrastructure."""
        logger = logging.getLogger(name)
        return logger

    def _process_log_queue(self):
        """Background thread to process log records from the queue."""
        while not self.stop_event.is_set() or not self.log_queue.empty():
            try:
                record = self.log_queue.get(block=True, timeout=0.2)
                for handler in self.handlers:
                    if record.levelno >= handler.level:
                        handler.handle(record)
                self.log_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                # Last resort error handling for the logging thread
                sys.stderr.write(f"Error in log processing thread: {str(e)}\n")
                if not self.log_queue.empty():
                    try:
                        self.log_queue.task_done()
                    except Exception:
                        pass

    def start_correlation(self, correlation_id=None):
        """
        Start a new correlation context for tracking related log messages.
        Returns the correlation ID that was set.
        """
        if correlation_id is None:
            correlation_id = str(uuid.uuid4())
        
        thread = threading.current_thread()
        thread.correlation_id = correlation_id
        return correlation_id

    def end_correlation(self):
        """End the current correlation context."""
        thread = threading.current_thread()
        if hasattr(thread, 'correlation_id'):
            delattr(thread, 'correlation_id')

    def shutdown(self):
        """
        Properly shut down logging, ensuring all queued logs are processed.
        """
        logging.info("Log synchronizer shutting down, processing remaining logs...")
        self.stop_event.set()
        if hasattr(self, 'log_thread') and self.log_thread.is_alive():
            self.log_thread.join(timeout=5.0)
        logging.info("Log synchronizer shutdown complete")


def with_logging(func):
    """
    Decorator to add correlation IDs and error handling to functions.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        log_sync = LogSynchronizer()
        correlation_id = log_sync.start_correlation()
        logger = log_sync.get_logger(func.__module__)
        
        try:
            logger.info(f"Starting {func.__name__} with args: {args}, kwargs: {kwargs}")
            start_time = time.time()
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            logger.info(f"Completed {func.__name__} in {duration:.2f}s")
            return result
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {str(e)}", exc_info=True)
            raise
        finally:
            log_sync.end_correlation()
            
    return wrapper


# Global function to get a logger with proper synchronization
def get_logger(name):
    """Get a properly configured logger with synchronization support."""
    return LogSynchronizer().get_logger(name)


# Testing function
if __name__ == "__main__":
    # Test the log synchronization
    logger = get_logger("test_logger")
    
    def test_logging():
        logger.info("This is a test log message")
        logger.error("This is a test error message")
        try:
            1/0
        except Exception as e:
            logger.exception("Caught an exception")
    
    # Test with multiple threads
    with ThreadPoolExecutor(max_workers=5) as executor:
        for i in range(10):
            executor.submit(test_logging)
    
    # Allow time for logs to be processed
    time.sleep(1)
    
    print("Log testing complete, check the log files")