"""
Command Router
==============
REST API endpoints for command operations.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime

from .schemas import CommandSchema, CommandResponseSchema, CommandStatus, PermissionLevel
from .dispatcher import get_dispatcher
from .registry import get_registry
from .history import get_history
from .permissions import get_permissions
from .validator import CommandValidator


class CommandRouter:
    """
    Command router for REST API.
    
    Provides endpoints for:
    - Execute command
    - Get queue status
    - Get command status
    - Cancel command
    - Get command history
    - Get available commands
    - Get command info
    """
    
    def __init__(self, gateway=None):
        self.gateway = gateway
        self._dispatcher = get_dispatcher()
        self._registry = get_registry()
        self._history = get_history()
        self._permissions = get_permissions()
        self._validator = CommandValidator()
        
    async def post_command(
        self,
        command: CommandSchema,
        sender: str = "dashboard",
        dev_mode: bool = False
    ) -> CommandResponseSchema:
        """
        Execute a command.
        
        POST /commands/execute
        """
        # Get framework availability
        framework_available = False
        kernel_running = False
        
        if self.gateway:
            framework_available = self.gateway.runtime.is_connected()
            kernel_status = self.gateway.kernel.get_kernel_status()
            kernel_running = kernel_status.running
            
        return await self._dispatcher.dispatch(
            command=command,
            sender=sender,
            framework_available=framework_available,
            kernel_running=kernel_running,
            dev_mode=dev_mode
        )
        
    async def get_commands(
        self,
        category: Optional[str] = None,
        permission: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get available commands.
        
        GET /commands
        """
        all_commands = self._registry.get_all()
        
        # Filter by category
        if category:
            from .schemas import CommandCategory
            try:
                cat = CommandCategory(category)
                all_commands = [
                    cmd for cmd in all_commands
                    if cmd.category == cat
                ]
            except ValueError:
                pass
                
        # Filter by permission
        if permission:
            from .schemas import PermissionLevel
            try:
                level = PermissionLevel(permission)
                all_commands = [
                    cmd for cmd in all_commands
                    if self._permissions.has_permission(level, cmd.permission_level)
                ]
            except ValueError:
                pass
                
        # Group by category
        categories: Dict[str, List[Dict]] = {}
        for cmd in all_commands:
            cat = cmd.category.value
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(cmd.model_dump())
            
        return {
            "commands": [cmd.model_dump() for cmd in all_commands],
            "categories": categories,
            "total": len(all_commands)
        }
        
    async def get_command_info(self, command_name: str) -> Dict[str, Any]:
        """
        Get command information.
        
        GET /commands/{name}
        """
        info = self._registry.get_info(command_name)
        if not info:
            return {
                "error": f"Command not found: {command_name}"
            }
            
        return info.model_dump()
        
    async def get_queue(self) -> Dict[str, Any]:
        """
        Get command queue status.
        
        GET /commands/queue
        """
        return {
            "queue": [item.model_dump() for item in self._dispatcher.get_queue()],
            "executing": [item.model_dump() for item in self._dispatcher.get_executing()],
            "stats": self._dispatcher.get_stats()
        }
        
    async def get_status(self, request_id: str) -> Dict[str, Any]:
        """
        Get command status.
        
        GET /commands/status/{request_id}
        """
        status = self._dispatcher.get_status(request_id)
        if not status:
            # Check history
            entry = self._history.get(request_id)
            if entry:
                return {
                    "request_id": request_id,
                    "status": entry.status.value,
                    "command": entry.command,
                    "execution_time": entry.execution_time,
                    "message": entry.message,
                    "error_code": entry.error_code,
                    "queued_at": entry.queued_at.isoformat(),
                    "completed_at": entry.completed_at.isoformat() if entry.completed_at else None
                }
            return {
                "error": f"Request not found: {request_id}"
            }
            
        return {
            "request_id": request_id,
            "status": status.value
        }
        
    async def cancel_command(self, request_id: str) -> Dict[str, Any]:
        """
        Cancel a queued command.
        
        DELETE /commands/queue/{request_id}
        """
        success = self._dispatcher.cancel(request_id)
        
        if success:
            return {
                "success": True,
                "request_id": request_id,
                "message": "Command cancelled"
            }
            
        return {
            "success": False,
            "request_id": request_id,
            "message": "Command not found or already executing"
        }
        
    async def get_history(
        self,
        limit: int = 50,
        command: Optional[str] = None,
        status: Optional[str] = None,
        sender: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get command history.
        
        GET /commands/history
        """
        entries = self._history.get_recent(limit)
        
        # Apply filters
        if command:
            entries = [e for e in entries if e.command == command]
            
        if status:
            try:
                status_enum = CommandStatus(status)
                entries = [e for e in entries if e.status == status_enum]
            except ValueError:
                pass
                
        if sender:
            entries = [e for e in entries if e.sender == sender]
            
        return {
            "history": [e.to_history_item().model_dump() for e in entries],
            "stats": self._history.get_stats(),
            "total": len(entries)
        }
        
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get command dispatcher stats.
        
        GET /commands/stats
        """
        return self._dispatcher.get_stats()
        
    async def validate_command(
        self,
        command: CommandSchema,
        sender: str = "dashboard"
    ) -> Dict[str, Any]:
        """
        Validate a command without executing.
        
        POST /commands/validate
        """
        framework_available = False
        kernel_running = False
        
        if self.gateway:
            framework_available = self.gateway.runtime.is_connected()
            kernel_status = self.gateway.kernel.get_kernel_status()
            kernel_running = kernel_status.running
            
        sender_permission = self._permissions.get_user_permission(sender)
        
        validation = self._validator.validate(
            command,
            sender_permission,
            framework_available,
            kernel_running
        )
        
        return validation.model_dump()
