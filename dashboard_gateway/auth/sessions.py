"""
Session Manager
==============
User session management.
"""

from typing import Dict, Optional, List
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import defaultdict
import uuid
import hashlib

from .jwt_manager import get_jwt_manager, JWTManager


@dataclass
class User:
    """User model."""
    id: str
    username: str
    email: Optional[str]
    password_hash: str
    role: str
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True


@dataclass
class Session:
    """User session model."""
    id: str
    user_id: str
    username: str
    role: str
    created_at: datetime
    last_activity: datetime
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    refresh_token_hash: Optional[str] = None


class SessionManager:
    """
    Session manager.
    
    Handles:
    - User management
    - Session creation
    - Session validation
    - Session revocation
    - Password verification
    """
    
    def __init__(
        self,
        jwt_manager: Optional[JWTManager] = None,
        session_timeout_minutes: int = 60
    ):
        self._jwt_manager = jwt_manager or get_jwt_manager()
        self._session_timeout = session_timeout_minutes
        
        # In-memory storage (replace with database in production)
        self._users: Dict[str, User] = {}
        self._sessions: Dict[str, Session] = {}
        self._sessions_by_user: Dict[str, List[str]] = defaultdict(list)
        self._refresh_tokens: Dict[str, str] = {}  # token_hash -> session_id
        
        # Create default admin user for development
        self._create_default_users()
        
    def _create_default_users(self) -> None:
        """Create default users for development."""
        # Admin user (password: admin123)
        admin = User(
            id="user-admin",
            username="admin",
            email="admin@zbgym.local",
            password_hash=self._hash_password("admin123"),
            role="administrator",
            created_at=datetime.utcnow()
        )
        self._users["user-admin"] = admin
        
        # Operator user (password: operator123)
        operator = User(
            id="user-operator",
            username="operator",
            email="operator@zbgym.local",
            password_hash=self._hash_password("operator123"),
            role="operator",
            created_at=datetime.utcnow()
        )
        self._users["user-operator"] = operator
        
        # Developer user (password: dev123)
        developer = User(
            id="user-developer",
            username="developer",
            email="dev@zbgym.local",
            password_hash=self._hash_password("dev123"),
            role="developer",
            created_at=datetime.utcnow()
        )
        self._users["user-developer"] = developer
        
        # Viewer user (password: viewer123)
        viewer = User(
            id="user-viewer",
            username="viewer",
            email="viewer@zbgym.local",
            password_hash=self._hash_password("viewer123"),
            role="viewer",
            created_at=datetime.utcnow()
        )
        self._users["user-viewer"] = viewer
        
    def _hash_password(self, password: str) -> str:
        """Hash a password."""
        return hashlib.sha256(password.encode()).hexdigest()
        
    def verify_password(self, user_id: str, password: str) -> bool:
        """Verify user password."""
        user = self._users.get(user_id)
        if not user:
            return False
        return user.password_hash == self._hash_password(password)
        
    def authenticate(
        self,
        username: str,
        password: str,
        remember_me: bool = False,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Optional[Session]:
        """
        Authenticate a user and create a session.
        
        Returns:
            Session if authentication successful, None otherwise
        """
        # Find user by username
        user = None
        for u in self._users.values():
            if u.username == username:
                user = u
                break
                
        if not user:
            return None
            
        # Verify password
        if not self.verify_password(user.id, password):
            return None
            
        # Check if user is active
        if not user.is_active:
            return None
            
        # Update last login
        user.last_login = datetime.utcnow()
        
        # Create session
        session_id = str(uuid.uuid4())
        now = datetime.utcnow()
        expires_at = now + timedelta(
            minutes=self._session_timeout if not remember_me else self._session_timeout * 24
        )
        
        session = Session(
            id=session_id,
            user_id=user.id,
            username=user.username,
            role=user.role,
            created_at=now,
            last_activity=now,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self._sessions[session_id] = session
        self._sessions_by_user[user.id].append(session_id)
        
        return session
        
    def get_session(self, session_id: str) -> Optional[Session]:
        """Get a session by ID."""
        session = self._sessions.get(session_id)
        
        if session:
            # Check expiration
            if datetime.utcnow() > session.expires_at:
                self.revoke_session(session_id)
                return None
                
            # Update last activity
            session.last_activity = datetime.utcnow()
            
        return session
        
    def get_user_sessions(self, user_id: str) -> List[Session]:
        """Get all sessions for a user."""
        session_ids = self._sessions_by_user.get(user_id, [])
        sessions = []
        
        for session_id in session_ids:
            session = self.get_session(session_id)
            if session:
                sessions.append(session)
                
        return sessions
        
    def revoke_session(self, session_id: str) -> bool:
        """Revoke a session."""
        session = self._sessions.pop(session_id, None)
        
        if session:
            # Remove from user's session list
            user_sessions = self._sessions_by_user.get(session.user_id, [])
            if session_id in user_sessions:
                user_sessions.remove(session_id)
                
            # Remove refresh token
            if session.refresh_token_hash:
                self._refresh_tokens.pop(session.refresh_token_hash, None)
                
            return True
            
        return False
        
    def revoke_user_sessions(self, user_id: str) -> int:
        """Revoke all sessions for a user."""
        session_ids = list(self._sessions_by_user.get(user_id, []))
        count = 0
        
        for session_id in session_ids:
            if self.revoke_session(session_id):
                count += 1
                
        return count
        
    def revoke_all_sessions(self) -> int:
        """Revoke all sessions."""
        count = len(self._sessions)
        self._sessions.clear()
        self._sessions_by_user.clear()
        self._refresh_tokens.clear()
        return count
        
    def store_refresh_token(self, session_id: str, refresh_token: str) -> None:
        """Store a refresh token for a session."""
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        session = self._sessions.get(session_id)
        if session:
            session.refresh_token_hash = token_hash
            self._refresh_tokens[token_hash] = session_id
            
    def verify_refresh_token(self, refresh_token: str) -> Optional[Session]:
        """Verify a refresh token and return associated session."""
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        session_id = self._refresh_tokens.get(token_hash)
        
        if not session_id:
            return None
            
        return self.get_session(session_id)
        
    def create_session_tokens(
        self,
        username: str,
        password: str,
        remember_me: bool = False,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Authenticate and return tokens.
        
        Returns:
            Dict with access_token, refresh_token, expires_in, user
        """
        session = self.authenticate(
            username, password, remember_me, ip_address, user_agent
        )
        
        if not session:
            return None
            
        access_token, refresh_token, expires_in = self._jwt_manager.generate_tokens(
            session.user_id,
            session.role,
            session.id
        )
        
        self.store_refresh_token(session.id, refresh_token)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": expires_in,
            "user": {
                "id": session.user_id,
                "username": session.username,
                "role": session.role
            }
        }
        
    def refresh_tokens(self, refresh_token: str) -> Optional[Dict]:
        """Refresh tokens using a refresh token."""
        session = self.verify_refresh_token(refresh_token)
        
        if not session:
            return None
            
        access_token, new_refresh_token, expires_in = self._jwt_manager.generate_tokens(
            session.user_id,
            session.role,
            session.id
        )
        
        self.store_refresh_token(session.id, new_refresh_token)
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "expires_in": expires_in,
            "user": {
                "id": session.user_id,
                "username": session.username,
                "role": session.role
            }
        }
        
    def get_user(self, user_id: str) -> Optional[User]:
        """Get a user by ID."""
        return self._users.get(user_id)
        
    def get_stats(self) -> Dict:
        """Get session statistics."""
        return {
            "total_sessions": len(self._sessions),
            "total_users": len(self._users),
            "active_sessions": sum(
                1 for s in self._sessions.values()
                if s.expires_at > datetime.utcnow()
            )
        }


# Global session manager instance
_session_manager: Optional[SessionManager] = None


def get_session_manager() -> SessionManager:
    """Get the global session manager."""
    global _session_manager
    if _session_manager is None:
        _session_manager = SessionManager()
    return _session_manager
