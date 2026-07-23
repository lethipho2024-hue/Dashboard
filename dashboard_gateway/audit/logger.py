"""
Audit Logger
============
Security audit logging.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import deque
import uuid


@dataclass
class AuditEntry:
    """Audit log entry."""
    id: str
    timestamp: datetime
    event: str
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None
    resource: Optional[str] = None
    action: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    success: bool = True
    error_message: Optional[str] = None


class AuditLogger:
    """
    Security audit logger.
    
    Logs:
    - Login attempts
    - Logout
    - Command executions
    - Permission denials
    - License operations
    - Session events
    - Framework shutdown/restart
    """
    
    # Event types
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    SESSION_CREATED = "session_created"
    SESSION_EXPIRED = "session_expired"
    SESSION_REVOKED = "session_revoked"
    
    PERMISSION_DENIED = "permission_denied"
    COMMAND_EXECUTED = "command_executed"
    COMMAND_FAILED = "command_failed"
    COMMAND_CANCELLED = "command_cancelled"
    
    LICENSE_ACTIVATED = "license_activated"
    LICENSE_DEACTIVATED = "license_deactivated"
    LICENSE_REFRESHED = "license_refreshed"
    LICENSE_VALIDATION_FAILED = "license_validation_failed"
    
    FRAMEWORK_SHUTDOWN = "framework_shutdown"
    FRAMEWORK_RESTART = "framework_restart"
    
    ROLE_CHANGED = "role_changed"
    USER_CREATED = "user_created"
    USER_DELETED = "user_deleted"
    
    def __init__(self, max_entries: int = 10000):
        self._entries: deque = deque(maxlen=max_entries)
        self._index: Dict[str, List[int]] = {}  # event -> [indices]
        
    def log(
        self,
        event: str,
        user_id: Optional[str] = None,
        username: Optional[str] = None,
        role: Optional[str] = None,
        resource: Optional[str] = None,
        action: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> AuditEntry:
        """
        Log an audit event.
        
        Args:
            event: Event type
            user_id: User ID
            username: Username
            role: User role
            resource: Resource affected
            action: Action performed
            details: Additional details
            ip_address: Client IP
            user_agent: Client user agent
            success: Whether operation succeeded
            error_message: Error message if failed
            
        Returns:
            Created AuditEntry
        """
        entry = AuditEntry(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            event=event,
            user_id=user_id,
            username=username,
            role=role,
            resource=resource,
            action=action,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_message=error_message
        )
        
        self._entries.append(entry)
        
        # Index by event
        if event not in self._index:
            self._index[event] = []
        self._index[event].append(len(self._entries) - 1)
        
        return entry
        
    def log_login(
        self,
        username: str,
        success: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> AuditEntry:
        """Log a login attempt."""
        event = self.LOGIN_SUCCESS if success else self.LOGIN_FAILED
        return self.log(
            event=event,
            username=username,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_message=error_message
        )
        
    def log_logout(
        self,
        user_id: str,
        username: str,
        ip_address: Optional[str] = None
    ) -> AuditEntry:
        """Log a logout."""
        return self.log(
            event=self.LOGOUT,
            user_id=user_id,
            username=username,
            ip_address=ip_address
        )
        
    def log_command(
        self,
        user_id: str,
        username: str,
        command: str,
        success: bool,
        error_message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditEntry:
        """Log a command execution."""
        event = self.COMMAND_EXECUTED if success else self.COMMAND_FAILED
        return self.log(
            event=event,
            user_id=user_id,
            username=username,
            resource="command",
            action=command,
            success=success,
            error_message=error_message,
            details=details or {}
        )
        
    def log_permission_denied(
        self,
        user_id: str,
        username: str,
        resource: str,
        action: str,
        required_role: str
    ) -> AuditEntry:
        """Log a permission denial."""
        return self.log(
            event=self.PERMISSION_DENIED,
            user_id=user_id,
            username=username,
            resource=resource,
            action=action,
            success=False,
            details={"required_role": required_role}
        )
        
    def log_license(
        self,
        event: str,
        user_id: str,
        username: str,
        license_id: str,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> AuditEntry:
        """Log a license operation."""
        return self.log(
            event=event,
            user_id=user_id,
            username=username,
            resource="license",
            action=license_id,
            success=success,
            error_message=error_message
        )
        
    def get_entries(
        self,
        event: Optional[str] = None,
        user_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[AuditEntry]:
        """Get audit entries with filters."""
        entries = list(self._entries)
        
        # Filter by event
        if event:
            indices = self._index.get(event, [])
            entries = [entries[i] for i in indices if i < len(entries)]
            
        # Filter by user
        if user_id:
            entries = [e for e in entries if e.user_id == user_id]
            
        # Filter by date range
        if start_date:
            entries = [e for e in entries if e.timestamp >= start_date]
        if end_date:
            entries = [e for e in entries if e.timestamp <= end_date]
            
        # Sort by timestamp descending
        entries.sort(key=lambda e: e.timestamp, reverse=True)
        
        # Limit
        return entries[:limit]
        
    def get_recent(self, limit: int = 50) -> List[AuditEntry]:
        """Get recent audit entries."""
        return list(self._entries)[-limit:]
        
    def get_stats(self) -> Dict[str, Any]:
        """Get audit statistics."""
        total = len(self._entries)
        
        # Count by event type
        event_counts: Dict[str, int] = {}
        for entry in self._entries:
            event_counts[entry.event] = event_counts.get(entry.event, 0) + 1
            
        # Count by success/failure
        success_count = sum(1 for e in self._entries if e.success)
        failure_count = total - success_count
        
        # Recent activity (last 24 hours)
        cutoff = datetime.utcnow() - timedelta(hours=24)
        recent = sum(1 for e in self._entries if e.timestamp >= cutoff)
        
        return {
            "total_entries": total,
            "success_count": success_count,
            "failure_count": failure_count,
            "recent_24h": recent,
            "event_counts": event_counts,
            "indexed_events": list(self._index.keys())
        }
        
    def to_dict(self, entry: AuditEntry) -> Dict[str, Any]:
        """Convert entry to dictionary."""
        return {
            "id": entry.id,
            "timestamp": entry.timestamp.isoformat(),
            "event": entry.event,
            "user_id": entry.user_id,
            "username": entry.username,
            "role": entry.role,
            "resource": entry.resource,
            "action": entry.action,
            "details": entry.details,
            "ip_address": entry.ip_address,
            "user_agent": entry.user_agent,
            "success": entry.success,
            "error_message": entry.error_message
        }


# Global audit logger instance
_audit_logger: Optional[AuditLogger] = None


def get_audit_logger() -> AuditLogger:
    """Get the global audit logger."""
    global _audit_logger
    if _audit_logger is None:
        _audit_logger = AuditLogger()
    return _audit_logger
