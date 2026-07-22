"""
Gateway Logger
==============
Logging setup for the Dashboard Gateway.
"""

import logging
import sys
from typing import Optional
from datetime import datetime


class GatewayLogger:
    """Centralized logging for the gateway."""
    
    _instances: dict = {}
    
    def __init__(self, name: str, level: str = "INFO", log_file: Optional[str] = None):
        self.name = name
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.upper()))
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter(
            '%(asctime)s | %(name)s | %(levelname)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # File handler if specified
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setLevel(logging.DEBUG)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    @classmethod
    def get(cls, name: str = "gateway", level: str = "INFO", log_file: Optional[str] = None) -> "GatewayLogger":
        """Get or create a logger instance."""
        if name not in cls._instances:
            cls._instances[name] = cls(name, level, log_file)
        return cls._instances[name]
    
    def debug(self, message: str, **kwargs):
        """Log debug message."""
        self.logger.debug(message, extra=kwargs)
    
    def info(self, message: str, **kwargs):
        """Log info message."""
        self.logger.info(message, extra=kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message."""
        self.logger.warning(message, extra=kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message."""
        self.logger.error(message, extra=kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log critical message."""
        self.logger.critical(message, extra=kwargs)


# Convenience function
def get_logger(name: str = "gateway", level: str = "INFO", log_file: Optional[str] = None) -> GatewayLogger:
    """Get a logger instance."""
    return GatewayLogger.get(name, level, log_file)
