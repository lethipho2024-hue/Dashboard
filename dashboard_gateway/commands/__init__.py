"""
Dashboard Gateway Commands
==========================
Remote command system for controlling the ZBGym Framework.
"""

from .schemas import (
    CommandSchema,
    CommandResponseSchema,
    CommandInfo,
    CommandQueueItem,
    ExecutionHistoryItem,
    CommandStatus,
    CommandCategory,
    PermissionLevel,
    ValidationResult,
    COMMAND_SCHEMAS,
)

from .registry import (
    CommandRegistry,
    get_registry,
)

from .validator import CommandValidator

from .history import (
    CommandHistory,
    HistoryEntry,
    get_history,
)

from .permissions import (
    Permissions,
    PermissionDeniedError,
    get_permissions,
)

from .responses import (
    CommandResponse,
    ExecutionTimer,
)

from .dispatcher import (
    CommandDispatcher,
    get_dispatcher,
)


__all__ = [
    # Schemas
    "CommandSchema",
    "CommandResponseSchema",
    "CommandInfo",
    "CommandQueueItem",
    "ExecutionHistoryItem",
    "CommandStatus",
    "CommandCategory",
    "PermissionLevel",
    "ValidationResult",
    "COMMAND_SCHEMAS",
    
    # Registry
    "CommandRegistry",
    "get_registry",
    
    # Validator
    "CommandValidator",
    
    # History
    "CommandHistory",
    "HistoryEntry",
    "get_history",
    
    # Permissions
    "Permissions",
    "PermissionDeniedError",
    "get_permissions",
    
    # Responses
    "CommandResponse",
    "ExecutionTimer",
    
    # Dispatcher
    "CommandDispatcher",
    "get_dispatcher",
]
