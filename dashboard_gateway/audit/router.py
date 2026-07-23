"""
Audit Router
============
Audit log API endpoints.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, Query

from .logger import AuditLogger, AuditEntry, get_audit_logger
from ..auth.authentication import get_current_user, AuthenticatedUser
from ..auth.permissions import Permission


class AuditRouter:
    """
    Audit router.
    
    Provides endpoints for:
    - Get audit logs
    - Get audit history
    - Get audit stats
    """
    
    def __init__(self, audit_logger: Optional[AuditLogger] = None):
        self._logger = audit_logger or get_audit_logger()
        
    async def get_logs(
        self,
        user: AuthenticatedUser = Depends(get_current_user),
        event: Optional[str] = None,
        user_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = Query(default=100, le=1000)
    ) -> Dict[str, Any]:
        """
        Get audit logs.
        
        GET /audit/logs
        """
        # Parse dates
        start = datetime.fromisoformat(start_date) if start_date else None
        end = datetime.fromisoformat(end_date) if end_date else None
        
        entries = self._logger.get_entries(
            event=event,
            user_id=user_id,
            start_date=start,
            end_date=end,
            limit=limit
        )
        
        return {
            "success": True,
            "logs": [self._logger.to_dict(e) for e in entries],
            "total": len(entries)
        }
        
    async def get_history(
        self,
        user: AuthenticatedUser = Depends(get_current_user),
        limit: int = Query(default=100, le=500)
    ) -> Dict[str, Any]:
        """
        Get current user's audit history.
        
        GET /audit/history
        """
        entries = self._logger.get_entries(
            user_id=user.user_id,
            limit=limit
        )
        
        return {
            "success": True,
            "history": [self._logger.to_dict(e) for e in entries],
            "total": len(entries)
        }
        
    async def get_stats(
        self,
        user: AuthenticatedUser = Depends(get_current_user)
    ) -> Dict[str, Any]:
        """
        Get audit statistics.
        
        GET /audit/stats
        """
        return self._logger.get_stats()


# Singleton router instance
_audit_router: Optional[AuditRouter] = None


def get_audit_router() -> AuditRouter:
    """Get the global audit router."""
    global _audit_router
    if _audit_router is None:
        _audit_router = AuditRouter()
    return _audit_router
