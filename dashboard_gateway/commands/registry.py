"""
Command Registry
===============
Central registry for all available commands.
"""

from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field

from .schemas import (
    CommandInfo, 
    CommandCategory, 
    PermissionLevel,
    COMMAND_SCHEMAS
)


@dataclass
class RegisteredCommand:
    """Registered command information."""
    name: str
    category: CommandCategory
    description: str
    permission_level: PermissionLevel
    handler: Callable[..., Any]
    arguments_schema: Optional[Dict] = None
    aliases: List[str] = field(default_factory=list)
    version: str = "1.0.0"
    is_destructive: bool = False
    requires_framework: bool = True
    
    def to_command_info(self) -> CommandInfo:
        """Convert to CommandInfo."""
        return CommandInfo(
            name=self.name,
            category=self.category,
            description=self.description,
            permission_level=self.permission_level,
            arguments_schema=self.arguments_schema,
            aliases=self.aliases,
            version=self.version,
            is_destructive=self.is_destructive,
            requires_framework=self.requires_framework
        )


class CommandRegistry:
    """
    Central command registry.
    
    Responsibilities:
    - Register commands
    - Unregister commands
    - Lookup commands
    - Get command info
    - Get commands by category
    - Get commands by permission level
    """
    
    def __init__(self):
        self._commands: Dict[str, RegisteredCommand] = {}
        self._aliases: Dict[str, str] = {}  # alias -> command name
        
    def register(
        self,
        name: str,
        category: CommandCategory,
        description: str,
        handler: Callable[..., Any],
        permission_level: PermissionLevel = PermissionLevel.OPERATOR,
        arguments_schema: Optional[Dict] = None,
        aliases: Optional[List[str]] = None,
        version: str = "1.0.0",
        is_destructive: bool = False,
        requires_framework: bool = True
    ) -> None:
        """Register a command."""
        cmd = RegisteredCommand(
            name=name,
            category=category,
            description=description,
            handler=handler,
            permission_level=permission_level,
            arguments_schema=arguments_schema or COMMAND_SCHEMAS.get(name),
            aliases=aliases or [],
            version=version,
            is_destructive=is_destructive,
            requires_framework=requires_framework
        )
        
        self._commands[name] = cmd
        
        # Register aliases
        for alias in cmd.aliases:
            self._aliases[alias] = name
            
    def unregister(self, name: str) -> bool:
        """Unregister a command."""
        if name not in self._commands:
            return False
            
        cmd = self._commands[name]
        
        # Remove aliases
        for alias in cmd.aliases:
            self._aliases.pop(alias, None)
            
        del self._commands[name]
        return True
        
    def get(self, name: str) -> Optional[RegisteredCommand]:
        """Get a command by name or alias."""
        # Try direct lookup
        if name in self._commands:
            return self._commands[name]
            
        # Try alias lookup
        if name in self._aliases:
            return self._commands.get(self._aliases[name])
            
        return None
        
    def get_info(self, name: str) -> Optional[CommandInfo]:
        """Get command info by name or alias."""
        cmd = self.get(name)
        return cmd.to_command_info() if cmd else None
        
    def get_all(self) -> List[CommandInfo]:
        """Get all registered commands."""
        return [cmd.to_command_info() for cmd in self._commands.values()]
        
    def get_by_category(self, category: CommandCategory) -> List[CommandInfo]:
        """Get commands by category."""
        return [
            cmd.to_command_info() 
            for cmd in self._commands.values() 
            if cmd.category == category
        ]
        
    def get_by_permission(self, permission_level: PermissionLevel) -> List[CommandInfo]:
        """Get commands by minimum permission level."""
        level_order = [
            PermissionLevel.VIEWER,
            PermissionLevel.OPERATOR,
            PermissionLevel.DEVELOPER,
            PermissionLevel.ADMINISTRATOR
        ]
        
        min_level_idx = level_order.index(permission_level)
        
        return [
            cmd.to_command_info()
            for cmd in self._commands.values()
            if level_order.index(cmd.permission_level) >= min_level_idx
        ]
        
    def get_destructive(self) -> List[CommandInfo]:
        """Get all destructive commands."""
        return [
            cmd.to_command_info()
            for cmd in self._commands.values()
            if cmd.is_destructive
        ]
        
    def get_requires_framework(self) -> List[CommandInfo]:
        """Get commands that require framework."""
        return [
            cmd.to_command_info()
            for cmd in self._commands.values()
            if cmd.requires_framework
        ]
        
    def exists(self, name: str) -> bool:
        """Check if command exists."""
        return self.get(name) is not None
        
    def get_count(self) -> int:
        """Get total command count."""
        return len(self._commands)
        
    def clear(self) -> None:
        """Clear all commands."""
        self._commands.clear()
        self._aliases.clear()


# Global registry instance
_registry: Optional[CommandRegistry] = None


def get_registry() -> CommandRegistry:
    """Get the global command registry."""
    global _registry
    if _registry is None:
        _registry = CommandRegistry()
        _register_default_commands(_registry)
    return _registry


def _register_default_commands(registry: CommandRegistry) -> None:
    """Register default commands."""
    
    # Kernel commands
    registry.register(
        name="start_kernel",
        category=CommandCategory.KERNEL,
        description="Start the kernel",
        handler=lambda: None,  # Placeholder
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="stop_kernel",
        category=CommandCategory.KERNEL,
        description="Stop the kernel",
        handler=lambda: None,
        permission_level=PermissionLevel.OPERATOR,
        is_destructive=True
    )
    
    registry.register(
        name="restart_kernel",
        category=CommandCategory.KERNEL,
        description="Restart the kernel",
        handler=lambda: None,
        permission_level=PermissionLevel.DEVELOPER,
        is_destructive=True
    )
    
    registry.register(
        name="pause_kernel",
        category=CommandCategory.KERNEL,
        description="Pause the kernel",
        handler=lambda: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="resume_kernel",
        category=CommandCategory.KERNEL,
        description="Resume the kernel",
        handler=lambda: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    # Runtime commands
    registry.register(
        name="reload_runtime",
        category=CommandCategory.RUNTIME,
        description="Reload runtime configuration",
        handler=lambda: None,
        permission_level=PermissionLevel.DEVELOPER
    )
    
    registry.register(
        name="reset_runtime",
        category=CommandCategory.RUNTIME,
        description="Reset runtime to default state",
        handler=lambda: None,
        permission_level=PermissionLevel.DEVELOPER,
        is_destructive=True
    )
    
    registry.register(
        name="runtime_snapshot",
        category=CommandCategory.RUNTIME,
        description="Get runtime snapshot",
        handler=lambda: None,
        permission_level=PermissionLevel.VIEWER
    )
    
    # Trainer commands
    registry.register(
        name="start_training",
        category=CommandCategory.TRAINER,
        description="Start a new training session",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="pause_training",
        category=CommandCategory.TRAINER,
        description="Pause current training",
        handler=lambda: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="resume_training",
        category=CommandCategory.TRAINER,
        description="Resume paused training",
        handler=lambda: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="stop_training",
        category=CommandCategory.TRAINER,
        description="Stop current training",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.OPERATOR,
        is_destructive=True
    )
    
    registry.register(
        name="save_checkpoint",
        category=CommandCategory.TRAINER,
        description="Save training checkpoint",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="load_checkpoint",
        category=CommandCategory.TRAINER,
        description="Load training checkpoint",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    # Replay commands
    registry.register(
        name="start_recording",
        category=CommandCategory.REPLAY,
        description="Start replay recording",
        handler=lambda: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="stop_recording",
        category=CommandCategory.REPLAY,
        description="Stop replay recording",
        handler=lambda: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="save_replay",
        category=CommandCategory.REPLAY,
        description="Save replay to file",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="clear_replay_queue",
        category=CommandCategory.REPLAY,
        description="Clear replay queue",
        handler=lambda: None,
        permission_level=PermissionLevel.DEVELOPER,
        is_destructive=True
    )
    
    # Plugin commands
    registry.register(
        name="load_plugin",
        category=CommandCategory.PLUGINS,
        description="Load a plugin",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.DEVELOPER
    )
    
    registry.register(
        name="unload_plugin",
        category=CommandCategory.PLUGINS,
        description="Unload a plugin",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.DEVELOPER,
        is_destructive=True
    )
    
    registry.register(
        name="reload_plugin",
        category=CommandCategory.PLUGINS,
        description="Reload a plugin",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.DEVELOPER
    )
    
    registry.register(
        name="enable_plugin",
        category=CommandCategory.PLUGINS,
        description="Enable a plugin",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    registry.register(
        name="disable_plugin",
        category=CommandCategory.PLUGINS,
        description="Disable a plugin",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.OPERATOR,
        is_destructive=True
    )
    
    # Log commands
    registry.register(
        name="clear_logs",
        category=CommandCategory.LOGS,
        description="Clear all logs",
        handler=lambda: None,
        permission_level=PermissionLevel.DEVELOPER,
        is_destructive=True
    )
    
    registry.register(
        name="export_logs",
        category=CommandCategory.LOGS,
        description="Export logs to file",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    # Metrics commands
    registry.register(
        name="reset_metrics",
        category=CommandCategory.METRICS,
        description="Reset metrics counters",
        handler=lambda: None,
        permission_level=PermissionLevel.DEVELOPER,
        is_destructive=True
    )
    
    registry.register(
        name="export_metrics",
        category=CommandCategory.METRICS,
        description="Export metrics to file",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.OPERATOR
    )
    
    # Framework commands
    registry.register(
        name="framework_shutdown",
        category=CommandCategory.FRAMEWORK,
        description="Shutdown the framework",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.ADMINISTRATOR,
        is_destructive=True
    )
    
    registry.register(
        name="framework_restart",
        category=CommandCategory.FRAMEWORK,
        description="Restart the framework",
        handler=lambda: None,
        permission_level=PermissionLevel.ADMINISTRATOR,
        is_destructive=True
    )
    
    registry.register(
        name="framework_snapshot",
        category=CommandCategory.FRAMEWORK,
        description="Get framework snapshot",
        handler=lambda **kwargs: None,
        permission_level=PermissionLevel.VIEWER
    )
