import logging
import os
import datetime
from logging.handlers import RotatingFileHandler


class LoggingConfig:
    """
    Centralized logging configuration for the dealership scraper
    """
    def __init__(self, log_dir="logs"):
        # Create logs directory if it doesn't exist
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # Create timestamped log filename
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        self.log_filename = os.path.join(log_dir, f"dealership_scraper_{timestamp}.log")
        
        # Set up the root logger
        self.setup_root_logger()
        
        # Store loggers in a dictionary for easy access
        self.loggers = {}
    
    def setup_root_logger(self):
        """Configure the root logger with basic settings"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                RotatingFileHandler(
                    self.log_filename, 
                    maxBytes=10485760,  # 10MB max file size
                    backupCount=5
                ),
                logging.StreamHandler()  # Also log to console
            ]
        )
    
    def get_logger(self, name, level=logging.INFO):
        """
        Get or create a logger with the specified name and level
        
        Args:
            name (str): Logger name
            level (int): Logging level (default: INFO)
        
        Returns:
            Logger: Configured logger instance
        """
        if name in self.loggers:
            return self.loggers[name]
        
        # Create new logger
        logger = logging.getLogger(name)
        logger.setLevel(level)
        
        # Store in dictionary
        self.loggers[name] = logger
        
        return logger
    
    def set_debug_mode(self, enabled=True):
        """
        Enable or disable debug mode for all loggers
        
        Args:
            enabled (bool): Whether to enable debug mode
        """
        level = logging.DEBUG if enabled else logging.INFO
        
        # Update root logger
        logging.getLogger().setLevel(level)
        
        # Update all configured loggers
        for logger in self.loggers.values():
            logger.setLevel(level)
        
        logging.info(f"Debug mode {'enabled' if enabled else 'disabled'}")


def configure_logging():
    """
    Configure and return a LoggingConfig instance
    
    Returns:
        LoggingConfig: Logging configuration instance
    """
    return LoggingConfig() 