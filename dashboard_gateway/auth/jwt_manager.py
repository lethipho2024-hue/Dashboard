"""
JWT Manager
==========
JWT token generation and validation.
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
import jwt
from dataclasses import dataclass


@dataclass
class TokenPayload:
    """JWT token payload."""
    sub: str  # User ID
    role: str
    session_id: str
    exp: datetime
    iat: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "sub": self.sub,
            "role": self.role,
            "session_id": self.session_id,
            "exp": self.exp,
            "iat": self.iat,
        }


class JWTManager:
    """
    JWT token manager.
    
    Handles:
    - Token generation
    - Token validation
    - Token refresh
    """
    
    def __init__(
        self,
        secret_key: Optional[str] = None,
        algorithm: str = "HS256",
        access_token_expire_minutes: int = 30,
        refresh_token_expire_days: int = 7
    ):
        self._secret_key = secret_key or os.environ.get(
            "JWT_SECRET_KEY", 
            "dev-secret-key-change-in-production"
        )
        self._algorithm = algorithm
        self._access_token_expire = access_token_expire_minutes
        self._refresh_token_expire = refresh_token_expire_days
        
    def generate_access_token(
        self,
        user_id: str,
        role: str,
        session_id: str
    ) -> str:
        """Generate an access token."""
        now = datetime.utcnow()
        expires = now + timedelta(minutes=self._access_token_expire)
        
        payload = TokenPayload(
            sub=user_id,
            role=role,
            session_id=session_id,
            exp=expires,
            iat=now
        )
        
        return jwt.encode(
            payload.to_dict(),
            self._secret_key,
            algorithm=self._algorithm
        )
        
    def generate_refresh_token(
        self,
        user_id: str,
        session_id: str
    ) -> str:
        """Generate a refresh token."""
        now = datetime.utcnow()
        expires = now + timedelta(days=self._refresh_token_expire)
        
        payload = {
            "sub": user_id,
            "session_id": session_id,
            "type": "refresh",
            "exp": expires,
            "iat": now,
        }
        
        return jwt.encode(
            payload,
            self._secret_key,
            algorithm=self._algorithm
        )
        
    def generate_tokens(
        self,
        user_id: str,
        role: str,
        session_id: str
    ) -> Tuple[str, str, int]:
        """
        Generate both access and refresh tokens.
        
        Returns:
            Tuple of (access_token, refresh_token, expires_in_seconds)
        """
        access_token = self.generate_access_token(user_id, role, session_id)
        refresh_token = self.generate_refresh_token(user_id, session_id)
        expires_in = self._access_token_expire * 60
        
        return access_token, refresh_token, expires_in
        
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode a token.
        
        Returns:
            Decoded payload or None if invalid
        """
        try:
            payload = jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
            
    def verify_access_token(self, token: str) -> Optional[TokenPayload]:
        """Verify an access token."""
        payload = self.verify_token(token)
        if not payload:
            return None
            
        if payload.get("type") == "refresh":
            return None
            
        try:
            return TokenPayload(
                sub=payload["sub"],
                role=payload["role"],
                session_id=payload["session_id"],
                exp=datetime.fromtimestamp(payload["exp"]),
                iat=datetime.fromtimestamp(payload["iat"])
            )
        except (KeyError, ValueError):
            return None
            
    def verify_refresh_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify a refresh token."""
        payload = self.verify_token(token)
        if not payload:
            return None
            
        if payload.get("type") != "refresh":
            return None
            
        return payload
        
    def get_token_expiration(self, token: str) -> Optional[datetime]:
        """Get expiration time of a token."""
        payload = self.verify_token(token)
        if not payload:
            return None
            
        return datetime.fromtimestamp(payload["exp"])
        
    def is_token_expired(self, token: str) -> bool:
        """Check if token is expired."""
        return self.get_token_expiration(token) is None


# Global JWT manager instance
_jwt_manager: Optional[JWTManager] = None


def get_jwt_manager() -> JWTManager:
    """Get the global JWT manager."""
    global _jwt_manager
    if _jwt_manager is None:
        _jwt_manager = JWTManager()
    return _jwt_manager
