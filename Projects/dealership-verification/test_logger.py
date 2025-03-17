#!/usr/bin/env python3

import unittest
import os
import time
import threading
import tempfile
import shutil
import logging
import queue
from concurrent.futures import ThreadPoolExecutor

# Import the modules to test
from log_manager import LogSynchronizer, get_logger, with_logging
from error_handler import (
    retry_with_backoff, 
    ResourceGuard, 
    ProcessSupervisor,
    ErrorTracker,
    CircuitOpenException
)

class TestLoggingAndErrorHandling(unittest.TestCase):
    """Test cases for the log synchronization and error handling modules."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary directory for log files
        self.test_dir = tempfile.mkdtemp()
        self.log_file = os.path.join(self.test_dir, 'test.log')
        self.error_log = os.path.join(self.test_dir, 'error.log')
        
        # Configure logging for tests
        self.log_sync = LogSynchronizer(
            log_file=self.log_file,
            error_log=self.error_log,
            log_level=logging.DEBUG
        )
        self.logger = get_logger('test_logger')
        
    def tearDown(self):
        """Clean up after tests."""
        # Remove temporary directory
        shutil.rmtree(self.test_dir)
        
    def test_log_synchronization(self):
        """Test that logs from multiple threads are properly synchronized."""
        # Define a function to generate logs
        def generate_logs(thread_id):
            correlation_id = f"test_thread_{thread_id}"
            self.log_sync.start_correlation(correlation_id)
            
            logger = get_logger(f"thread_{thread_id}")
            logger.info(f"Info message from thread {thread_id}")
            logger.error(f"Error message from thread {thread_id}")
            
            self.log_sync.end_correlation()
            
        # Run the function in multiple threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=generate_logs, args=(i,))
            threads.append(thread)
            thread.start()
            
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
            
        # Check that log files were created
        self.assertTrue(os.path.exists(self.log_file), "Log file was not created")
        self.assertTrue(os.path.exists(self.error_log), "Error log file was not created")
        
        # Read log file content
        with open(self.log_file, 'r') as f:
            log_content = f.read()
            
        # Check that logs from all threads are present
        for i in range(5):
            self.assertIn(f"Info message from thread {i}", log_content, 
                         f"Log from thread {i} is missing")
                         
        # Read error log content
        with open(self.error_log, 'r') as f:
            error_content = f.read()
            
        # Check that error logs are present
        for i in range(5):
            self.assertIn(f"Error message from thread {i}", error_content, 
                         f"Error log from thread {i} is missing")

    def test_with_logging_decorator(self):
        """Test the with_logging decorator functionality."""
        # Define a function with the decorator
        @with_logging
        def test_function(arg1, arg2=None):
            self.logger.info("Inside test function")
            return arg1 + (arg2 or 0)
            
        # Call the function
        result = test_function(1, arg2=2)
        
        # Check the result
        self.assertEqual(result, 3, "Function return value is incorrect")
        
        # Check log content
        with open(self.log_file, 'r') as f:
            log_content = f.read()
            
        # Verify logging happened
        self.assertIn("Starting test_function", log_content)
        self.assertIn("Inside test function", log_content)
        self.assertIn("Completed test_function", log_content)

    def test_retry_decorator(self):
        """Test the retry_with_backoff decorator."""
        # Counter for number of attempts
        attempts = [0]
        
        # Define a function that fails a few times then succeeds
        @retry_with_backoff(max_retries=3, initial_backoff=0.1)
        def flaky_function(succeed_after=2):
            attempts[0] += 1
            if attempts[0] <= succeed_after:
                raise ValueError("Simulated failure")
            return "Success"
            
        # Call the function
        result = flaky_function(succeed_after=2)
        
        # Check the result
        self.assertEqual(result, "Success", "Function should eventually succeed")
        self.assertEqual(attempts[0], 3, "Function should be called 3 times (2 failures + 1 success)")

    def test_resource_guard(self):
        """Test ResourceGuard for proper resource cleanup."""
        # Mock resource and cleanup function
        cleaned_up = [False]
        resource = {"value": "test"}
        
        def cleanup_func(resources):
            cleaned_up[0] = True
            
        # Use ResourceGuard in with statement
        with ResourceGuard(resources=[resource], cleanup_func=cleanup_func) as guard:
            # Add another resource
            guard.add_resource({"another": "resource"})
            
            # Simulate some work
            time.sleep(0.1)
            
        # Check that cleanup was called
        self.assertTrue(cleaned_up[0], "Cleanup function was not called")

    def test_error_tracker(self):
        """Test ErrorTracker for circuit breaker functionality."""
        # Get singleton instance
        tracker = ErrorTracker()
        
        # Clear any existing state
        tracker.error_counts = {}
        tracker.circuit_open = {}
        
        # Record several errors for a resource
        resource_key = "test_resource"
        for _ in range(tracker.error_threshold):
            tracker.record_error(resource_key, "TestError")
            
        # Check that circuit is open
        self.assertTrue(tracker.check_circuit(resource_key), 
                        "Circuit should be open after threshold errors")
                        
        # Reset the circuit
        tracker.reset_circuit(resource_key)
        
        # Check that circuit is closed
        self.assertFalse(tracker.check_circuit(resource_key), 
                         "Circuit should be closed after reset")

    def test_process_supervisor(self):
        """Test ProcessSupervisor for thread management."""
        # Get singleton instance
        supervisor = ProcessSupervisor()
        
        # Register the current thread
        current_thread = threading.current_thread()
        supervisor.register_thread("test_thread", current_thread)
        
        # Check that thread is registered
        self.assertIn("test_thread", supervisor.active_threads)
        
        # Create and register an executor
        with ThreadPoolExecutor(max_workers=2) as executor:
            supervisor.register_executor(executor)
            
            # Check that executor is registered
            self.assertIn(executor, supervisor.executors)
            
            # Submit a task
            future = executor.submit(lambda: "test")
            result = future.result()
            self.assertEqual(result, "test")
            
        # Unregister thread
        supervisor.unregister_thread("test_thread")
        self.assertNotIn("test_thread", supervisor.active_threads)

if __name__ == '__main__':
    unittest.main()