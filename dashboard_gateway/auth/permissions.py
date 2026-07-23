"""
Permissions
===========
Role-based access control (RBAC).
"""

from enum import Enum
from typing import Dict, List, Set


class Role(str, Enum):
    """User roles."""
    VIEWER = "viewer"
    OPERATOR = "operator"
    DEVELOPER = "developer"
    ADMINISTRATOR = "administrator"
    OWNER = "owner"


# Permission definitions
class Permission(str, Enum):
    # Dashboard
    DASHBOARD_READ = "dashboard:read"
    
    # Kernel
    KERNEL_READ = "kernel:read"
    KERNEL_WRITE = "kernel:write"
    KERNEL_EXECUTE = "kernel:execute"
    KERNEL_RESTART = "kernel:restart"
    
    # Trainer
    TRAINER_READ = "trainer:read"
    TRAINER_WRITE = "trainer:write"
    TRAINER_EXECUTE = "trainer:execute"
    TRAINER_PAUSE = "trainer:pause"
    TRAINER_RESUME = "trainer:resume"
    
    # Replay
    REPLAY_READ = "replay:read"
    REPLAY_WRITE = "replay:write"
    REPLAY_EXECUTE = "replay:execute"
    
    # Plugins
    PLUGINS_READ = "plugins:read"
    PLUGINS_WRITE = "plugins:write"
    PLUGINS_EXECUTE = "plugins:execute"
    PLUGINS_MANAGE = "plugins:manage"
    
    # AI
    AI_READ = "ai:read"
    AI_WRITE = "ai:write"
    AI_EXECUTE = "ai:execute"
    
    # Metrics
    METRICS_READ = "metrics:read"
    METRICS_WRITE = "metrics:write"
    METRICS_EXPORT = "metrics:export"
    METRICS_RESET = "metrics:reset"
    
    # Logs
    LOGS_READ = "logs:read"
    LOGS_EXPORT = "logs:export"
    LOGS_CLEAR = "logs:clear"
    
    # Commands
    COMMANDS_READ = "commands:read"
    COMMANDS_EXECUTE = "commands:execute"
    COMMANDS_QUEUE = "commands:queue"
    COMMANDS_CANCEL = "commands:cancel"
    
    # Framework
    FRAMEWORK_READ = "framework:read"
    FRAMEWORK_SHUTDOWN = "framework:shutdown"
    FRAMEWORK_RESTART = "framework:restart"
    
    # License
    LICENSE_READ = "license:read"
    LICENSE_WRITE = "license:write"
    LICENSE_MANAGE = "license:manage"
    
    # Settings
    SETTINGS_READ = "settings:read"
    SETTINGS_WRITE = "settings:write"
    
    # Users
    USERS_READ = "users:read"
    USERS_WRITE = "users:write"
    USERS_MANAGE = "users:manage"
    
    # Audit
    AUDIT_READ = "audit:read"


# Role permissions matrix
ROLE_PERMISSIONS: Dict[Role, Set[Permission]] = {
    Role.VIEWER: {
        Permission.DASHBOARD_READ,
        Permission.KERNEL_READ,
        Permission.TRAINER_READ,
        Permission.REPLAY_READ,
        Permission.PLUGINS_READ,
        Permission.AI_READ,
        Permission.METRICS_READ,
        Permission.LOGS_READ,
        Permission.COMMANDS_READ,
        Permission.FRAMEWORK_READ,
        Permission.LICENSE_READ,
        Permission.SETTINGS_READ,
    },
    Role.OPERATOR: {
        # Viewer permissions
        Permission.DASHBOARD_READ,
        Permission.KERNEL_READ,
        Permission.TRAINER_READ,
        Permission.REPLAY_READ,
        Permission.PLUGINS_READ,
        Permission.AI_READ,
        Permission.METRICS_READ,
        Permission.LOGS_READ,
        Permission.COMMANDS_READ,
        Permission.FRAMEWORK_READ,
        Permission.LICENSE_READ,
        Permission.SETTINGS_READ,
        # Operator permissions
        Permission.KERNEL_EXECUTE,
        Permission.TRAINER_EXECUTE,
        Permission.TRAINER_PAUSE,
        Permission.TRAINER_RESUME,
        Permission.REPLAY_EXECUTE,
        Permission.COMMANDS_EXECUTE,
        Permission.COMMANDS_QUEUE,
    },
    Role.DEVELOPER: {
        # Operator permissions
        Permission.DASHBOARD_READ,
        Permission.KERNEL_READ,
        Permission.KERNEL_EXECUTE,
        Permission.TRAINER_READ,
        Permission.TRAINER_EXECUTE,
        Permission.TRAINER_PAUSE,
        Permission.TRAINER_RESUME,
        Permission.REPLAY_READ,
        Permission.REPLAY_EXECUTE,
        Permission.PLUGINS_READ,
        Permission.AI_READ,
        Permission.METRICS_READ,
        Permission.LOGS_READ,
        Permission.COMMANDS_READ,
        Permission.COMMANDS_EXECUTE,
        Permission.COMMANDS_QUEUE,
        Permission.FRAMEWORK_READ,
        Permission.LICENSE_READ,
        Permission.SETTINGS_READ,
        # Developer permissions
        Permission.KERNEL_WRITE,
        Permission.KERNEL_RESTART,
        Permission.TRAINER_WRITE,
        Permission.REPLAY_WRITE,
        Permission.PLUGINS_WRITE,
        Permission.PLUGINS_EXECUTE,
        Permission.PLUGINS_MANAGE,
        Permission.AI_WRITE,
        Permission.AI_EXECUTE,
        Permission.METRICS_WRITE,
        Permission.METRICS_EXPORT,
        Permission.METRICS_RESET,
        Permission.LOGS_EXPORT,
        Permission.COMMANDS_CANCEL,
    },
    Role.ADMINISTRATOR: {
        # Developer permissions
        Permission.DASHBOARD_READ,
        Permission.KERNEL_READ,
        Permission.KERNEL_WRITE,
        Permission.KERNEL_EXECUTE,
        Permission.KERNEL_RESTART,
        Permission.TRAINER_READ,
        Permission.TRAINER_WRITE,
        Permission.TRAINER_EXECUTE,
        Permission.TRAINER_PAUSE,
        Permission.TRAINER_RESUME,
        Permission.REPLAY_READ,
        Permission.REPLAY_WRITE,
        Permission.REPLAY_EXECUTE,
        Permission.PLUGINS_READ,
        Permission.PLUGINS_WRITE,
        Permission.PLUGINS_EXECUTE,
        Permission.PLUGINS_MANAGE,
        Permission.AI_READ,
        Permission.AI_WRITE,
        Permission.AI_EXECUTE,
        Permission.METRICS_READ,
        Permission.METRICS_WRITE,
        Permission.METRICS_EXPORT,
        Permission.METRICS_RESET,
        Permission.LOGS_READ,
        Permission.LOGS_EXPORT,
        Permission.LOGS_CLEAR,
        Permission.COMMANDS_READ,
        Permission.COMMANDS_EXECUTE,
        Permission.COMMANDS_QUEUE,
        Permission.COMMANDS_CANCEL,
        Permission.FRAMEWORK_READ,
        Permission.LICENSE_READ,
        Permission.LICENSE_WRITE,
        Permission.LICENSE_MANAGE,
        Permission.SETTINGS_READ,
        Permission.SETTINGS_WRITE,
        Permission.USERS_READ,
        Permission.USERS_WRITE,
        Permission.AUDIT_READ,
        # Administrator permissions
        Permission.FRAMEWORK_SHUTDOWN,
        Permission.FRAMEWORK_RESTART,
    },
    Role.OWNER: set(Permission),  # All permissions
}


class PermissionChecker:
    """
    Permission checker for RBAC.
    """
    
    @staticmethod
    def get_role_level(role: Role) -> int:
        """Get numeric level for a role."""
        levels = {
            Role.VIEWER: 0,
            Role.OPERATOR: 1,
            Role.DEVELOPER: 2,
            Role.ADMINISTRATOR: 3,
            Role.OWNER: 4,
        }
        return levels.get(role, 0)
        
    @staticmethod
    def has_role(minimum_role: Role, user_role: Role) -> bool:
        """Check if user has minimum required role."""
        return PermissionChecker.get_role_level(user_role) >= PermissionChecker.get_role_level(minimum_role)
        
    @staticmethod
    def has_permission(role: Role, permission: Permission) -> bool:
        """Check if role has a specific permission."""
        return permission in ROLE_PERMISSIONS.get(role, set())
        
    @staticmethod
    def has_any_permission(role: Role, permissions: List[Permission]) -> bool:
        """Check if role has any of the specified permissions."""
        role_perms = ROLE_PERMISSIONS.get(role, set())
        return any(p in role_perms for p in permissions)
        
    @staticmethod
    def has_all_permissions(role: Role, permissions: List[Permission]) -> bool:
        """Check if role has all of the specified permissions."""
        role_perms = ROLE_PERMISSIONS.get(role, set())
        return all(p in role_perms for p in permissions)
        
    @staticmethod
    def get_permissions(role: Role) -> List[str]:
        """Get all permissions for a role."""
        return [p.value for p in ROLE_PERMISSIONS.get(role, set())]
        
    @staticmethod
    def get_role_permissions(role: Role) -> Dict[str, List[str]]:
        """Get permissions grouped by resource."""
        permissions = ROLE_PERMISSIONS.get(role, set())
        
        grouped: Dict[str, List[str]] = {}
        for perm in permissions:
            resource = perm.value.split(":")[0]
            action = perm.value.split(":")[1]
            if resource not in grouped:
                grouped[resource] = []
            grouped[resource].append(action)
            
        return grouped
        
    @staticmethod
    def get_all_roles() -> List[Dict]:
        """Get all roles with their permissions."""
        return [
            {
                "name": role.value,
                "level": PermissionChecker.get_role_level(role),
                "permissions": PermissionChecker.get_permissions(role),
            }
            for role in Role
        ]
