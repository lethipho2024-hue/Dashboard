"""
Command Permissions
===================
Permission system for commands.
"""

from typing import Dict, List, Optional, Set
from enum import Enum

from .schemas import PermissionLevel, CommandInfo


class PermissionDeniedError(Exception):
    """Raised when permission is denied."""
    pass


class Permissions:
    """
    Permission manager for commands.
    
    Manages:
    - User permission levels
    - Command permission requirements
    - Permission inheritance
    """
    
    def __init__(self):
        # Default user permissions (can be overridden)
        self._user_permissions: Dict[str, PermissionLevel] = {
            "dashboard": PermissionLevel.OPERATOR,
            "admin": PermissionLevel.ADMINISTRATOR,
            "viewer": PermissionLevel.VIEWER,
        }
        
        # Permission level hierarchy
        self._level_hierarchy = {
            PermissionLevel.VIEWER: 0,
            PermissionLevel.OPERATOR: 1,
            PermissionLevel.DEVELOPER: 2,
            PermissionLevel.ADMINISTRATOR: 3,
        }
        
        # Commands that require administrator
        self._admin_commands: Set[str] = {
            "framework_shutdown",
            "framework_restart",
        }
        
        # Commands that require developer or higher
        self._developer_commands: Set[str] = {
            "restart_kernel",
            "reset_runtime",
            "clear_replay_queue",
            "clear_logs",
            "reset_metrics",
        }
        
        # Destructive commands (require confirmation)
        self._destructive_commands: Set[str] = {
            "stop_kernel",
            "restart_kernel",
            "stop_training",
            "clear_replay_queue",
            "clear_logs",
            "reset_metrics",
            "unload_plugin",
            "disable_plugin",
            "framework_shutdown",
            "framework_restart",
        }
        
    def get_user_permission(self, user_id: str) -> PermissionLevel:
        """Get permission level for a user."""
        return self._user_permissions.get(user_id, PermissionLevel.VIEWER)
        
    def set_user_permission(
        self, 
        user_id: str, 
        level: PermissionLevel
    ) -> None:
        """Set permission level for a user."""
        self._user_permissions[user_id] = level
        
    def has_permission(
        self, 
        user_level: PermissionLevel,
        required_level: PermissionLevel
    ) -> bool:
        """Check if user level meets required level."""
        return self._level_hierarchy.get(user_level, 0) >= \
               self._level_hierarchy.get(required_level, 0)
               
    def can_execute(
        self,
        user_id: str,
        command: CommandInfo
    ) -> bool:
        """Check if user can execute a command."""
        user_level = self.get_user_permission(user_id)
        return self.has_permission(user_level, command.permission_level)
        
    def check_permission(
        self,
        user_id: str,
        command: CommandInfo
    ) -> None:
        """Check permission, raise if denied."""
        if not self.can_execute(user_id, command):
            user_level = self.get_user_permission(user_id)
            raise PermissionDeniedError(
                f"User '{user_id}' (level: {user_level.value}) cannot execute "
                f"'{command.name}' (requires: {command.permission_level.value})"
            )
            
    def is_admin_command(self, command_name: str) -> bool:
        """Check if command requires administrator."""
        return command_name in self._admin_commands
        
    def is_developer_command(self, command_name: str) -> bool:
        """Check if command requires developer or higher."""
        return command_name in self._developer_commands
        
    def is_destructive(self, command_name: str) -> bool:
        """Check if command is destructive."""
        return command_name in self._destructive_commands
        
    def get_commands_for_user(
        self, 
        user_id: str,
        all_commands: List[CommandInfo]
    ) -> List[CommandInfo]:
        """Get commands available to a user."""
        user_level = self.get_user_permission(user_id)
        return [
            cmd for cmd in all_commands
            if self.has_permission(user_level, cmd.permission_level)
        ]
        
    def get_destructive_commands(
        self, 
        all_commands: List[CommandInfo]
    ) -> List[CommandInfo]:
        """Get all destructive commands."""
        return [
            cmd for cmd in all_commands
            if self.is_destructive(cmd.name)
        ]
        
    def get_commands_by_level(
        self,
        level: PermissionLevel,
        all_commands: List[CommandInfo]
    ) -> List[CommandInfo]:
        """Get commands at or below a permission level."""
        return [
            cmd for cmd in all_commands
            if self.has_permission(level, cmd.permission_level)
        ]


# Global permissions instance
_permissions: Optional[Permissions] = None


def get_permissions() -> Permissions:
    """Get the global permissions instance."""
    global _permissions
    if _permissions is None:
        _permissions = Permissions()
    return _permissions
