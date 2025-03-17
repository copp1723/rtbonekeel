import time
import functools
import logging
import traceback
import requests
import urllib.error
import socket
import os
import signal
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Callable, Any, Optional, List, Set, Union
from selenium.common.exceptions import WebDriverException, TimeoutException
from log_manager import get_logger, with_logging

# Get a logger
logger = get_logger(__name__)

# Global error tracking
class ErrorTracker:
    """
    Singleton class to track errors across threads and processes.
    Enables circuit breaking and coordinated error handling.
    """
    _instance = None
    _lock = threading.RLock()
    
    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ErrorTracker, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        with self._lock:
            if self._initialized:
                return
                
            # Record of errors by endpoint/resource
            self.error_counts: Dict[str, Dict[str, Any]] = {}
            
            # Circuit breaker state
            self.circuit_open: Dict[str, bool] = {}
            
            # Last error time
            self.last_error_time: Dict[str, float] = {}
            
            # Error thresholds
            self.error_threshold = 5  # Number of errors to trigger circuit breaker
            self.reset_interval = 300  # Time in seconds to reset circuit (5 minutes)
            
            # Resource locks to prevent race conditions
            self.resource_locks: Dict[str, threading.RLock] = {}
            
            self._initialized = True
            
    def record_error(self, resource_key: str, error_type: str, error_details: Dict = None):
        """Record an error for a specific resource."""
        with self._get_resource_lock(resource_key):
            if resource_key not in self.error_counts:
                self.error_counts[resource_key] = {}
                
            if error_type not in self.error_counts[resource_key]:
                self.error_counts[resource_key][error_type] = 0
                
            self.error_counts[resource_key][error_type] += 1
            self.last_error_time[resource_key] = time.time()
            
            # Check if we need to open the circuit
            total_errors = sum(self.error_counts[resource_key].values())
            if total_errors >= self.error_threshold:
                self.circuit_open[resource_key] = True
                logger.warning(f"Circuit breaker opened for {resource_key} after {total_errors} errors")
    
    def check_circuit(self, resource_key: str) -> bool:
        """
        Check if the circuit is open for a resource.
        Returns True if the circuit is open (resource should not be accessed).
        """
        with self._get_resource_lock(resource_key):
            # If no record or circuit not open, resource is available
            if resource_key not in self.circuit_open or not self.circuit_open[resource_key]:
                return False
                
            # Check if enough time has passed to try again
            if resource_key in self.last_error_time:
                elapsed = time.time() - self.last_error_time[resource_key]
                if elapsed > self.reset_interval:
                    # Reset the circuit to try again
                    self.reset_circuit(resource_key)
                    logger.info(f"Circuit breaker reset for {resource_key} after {elapsed:.2f}s")
                    return False
            
            return True  # Circuit still open
    
    def reset_circuit(self, resource_key: str):
        """Reset the circuit breaker for a resource."""
        with self._get_resource_lock(resource_key):
            if resource_key in self.error_counts:
                self.error_counts[resource_key] = {}
            if resource_key in self.circuit_open:
                self.circuit_open[resource_key] = False
    
    def _get_resource_lock(self, resource_key: str) -> threading.RLock:
        """Get or create a lock for a specific resource."""
        if resource_key not in self.resource_locks:
            self.resource_locks[resource_key] = threading.RLock()
        return self.resource_locks[resource_key]


# Retry decorator with exponential backoff
def retry_with_backoff(max_retries=3, 
                       initial_backoff=1,
                       backoff_factor=2, 
                       max_backoff=30,
                       retry_exceptions=(requests.RequestException, TimeoutException, 
                                        WebDriverException, ConnectionError, socket.timeout)):
    """
    Decorator to retry functions with exponential backoff.
    
    Args:
        max_retries: Maximum number of retries
        initial_backoff: Initial backoff time in seconds
        backoff_factor: Multiplier for each retry
        max_backoff: Maximum backoff time in seconds
        retry_exceptions: Tuple of exceptions that should trigger retries
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extract resource key for circuit breaker if provided
            resource_key = kwargs.pop('_resource_key', func.__name__)
            
            # Check if the circuit is open
            error_tracker = ErrorTracker()
            if error_tracker.check_circuit(resource_key):
                logger.warning(f"Circuit open for {resource_key}, skipping call to {func.__name__}")
                raise CircuitOpenException(f"Circuit open for {resource_key}")
            
            # Initialize retry count and backoff time
            retries = 0
            backoff = initial_backoff
            
            while True:
                try:
                    return func(*args, **kwargs)
                except retry_exceptions as e:
                    retries += 1
                    if retries > max_retries:
                        # Record the error when we've exhausted retries
                        error_tracker.record_error(
                            resource_key, 
                            type(e).__name__, 
                            {'args': args, 'kwargs': kwargs, 'error': str(e)}
                        )
                        logger.error(f"Failed after {max_retries} retries: {str(e)}")
                        raise
                    
                    # Calculate backoff time with jitter
                    jitter = (0.5 + (os.urandom(1)[0] / 255) * 0.5)  # Random 0.5-1.0
                    wait_time = min(backoff * jitter, max_backoff)
                    
                    logger.warning(
                        f"Retry {retries}/{max_retries} for {func.__name__} after {wait_time:.2f}s due to {type(e).__name__}: {str(e)}"
                    )
                    
                    # Wait and increase backoff for next retry
                    time.sleep(wait_time)
                    backoff = min(backoff * backoff_factor, max_backoff)
                except Exception as e:
                    # For non-retry exceptions, record and re-raise immediately
                    error_tracker.record_error(
                        resource_key, 
                        type(e).__name__, 
                        {'args': args, 'kwargs': kwargs, 'error': str(e)}
                    )
                    raise
        return wrapper
    return decorator


# Custom exceptions
class CircuitOpenException(Exception):
    """Raised when a circuit breaker is open."""
    pass


class ResourceGuard:
    """
    Guard to ensure proper cleanup of resources even during exceptions.
    """
    def __init__(self, resources=None, cleanup_func=None):
        self.resources = resources or []
        self.cleanup_func = cleanup_func
        self.released = False
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()
        
    def add_resource(self, resource):
        """Add a resource to be cleaned up."""
        self.resources.append(resource)
        
    def release(self):
        """Clean up all resources."""
        if self.released:
            return
            
        if self.cleanup_func:
            try:
                self.cleanup_func(self.resources)
            except Exception as e:
                logger.error(f"Error during resource cleanup: {str(e)}")
        
        self.released = True


# Process supervision and graceful shutdown
class ProcessSupervisor:
    """
    Supervises process and thread execution, handles termination signals,
    and ensures graceful shutdown of all components.
    """
    _instance = None
    _lock = threading.RLock()
    
    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ProcessSupervisor, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance
            
    def __init__(self):
        with self._lock:
            if self._initialized:
                return
                
            self.is_shutting_down = threading.Event()
            self.active_threads: Dict[str, threading.Thread] = {}
            self.executors: List[ThreadPoolExecutor] = []
            self.cleanup_handlers: List[Callable] = []
            
            # Set up signal handlers for graceful shutdown
            signal.signal(signal.SIGINT, self._handle_signal)
            signal.signal(signal.SIGTERM, self._handle_signal)
            
            self._initialized = True
            
    def register_thread(self, name: str, thread: threading.Thread):
        """Register a thread for supervision."""
        with self._lock:
            self.active_threads[name] = thread
            
    def unregister_thread(self, name: str):
        """Unregister a thread."""
        with self._lock:
            if name in self.active_threads:
                del self.active_threads[name]
                
    def register_executor(self, executor: ThreadPoolExecutor):
        """Register a thread executor for supervision."""
        with self._lock:
            self.executors.append(executor)
            
    def register_cleanup_handler(self, handler: Callable):
        """Register a cleanup function to call during shutdown."""
        with self._lock:
            self.cleanup_handlers.append(handler)
            
    def _handle_signal(self, signum, frame):
        """Handle termination signals."""
        logger.info(f"Received signal {signum}, initiating graceful shutdown")
        self.initiate_shutdown()
        
    def initiate_shutdown(self):
        """Initiate graceful shutdown of all components."""
        if self.is_shutting_down.is_set():
            return  # Already shutting down
            
        self.is_shutting_down.set()
        
        # Run cleanup handlers
        for handler in self.cleanup_handlers:
            try:
                handler()
            except Exception as e:
                logger.error(f"Error in cleanup handler: {str(e)}")
        
        # Shutdown executors
        for executor in self.executors:
            try:
                executor.shutdown(wait=False)
            except Exception as e:
                logger.error(f"Error shutting down executor: {str(e)}")
        
        # Wait for threads to finish
        for name, thread in list(self.active_threads.items()):
            if thread.is_alive():
                logger.info(f"Waiting for thread {name} to complete")
                thread.join(timeout=5.0)
                if thread.is_alive():
                    logger.warning(f"Thread {name} did not complete in time")
                    
        logger.info("Graceful shutdown completed")
        
    def is_shutdown_requested(self) -> bool:
        """Check if shutdown has been requested."""
        return self.is_shutting_down.is_set()
        
    def create_supervised_executor(self, max_workers=None, name="default"):
        """Create a thread pool executor that is supervised."""
        executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix=name)
        self.register_executor(executor)
        return executor


# Utility functions for dealership verification
def safe_cleanup_webdriver(driver):
    """Safely clean up a WebDriver instance."""
    if driver:
        try:
            driver.quit()
        except Exception as e:
            logger.error(f"Error cleaning up WebDriver: {str(e)}")


def handle_network_error(url, error, max_retries=3):
    """
    Handle network-related errors for URL requests.
    Returns True if the error is recoverable, False otherwise.
    """
    if isinstance(error, (requests.ConnectTimeout, requests.ReadTimeout, socket.timeout)):
        logger.warning(f"Timeout accessing {url}: {str(error)}")
        return True  # Recoverable with retry
    elif isinstance(error, requests.ConnectionError):
        logger.warning(f"Connection error for {url}: {str(error)}")
        return True  # Likely recoverable with retry
    elif isinstance(error, requests.HTTPError):
        status_code = error.response.status_code if hasattr(error, 'response') else 0
        if 500 <= status_code < 600:
            logger.warning(f"Server error ({status_code}) for {url}: {str(error)}")
            return True  # Server error, might be recoverable
        elif status_code == 429:
            logger.warning(f"Rate limited ({status_code}) for {url}: {str(error)}")
            # Rate-limited, need longer backoff
            time.sleep(10)  
            return True
        else:
            logger.error(f"HTTP error ({status_code}) for {url}: {str(error)}")
            return False  # Other HTTP errors are generally not recoverable
    else:
        logger.error(f"Unhandled error type {type(error).__name__} for {url}: {str(error)}")
        return False  # Unknown errors are not recoverable


# Testing for error handling module
if __name__ == "__main__":
    # Test the error handler
    @retry_with_backoff(max_retries=3)
    @with_logging
    def test_function(succeed_after=None):
        """Test function that fails until it's called a certain number of times."""
        test_function.calls = getattr(test_function, 'calls', 0) + 1
        
        if succeed_after is None or test_function.calls <= succeed_after:
            # Simulate a network error
            raise requests.ConnectionError("Simulated connection error")
        
        return "Success!"
    
    # Test circuit breaker
    try:
        # Should retry 3 times then fail
        test_function(succeed_after=5)
    except Exception as e:
        print(f"Expected error: {str(e)}")
    
    # Test successful retry
    test_function.calls = 0
    result = test_function(succeed_after=2)
    print(f"Result after retries: {result}")
    
    print("Error handler testing complete. Check the logs for details.")