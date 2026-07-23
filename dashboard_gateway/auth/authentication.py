"""
Authentication Middleware
=======================
Authentication and authorization middleware.
"""

from typing import Optional, Callable, Dict, Any
from functools import wraps
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

from .jwt_manager import get_jwt_manager
from .sessions import get_session_manager
from .permissions import PermissionChecker, Role, Permission


class AuthenticatedUser:
    """Authenticated user context."""
    
    def __init__(
        self,
        user_id: str,
        username: str,
        role: str,
        session_id: str
    ):
        self.user_id = user_id
        self.username = username
        self.role = Role(role)
        self.session_id = session_id
        
    def has_permission(self, permission: Permission) -> bool:
        """Check if user has a specific permission."""
        return PermissionChecker.has_permission(self.role, permission)
        
    def has_any_permission(self, permissions: list) -> bool:
        """Check if user has any of the specified permissions."""
        return PermissionChecker.has_any_permission(self.role, permissions)
        
    def has_all_permissions(self, permissions: list) -> bool:
        """Check if user has all of the specified permissions."""
        return PermissionChecker.has_all_permissions(self.role, permissions)
        
    def has_role(self, minimum_role: Role) -> bool:
        """Check if user has minimum required role."""
        return PermissionChecker.has_role(minimum_role, self.role)
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.user_id,
            "username": self.username,
            "role": self.role.value,
            "session_id": self.session_id,
        }


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Authentication middleware.
    
    Extracts and validates JWT tokens from requests.
    """
    
    # Paths that don't require authentication
    PUBLIC_PATHS = {
        "/",
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/auth/login",
        "/auth/refresh",
        "/ws",
    }
    
    async def dispatch(self, request: Request, call_next):
        # Check if path is public
        path = request.url.path
        if path in self.PUBLIC_PATHS or path.startswith("/docs"):
            return await call_next(request)
            
        # Get Authorization header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            # Try to get session from cookie
            session_id = request.cookies.get("session_id")
            if session_id:
                # Validate session
                session_manager = get_session_manager()
                session = session_manager.get_session(session_id)
                
                if session:
                    # Set user in request state
                    request.state.user = AuthenticatedUser(
                        user_id=session.user_id,
                        username=session.username,
                        role=session.role,
                        session_id=session.id
                    )
                    return await call_next(request)
        else:
            # Validate JWT token
            try:
                scheme, token = auth_header.split()
                
                if scheme.lower() != "bearer":
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid authentication scheme"
                    )
                    
                jwt_manager = get_jwt_manager()
                payload = jwt_manager.verify_access_token(token)
                
                if not payload:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid or expired token"
                    )
                    
                # Set user in request state
                request.state.user = AuthenticatedUser(
                    user_id=payload["sub"],
                    username=payload.get("username", payload["sub"]),
                    role=payload["role"],
                    session_id=payload["session_id"]
                )
                
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authorization header"
                )
                
        return await call_next(request)


def get_current_user(request: Request) -> AuthenticatedUser:
    """
    Get the current authenticated user from request.
    
    Raises HTTPException if not authenticated.
    """
    user = getattr(request.state, "user", None)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
        
    return user


def require_auth(func: Callable) -> Callable:
    """Decorator to require authentication."""
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        get_current_user(request)
        return await func(request, *args, **kwargs)
    return wrapper


def require_role(minimum_role: Role) -> Callable:
    """Decorator to require minimum role."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            user = get_current_user(request)
            
            if not user.has_role(minimum_role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Requires {minimum_role.value} role or higher"
                )
                
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_permission(permission: Permission) -> Callable:
    """Decorator to require a specific permission."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            user = get_current_user(request)
            
            if not user.has_permission(permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permission: {permission.value}"
                )
                
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_any_permission(permissions: list) -> Callable:
    """Decorator to require any of the specified permissions."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            user = get_current_user(request)
            
            if not user.has_any_permission(permissions):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permissions"
                )
                
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
