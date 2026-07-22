"""
Command Responses
================
Standardized response handling for commands.
"""

from typing import Optional, Dict, Any
from datetime import datetime
import time

from .schemas import CommandResponseSchema, CommandStatus


class CommandResponse:
    """
    Command response builder.
    
    Creates standardized responses for all command executions.
    """
    
    @staticmethod
    def success(
        request_id: str,
        command: str,
        execution_time: float,
        message: str,
        payload: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime] = None
    ) -> CommandResponseSchema:
        """Create a success response."""
        return CommandResponseSchema(
            success=True,
            request_id=request_id,
            command=command,
            execution_time=execution_time,
            timestamp=timestamp or datetime.utcnow(),
            message=message,
            payload=payload
        )
        
    @staticmethod
    def error(
        request_id: str,
        command: str,
        execution_time: float,
        error_code: str,
        message: str,
        traceback: Optional[str] = None,
        timestamp: Optional[datetime] = None
    ) -> CommandResponseSchema:
        """Create an error response."""
        return CommandResponseSchema(
            success=False,
            request_id=request_id,
            command=command,
            execution_time=execution_time,
            timestamp=timestamp or datetime.utcnow(),
            message=message,
            error_code=error_code,
            traceback=traceback
        )
        
    @staticmethod
    def validation_error(
        request_id: str,
        command: str,
        errors: list,
        timestamp: Optional[datetime] = None
    ) -> CommandResponseSchema:
        """Create a validation error response."""
        return CommandResponseSchema(
            success=False,
            request_id=request_id,
            command=command,
            execution_time=0.0,
            timestamp=timestamp or datetime.utcnow(),
            message="Validation failed",
            error_code="VALIDATION_ERROR",
            payload={"errors": errors}
        )
        
    @staticmethod
    def permission_denied(
        request_id: str,
        command: str,
        required_level: str,
        timestamp: Optional[datetime] = None
    ) -> CommandResponseSchema:
        """Create a permission denied response."""
        return CommandResponseSchema(
            success=False,
            request_id=request_id,
            command=command,
            execution_time=0.0,
            timestamp=timestamp or datetime.utcnow(),
            message=f"Permission denied. Required level: {required_level}",
            error_code="PERMISSION_DENIED"
        )
        
    @staticmethod
    def framework_unavailable(
        request_id: str,
        command: str,
        timestamp: Optional[datetime] = None
    ) -> CommandResponseSchema:
        """Create a framework unavailable response."""
        return CommandResponseSchema(
            success=False,
            request_id=request_id,
            command=command,
            execution_time=0.0,
            timestamp=timestamp or datetime.utcnow(),
            message="Framework is not available",
            error_code="FRAMEWORK_UNAVAILABLE"
        )
        
    @staticmethod
    def queue_full(
        request_id: str,
        command: str,
        queue_size: int,
        timestamp: Optional[datetime] = None
    ) -> CommandResponseSchema:
        """Create a queue full response."""
        return CommandResponseSchema(
            success=False,
            request_id=request_id,
            command=command,
            execution_time=0.0,
            timestamp=timestamp or datetime.utcnow(),
            message=f"Command queue is full ({queue_size} items)",
            error_code="QUEUE_FULL",
            payload={"queue_size": queue_size}
        )
        
    @staticmethod
    def duplicate_request(
        request_id: str,
        command: str,
        original_request_id: str,
        timestamp: Optional[datetime] = None
    ) -> CommandResponseSchema:
        """Create a duplicate request response."""
        return CommandResponseSchema(
            success=False,
            request_id=request_id,
            command=command,
            execution_time=0.0,
            timestamp=timestamp or datetime.utcnow(),
            message="Duplicate request detected",
            error_code="DUPLICATE_REQUEST",
            payload={"original_request_id": original_request_id}
        )


class ExecutionTimer:
    """Context manager for timing command execution."""
    
    def __init__(self):
        self.start_time: float = 0
        self.end_time: float = 0
        self.execution_time: float = 0
        
    def __enter__(self):
        self.start_time = time.perf_counter()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.perf_counter()
        self.execution_time = self.end_time - self.start_time
        return False
        
    @property
    def elapsed(self) -> float:
        """Get elapsed time in seconds."""
        if self.end_time == 0:
            return time.perf_counter() - self.start_time
        return self.execution_time
