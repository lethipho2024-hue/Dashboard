"""
Dashboard Gateway Auth
====================
Authentication and authorization module.
"""

from .jwt_manager import JWTManager, get_jwt_manager
from .sessions import SessionManager, Session, User, get_session_manager
from .permissions import (
    Role,
    Permission,
    PermissionChecker,
    ROLE_PERMISSIONS,
)
from .authentication import (
    AuthMiddleware,
    AuthenticatedUser,
    get_current_user,
    require_auth,
    require_role,
    require_permission,
    require_any_permission,
)
from .router import AuthRouter, get_auth_router


__all__ = [
    # JWT
    "JWTManager",
    "get_jwt_manager",
    
    # Sessions
    "SessionManager",
    "Session",
    "User",
    "get_session_manager",
    
    # Permissions
    "Role",
    "Permission",
    "PermissionChecker",
    "ROLE_PERMISSIONS",
    
    # Authentication
    "AuthMiddleware",
    "AuthenticatedUser",
    "get_current_user",
    "require_auth",
    "require_role",
    "require_permission",
    "require_any_permission",
    
    # Router
    "AuthRouter",
    "get_auth_router",
]
