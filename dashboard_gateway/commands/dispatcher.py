"""
Command Dispatcher
==================
Central command dispatcher for executing framework commands.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass, field
from collections import deque
import uuid
import traceback

from .schemas import (
    CommandSchema,
    CommandResponseSchema,
    CommandQueueItem,
    CommandStatus,
    PermissionLevel,
    ValidationResult
)
from .registry import get_registry, CommandRegistry
from .validator import CommandValidator
from .history import get_history, CommandHistory, HistoryEntry
from .permissions import get_permissions, Permissions
from .responses import CommandResponse, ExecutionTimer


@dataclass
class QueueItem:
    """Internal queue item."""
    request_id: str
    command: str
    arguments: Dict[str, Any]
    sender: str
    permission_level: PermissionLevel
    status: CommandStatus = CommandStatus.QUEUED
    queued_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    def to_queue_item(self) -> CommandQueueItem:
        """Convert to CommandQueueItem."""
        return CommandQueueItem(
            request_id=self.request_id,
            command=self.command,
            arguments=self.arguments,
            status=self.status,
            queued_at=self.queued_at,
            started_at=self.started_at,
            completed_at=self.completed_at,
            sender=self.sender
        )


class CommandDispatcher:
    """
    Central command dispatcher.
    
    Responsibilities:
    - Receive commands
    - Validate commands
    - Queue commands
    - Execute commands
    - Return responses
    - Log executions
    - Prevent duplicates
    """
    
    def __init__(
        self,
        registry: Optional[CommandRegistry] = None,
        validator: Optional[CommandValidator] = None,
        history: Optional[CommandHistory] = None,
        permissions: Optional[Permissions] = None,
        max_queue_size: int = 100
    ):
        self._registry = registry or get_registry()
        self._validator = validator or CommandValidator()
        self._history = history or get_history()
        self._permissions = permissions or get_permissions()
        
        self._queue: deque = deque(maxlen=max_queue_size)
        self._executing: Dict[str, QueueItem] = {}
        self._max_queue_size = max_queue_size
        self._executed_ids: set = set()  # For duplicate prevention
        
    async def dispatch(
        self,
        command: CommandSchema,
        sender: str = "dashboard",
        framework_available: bool = False,
        kernel_running: bool = False,
        dev_mode: bool = False
    ) -> CommandResponseSchema:
        """
        Dispatch a command for execution.
        
        Args:
            command: Command to execute
            sender: Sender identifier
            framework_available: Whether framework is connected
            kernel_running: Whether kernel is running
            dev_mode: Whether to include traceback in errors
            
        Returns:
            CommandResponseSchema with execution result
        """
        # Generate request ID if not provided
        if not command.request_id:
            command.request_id = str(uuid.uuid4())
            
        request_id = command.request_id
        
        # Check for duplicate
        if request_id in self._executed_ids:
            original = self._history.get(request_id)
            return CommandResponse.duplicate_request(
                request_id,
                command.command,
                original.request_id if original else request_id
            )
            
        # Get sender permission level
        sender_permission = self._permissions.get_user_permission(sender)
        
        # Validate command
        validation = self._validator.validate(
            command,
            sender_permission,
            framework_available,
            kernel_running
        )
        
        if not validation.valid:
            # Log failed validation
            self._history.add(
                request_id,
                command.command,
                command.arguments,
                sender,
                sender_permission
            )
            self._history.complete(
                request_id,
                CommandStatus.DENIED,
                0.0,
                "; ".join(validation.errors),
                error_code="VALIDATION_ERROR"
            )
            
            return CommandResponse.validation_error(
                request_id,
                command.command,
                validation.errors
            )
            
        # Check permission
        if validation.command_info:
            try:
                self._permissions.check_permission(sender, validation.command_info)
            except PermissionDeniedError as e:
                self._history.add(
                    request_id,
                    command.command,
                    command.arguments,
                    sender,
                    sender_permission
                )
                self._history.complete(
                    request_id,
                    CommandStatus.DENIED,
                    0.0,
                    str(e),
                    error_code="PERMISSION_DENIED"
                )
                
                return CommandResponse.permission_denied(
                    request_id,
                    command.command,
                    validation.command_info.permission_level.value
                )
                
        # Check framework availability
        if validation.command_info and validation.command_info.requires_framework:
            if not framework_available:
                self._history.add(
                    request_id,
                    command.command,
                    command.arguments,
                    sender,
                    sender_permission
                )
                self._history.complete(
                    request_id,
                    CommandStatus.FAILED,
                    0.0,
                    "Framework is not available",
                    error_code="FRAMEWORK_UNAVAILABLE"
                )
                
                return CommandResponse.framework_unavailable(
                    request_id,
                    command.command
                )
                
        # Add to queue
        queue_item = QueueItem(
            request_id=request_id,
            command=command.command,
            arguments=command.arguments,
            sender=sender,
            permission_level=sender_permission
        )
        
        # Check queue capacity
        if len(self._queue) >= self._max_queue_size:
            return CommandResponse.queue_full(
                request_id,
                command.command,
                len(self._queue)
            )
            
        self._queue.append(queue_item)
        
        # Add to history
        self._history.add(
            request_id,
            command.command,
            command.arguments,
            sender,
            sender_permission
        )
        
        # Execute command
        return await self._execute(
            queue_item,
            dev_mode
        )
        
    async def _execute(
        self,
        queue_item: QueueItem,
        dev_mode: bool = False
    ) -> CommandResponseSchema:
        """Execute a queued command."""
        request_id = queue_item.request_id
        
        # Mark as executing
        queue_item.status = CommandStatus.EXECUTING
        queue_item.started_at = datetime.utcnow()
        self._executing[request_id] = queue_item
        self._history.start_execution(request_id)
        
        # Get command handler
        cmd = self._registry.get(queue_item.command)
        if not cmd:
            return await self._fail(
                queue_item,
                "COMMAND_NOT_FOUND",
                f"Command handler not found: {queue_item.command}",
                dev_mode
            )
            
        # Execute with timing
        timer = ExecutionTimer()
        with timer:
            try:
                # Call the handler
                handler = cmd.handler
                result = handler(**queue_item.arguments)
                
                # Mark as completed
                return await self._complete(
                    queue_item,
                    timer.execution_time,
                    "Command executed successfully",
                    result
                )
                
            except TypeError as e:
                # Invalid arguments
                return await self._fail(
                    queue_item,
                    "INVALID_ARGUMENTS",
                    f"Invalid arguments: {str(e)}",
                    dev_mode
                )
                
            except Exception as e:
                # General error
                return await self._fail(
                    queue_item,
                    "EXECUTION_ERROR",
                    str(e),
                    dev_mode
                )
                
    async def _complete(
        self,
        queue_item: QueueItem,
        execution_time: float,
        message: str,
        payload: Any = None
    ) -> CommandResponseSchema:
        """Mark command as completed."""
        request_id = queue_item.request_id
        
        queue_item.status = CommandStatus.COMPLETED
        queue_item.completed_at = datetime.utcnow()
        
        # Remove from executing
        self._executing.pop(request_id, None)
        
        # Add to executed set for duplicate prevention
        self._executed_ids.add(request_id)
        
        # Update history
        self._history.complete(
            request_id,
            CommandStatus.COMPLETED,
            execution_time,
            message,
            payload if isinstance(payload, dict) else {"result": payload}
        )
        
        return CommandResponse.success(
            request_id,
            queue_item.command,
            execution_time,
            message,
            payload if isinstance(payload, dict) else {"result": payload}
        )
        
    async def _fail(
        self,
        queue_item: QueueItem,
        error_code: str,
        message: str,
        dev_mode: bool = False
    ) -> CommandResponseSchema:
        """Mark command as failed."""
        request_id = queue_item.request_id
        
        queue_item.status = CommandStatus.FAILED
        queue_item.completed_at = datetime.utcnow()
        
        # Remove from executing
        self._executing.pop(request_id, None)
        
        # Add to executed set for duplicate prevention
        self._executed_ids.add(request_id)
        
        # Get execution time
        execution_time = 0.0
        if queue_item.started_at:
            execution_time = (
                queue_item.completed_at - queue_item.started_at
            ).total_seconds()
            
        # Update history
        tb = traceback.format_exc() if dev_mode else None
        self._history.complete(
            request_id,
            CommandStatus.FAILED,
            execution_time,
            message,
            error_code=error_code
        )
        
        return CommandResponse.error(
            request_id,
            queue_item.command,
            execution_time,
            error_code,
            message,
            tb
        )
        
    def get_queue(self) -> List[CommandQueueItem]:
        """Get current queue state."""
        return [item.to_queue_item() for item in self._queue]
        
    def get_executing(self) -> List[CommandQueueItem]:
        """Get currently executing commands."""
        return [item.to_queue_item() for item in self._executing.values()]
        
    def get_status(self, request_id: str) -> Optional[CommandStatus]:
        """Get status of a command."""
        # Check history first
        entry = self._history.get(request_id)
        if entry:
            return entry.status
            
        # Check queue
        for item in self._queue:
            if item.request_id == request_id:
                return item.status
                
        # Check executing
        if request_id in self._executing:
            return CommandStatus.EXECUTING
            
        return None
        
    def cancel(self, request_id: str) -> bool:
        """Cancel a queued command."""
        for i, item in enumerate(self._queue):
            if item.request_id == request_id:
                item.status = CommandStatus.CANCELLED
                item.completed_at = datetime.utcnow()
                
                self._history.complete(
                    request_id,
                    CommandStatus.CANCELLED,
                    0.0,
                    "Command cancelled"
                )
                
                return True
                
        return False
        
    def get_stats(self) -> Dict[str, Any]:
        """Get dispatcher statistics."""
        return {
            "queue_size": len(self._queue),
            "max_queue_size": self._max_queue_size,
            "executing": len(self._executing),
            "total_commands": self._registry.get_count(),
            "history_stats": self._history.get_stats()
        }


# Global dispatcher instance
_dispatcher: Optional[CommandDispatcher] = None


def get_dispatcher() -> CommandDispatcher:
    """Get the global command dispatcher."""
    global _dispatcher
    if _dispatcher is None:
        _dispatcher = CommandDispatcher()
    return _dispatcher
