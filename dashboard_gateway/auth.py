"""
Authentication
============
Authentication handlers for Dashboard Gateway.
Supports License Key, Session Token, and API Key authentication.
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from enum import Enum

from .logger import get_logger
from .license import LicenseValidator, LicenseInfo


class AuthMethod(Enum):
    """Authentication methods."""
    LICENSE_KEY = "license_key"
    SESSION_TOKEN = "session_token"
    API_KEY = "api_key"
    NONE = "none"


class AuthStatus(Enum):
    """Authentication status."""
    AUTHENTICATED = "authenticated"
    PENDING = "pending"
    FAILED = "failed"
    EXPIRED = "expired"


@dataclass
class AuthSession:
    """Authentication session."""
    session_id: str
    auth_method: AuthMethod
    client_id: str
    license_info: Optional[LicenseInfo] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_activity: datetime = field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def is_expired(self) -> bool:
        """Check if session is expired."""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self) -> bool:
        """Check if session is valid."""
        if self.is_expired():
            return False
        return True
    
    def touch(self):
        """Update last activity."""
        self.last_activity = datetime.utcnow()


class AuthManager:
    """Manages authentication and sessions."""
    
    def __init__(self, config, license_validator: LicenseValidator):
        self.config = config
        self.license_validator = license_validator
        self.logger = get_logger("auth")
        self._sessions: Dict[str, AuthSession] = {}
        self._api_keys: Dict[str, AuthSession] = {}
        
        # Load API keys from config
        for key in config.api_keys:
            self._register_api_key(key)
    
    def _generate_session_id(self) -> str:
        """Generate a unique session ID."""
        return secrets.token_urlsafe(32)
    
    def _generate_token(self) -> str:
        """Generate an authentication token."""
        return secrets.token_urlsafe(48)
    
    def _register_api_key(self, api_key: str):
        """Register an API key."""
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        self._api_keys[key_hash] = None  # API key without session
    
    def authenticate_license_key(self, license_key: str, ip_address: Optional[str] = None) -> Optional[AuthSession]:
        """Authenticate using a license key."""
        self.logger.info(f"Authenticating with license key: {license_key[:8]}...")
        
        try:
            license_info = self.license_validator.activate(license_key)
            
            session_id = self._generate_session_id()
            session = AuthSession(
                session_id=session_id,
                auth_method=AuthMethod.LICENSE_KEY,
                client_id=license_key[:16],  # Use key prefix as client ID
                license_info=license_info,
                expires_at=license_info.expires_at,
                ip_address=ip_address,
            )
            
            self._sessions[session_id] = session
            self.logger.info(f"License authentication successful: {session_id}")
            
            return session
            
        except ValueError as e:
            self.logger.error(f"License authentication failed: {e}")
            return None
    
    def authenticate_api_key(self, api_key: str, ip_address: Optional[str] = None) -> Optional[AuthSession]:
        """Authenticate using an API key."""
        self.logger.info(f"Authenticating with API key: {api_key[:8]}...")
        
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        if key_hash not in self._api_keys:
            self.logger.warning("Invalid API key")
            return None
        
        session_id = self._generate_session_id()
        session = AuthSession(
            session_id=session_id,
            auth_method=AuthMethod.API_KEY,
            client_id=f"api_{session_id[:8]}",
            license_info=self.license_validator.get_default_license(),
            expires_at=datetime.utcnow() + timedelta(hours=self.config.session_timeout),
            ip_address=ip_address,
        )
        
        self._sessions[session_id] = session
        self.logger.info(f"API key authentication successful: {session_id}")
        
        return session
    
    def authenticate_session(self, session_token: str, ip_address: Optional[str] = None) -> Optional[AuthSession]:
        """Authenticate or refresh an existing session."""
        if session_token in self._sessions:
            session = self._sessions[session_token]
            
            if session.is_valid():
                session.touch()
                self.logger.debug(f"Session refreshed: {session_token}")
                return session
            else:
                self.logger.warning(f"Session expired: {session_token}")
                del self._sessions[session_token]
                return None
        
        return None
    
    def validate_session(self, session_id: str) -> Optional[AuthSession]:
        """Validate a session."""
        session = self._sessions.get(session_id)
        
        if session is None:
            return None
        
        if not session.is_valid():
            self.logger.warning(f"Session expired: {session_id}")
            del self._sessions[session_id]
            return None
        
        session.touch()
        return session
    
    def revoke_session(self, session_id: str) -> bool:
        """Revoke a session."""
        if session_id in self._sessions:
            del self._sessions[session_id]
            self.logger.info(f"Session revoked: {session_id}")
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Remove expired sessions."""
        expired = [
            sid for sid, session in self._sessions.items()
            if session.is_expired()
        ]
        
        for sid in expired:
            del self._sessions[sid]
        
        if expired:
            self.logger.info(f"Cleaned up {len(expired)} expired sessions")
        
        return len(expired)
    
    def get_session_count(self) -> int:
        """Get number of active sessions."""
        return len([s for s in self._sessions.values() if s.is_valid()])
    
    def get_all_sessions(self) -> Dict[str, AuthSession]:
        """Get all valid sessions."""
        return {
            sid: session 
            for sid, session in self._sessions.items() 
            if session.is_valid()
        }
