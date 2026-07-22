"""
Command Validator
================
Validates commands before execution.
"""

from typing import List, Tuple, Optional, Any, Dict
import json
import jsonschema

from .schemas import (
    CommandSchema, 
    ValidationResult, 
    PermissionLevel,
    CommandInfo
)
from .registry import get_registry


class CommandValidator:
    """
    Command validator.
    
    Validates:
    - Command exists
    - Arguments match schema
    - Permissions are sufficient
    - Framework is available (if required)
    - Kernel state is correct (if required)
    """
    
    def __init__(self):
        self._registry = get_registry()
        
    def validate(
        self, 
        command: CommandSchema,
        sender_permission: PermissionLevel,
        framework_available: bool = False,
        kernel_running: bool = False
    ) -> ValidationResult:
        """
        Validate a command.
        
        Args:
            command: Command to validate
            sender_permission: Permission level of sender
            framework_available: Whether framework is connected
            kernel_running: Whether kernel is running
            
        Returns:
            ValidationResult with validation status and errors
        """
        errors: List[str] = []
        warnings: List[str] = []
        
        # 1. Check if command exists
        cmd_info = self._registry.get_info(command.command)
        if not cmd_info:
            errors.append(f"Unknown command: {command.command}")
            return ValidationResult(
                valid=False,
                errors=errors,
                warnings=warnings
            )
            
        # 2. Check permission level
        if not self._has_permission(sender_permission, cmd_info.permission_level):
            errors.append(
                f"Insufficient permission. Required: {cmd_info.permission_level.value}, "
                f"Has: {sender_permission.value}"
            )
            
        # 3. Check framework availability
        if cmd_info.requires_framework and not framework_available:
            errors.append("Framework is not available")
            
        # 4. Check kernel state for kernel commands
        if cmd_info.category.value == "kernel" and command.command != "start_kernel":
            if not kernel_running:
                errors.append("Kernel is not running")
                
        # 5. Validate arguments against schema
        if cmd_info.arguments_schema:
            arg_errors = self._validate_arguments(
                command.arguments, 
                cmd_info.arguments_schema
            )
            errors.extend(arg_errors)
            
        # 6. Add warnings for destructive commands
        if cmd_info.is_destructive:
            warnings.append(f"Warning: {command.command} is a destructive command")
            
        return ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            command_info=cmd_info
        )
        
    def _has_permission(
        self, 
        sender_level: PermissionLevel,
        required_level: PermissionLevel
    ) -> bool:
        """Check if sender has required permission level."""
        level_order = [
            PermissionLevel.VIEWER,
            PermissionLevel.OPERATOR,
            PermissionLevel.DEVELOPER,
            PermissionLevel.ADMINISTRATOR
        ]
        
        return level_order.index(sender_level) >= level_order.index(required_level)
        
    def _validate_arguments(
        self, 
        arguments: Dict[str, Any],
        schema: Dict[str, Any]
    ) -> List[str]:
        """Validate arguments against JSON schema."""
        errors = []
        
        try:
            jsonschema.validate(instance=arguments, schema=schema)
        except jsonschema.ValidationError as e:
            errors.append(f"Invalid argument: {e.message}")
        except jsonschema.SchemaError as e:
            errors.append(f"Schema error: {e.message}")
            
        return errors
        
    def validate_arguments(
        self, 
        command: str, 
        arguments: Dict[str, Any]
    ) -> Tuple[bool, List[str]]:
        """
        Validate arguments for a specific command.
        
        Returns:
            Tuple of (is_valid, errors)
        """
        cmd_info = self._registry.get_info(command)
        if not cmd_info:
            return False, [f"Unknown command: {command}"]
            
        if not cmd_info.arguments_schema:
            return True, []
            
        errors = self._validate_arguments(arguments, cmd_info.arguments_schema)
        return len(errors) == 0, errors
        
    def get_command_info(self, command: str) -> Optional[CommandInfo]:
        """Get command info for documentation."""
        return self._registry.get_info(command)
        
    def get_all_commands(self) -> List[CommandInfo]:
        """Get all available commands."""
        return self._registry.get_all()
        
    def get_commands_by_permission(
        self, 
        permission: PermissionLevel
    ) -> List[CommandInfo]:
        """Get commands available to a permission level."""
        return self._registry.get_by_permission(permission)
