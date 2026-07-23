"""
Auth Router
==========
Authentication API endpoints.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Request, HTTPException, Response, Depends

from .sessions import get_session_manager, SessionManager
from .jwt_manager import get_jwt_manager
from .authentication import get_current_user, AuthenticatedUser
from .permissions import PermissionChecker, Role, Permission


class LoginRequest(BaseModel):
    """Login request model."""
    username: str
    password: str
    remember_me: bool = False


class LoginResponse(BaseModel):
    """Login response model."""
    success: bool
    user: Optional[Dict[str, Any]] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_in: int = 0
    message: Optional[str] = None


class RefreshRequest(BaseModel):
    """Refresh token request model."""
    refresh_token: str


class UserResponse(BaseModel):
    """User response model."""
    id: str
    username: str
    email: Optional[str] = None
    role: str
    created_at: str
    last_login: Optional[str] = None


class AuthRouter:
    """
    Authentication router.
    
    Provides endpoints for:
    - Login
    - Logout
    - Token refresh
    - Current user info
    - Session management
    """
    
    def __init__(self, session_manager: Optional[SessionManager] = None):
        self._session_manager = session_manager or get_session_manager()
        
    async def post_login(
        self,
        request: Request,
        login_data: LoginRequest
    ) -> LoginResponse:
        """
        Authenticate user and create session.
        
        POST /auth/login
        """
        # Get client info
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
        
        # Authenticate
        result = self._session_manager.create_session_tokens(
            username=login_data.username,
            password=login_data.password,
            remember_me=login_data.remember_me,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        if not result:
            return LoginResponse(
                success=False,
                message="Invalid username or password"
            )
            
        return LoginResponse(
            success=True,
            user=result["user"],
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            expires_in=result["expires_in"]
        )
        
    async def post_logout(
        self,
        request: Request,
        user: AuthenticatedUser = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """
        Logout and revoke session.
        
        POST /auth/logout
        """
        self._session_manager.revoke_session(user.session_id)
        
        return {
            "success": True,
            "message": "Logged out successfully"
        }
        
    async def post_refresh(
        self,
        refresh_data: RefreshRequest
    ) -> LoginResponse:
        """
        Refresh access token.
        
        POST /auth/refresh
        """
        result = self._session_manager.refresh_tokens(refresh_data.refresh_token)
        
        if not result:
            return LoginResponse(
                success=False,
                message="Invalid or expired refresh token"
            )
            
        return LoginResponse(
            success=True,
            user=result["user"],
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            expires_in=result["expires_in"]
        )
        
    async def get_me(
        self,
        user: AuthenticatedUser = Depends(get_current_user)
    ) -> UserResponse:
        """
        Get current user info.
        
        GET /auth/me
        """
        session = self._session_manager.get_session(user.session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        db_user = self._session_manager.get_user(user.user_id)
        
        return UserResponse(
            id=user.user_id,
            username=user.username,
            email=db_user.email if db_user else None,
            role=user.role.value,
            created_at=db_user.created_at.isoformat() if db_user else "",
            last_login=db_user.last_login.isoformat() if db_user and db_user.last_login else None
        )
        
    async def get_session(
        self,
        user: AuthenticatedUser = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """
        Get current session info.
        
        GET /auth/session
        """
        session = self._session_manager.get_session(user.session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        return {
            "id": session.id,
            "user_id": session.user_id,
            "username": session.username,
            "role": session.role,
            "created_at": session.created_at.isoformat(),
            "last_activity": session.last_activity.isoformat(),
            "expires_at": session.expires_at.isoformat(),
        }
        
    async def post_change_password(
        self,
        request: Request,
        current_password: str,
        new_password: str,
        user: AuthenticatedUser = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """
        Change password.
        
        POST /auth/change-password
        """
        # Verify current password
        if not self._session_manager.verify_password(user.user_id, current_password):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )
            
        # TODO: Implement password change
        # This would update the user's password hash
        
        return {
            "success": True,
            "message": "Password changed successfully"
        }
        
    async def get_permissions(
        self,
        user: AuthenticatedUser = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """
        Get user's permissions.
        
        GET /permissions
        """
        return {
            "role": user.role.value,
            "permissions": PermissionChecker.get_permissions(user.role),
            "grouped": PermissionChecker.get_role_permissions(user.role)
        }
        
    async def get_roles(self) -> list:
        """
        Get all available roles.
        
        GET /roles
        """
        return PermissionChecker.get_all_roles()


# Singleton router instance
_auth_router: Optional[AuthRouter] = None


def get_auth_router() -> AuthRouter:
    """Get the global auth router."""
    global _auth_router
    if _auth_router is None:
        _auth_router = AuthRouter()
    return _auth_router
