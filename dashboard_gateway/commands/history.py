"""
Command History
===============
Stores command execution history.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, field, asdict
from collections import deque
import json

from .schemas import (
    ExecutionHistoryItem, 
    CommandStatus, 
    PermissionLevel,
    CommandResponseSchema
)


@dataclass
class HistoryEntry:
    """Command history entry."""
    request_id: str
    command: str
    arguments: Dict[str, Any]
    sender: str
    permission_level: PermissionLevel
    status: CommandStatus
    execution_time: float
    queued_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    message: str = ""
    error_code: Optional[str] = None
    response: Optional[Dict[str, Any]] = None
    
    def to_history_item(self) -> ExecutionHistoryItem:
        """Convert to ExecutionHistoryItem."""
        return ExecutionHistoryItem(
            request_id=self.request_id,
            command=self.command,
            arguments=self.arguments,
            sender=self.sender,
            permission_level=self.permission_level,
            status=self.status,
            execution_time=self.execution_time,
            queued_at=self.queued_at,
            started_at=self.started_at,
            completed_at=self.completed_at,
            message=self.message,
            error_code=self.error_code,
            response=self.response
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "request_id": self.request_id,
            "command": self.command,
            "arguments": self.arguments,
            "sender": self.sender,
            "permission_level": self.permission_level.value,
            "status": self.status.value,
            "execution_time": self.execution_time,
            "queued_at": self.queued_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "message": self.message,
            "error_code": self.error_code,
            "response": self.response
        }


class CommandHistory:
    """
    Command execution history.
    
    Stores command executions for audit trail and debugging.
    """
    
    def __init__(self, max_entries: int = 1000):
        self._history: deque = deque(maxlen=max_entries)
        self._max_entries = max_entries
        self._index: Dict[str, HistoryEntry] = {}  # request_id -> entry
        
    def add(
        self,
        request_id: str,
        command: str,
        arguments: Dict[str, Any],
        sender: str,
        permission_level: PermissionLevel
    ) -> HistoryEntry:
        """Add a new history entry."""
        entry = HistoryEntry(
            request_id=request_id,
            command=command,
            arguments=arguments,
            sender=sender,
            permission_level=permission_level,
            status=CommandStatus.QUEUED,
            execution_time=0.0,
            queued_at=datetime.utcnow()
        )
        
        self._history.append(entry)
        self._index[request_id] = entry
        
        return entry
        
    def start_execution(self, request_id: str) -> Optional[HistoryEntry]:
        """Mark command as started."""
        entry = self._index.get(request_id)
        if entry:
            entry.status = CommandStatus.EXECUTING
            entry.started_at = datetime.utcnow()
        return entry
        
    def complete(
        self,
        request_id: str,
        status: CommandStatus,
        execution_time: float,
        message: str,
        response: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None
    ) -> Optional[HistoryEntry]:
        """Mark command as completed."""
        entry = self._index.get(request_id)
        if entry:
            entry.status = status
            entry.execution_time = execution_time
            entry.completed_at = datetime.utcnow()
            entry.message = message
            entry.response = response
            entry.error_code = error_code
        return entry
        
    def get(self, request_id: str) -> Optional[HistoryEntry]:
        """Get a history entry by request ID."""
        return self._index.get(request_id)
        
    def get_recent(self, limit: int = 50) -> List[HistoryEntry]:
        """Get recent history entries."""
        return list(self._history)[-limit:]
        
    def get_all(self) -> List[HistoryEntry]:
        """Get all history entries."""
        return list(self._history)
        
    def get_by_status(self, status: CommandStatus) -> List[HistoryEntry]:
        """Get entries by status."""
        return [e for e in self._history if e.status == status]
        
    def get_by_command(self, command: str) -> List[HistoryEntry]:
        """Get entries by command name."""
        return [e for e in self._history if e.command == command]
        
    def get_by_sender(self, sender: str) -> List[HistoryEntry]:
        """Get entries by sender."""
        return [e for e in self._history if e.sender == sender]
        
    def get_in_timerange(
        self, 
        start: datetime, 
        end: Optional[datetime] = None
    ) -> List[HistoryEntry]:
        """Get entries in a time range."""
        if end is None:
            end = datetime.utcnow()
            
        return [
            e for e in self._history 
            if start <= e.queued_at <= end
        ]
        
    def get_stats(self) -> Dict[str, Any]:
        """Get history statistics."""
        total = len(self._history)
        completed = len([e for e in self._history if e.status == CommandStatus.COMPLETED])
        failed = len([e for e in self._history if e.status == CommandStatus.FAILED])
        executing = len([e for e in self._history if e.status == CommandStatus.EXECUTING])
        queued = len([e for e in self._history if e.status == CommandStatus.QUEUED])
        
        # Calculate success rate
        finished = completed + failed
        success_rate = (completed / finished * 100) if finished > 0 else 0
        
        # Average execution time
        executed = [e for e in self._history if e.execution_time > 0]
        avg_time = sum(e.execution_time for e in executed) / len(executed) if executed else 0
        
        # Most used commands
        command_counts: Dict[str, int] = {}
        for e in self._history:
            command_counts[e.command] = command_counts.get(e.command, 0) + 1
            
        return {
            "total_commands": total,
            "completed": completed,
            "failed": failed,
            "executing": executing,
            "queued": queued,
            "success_rate": round(success_rate, 2),
            "average_execution_time": round(avg_time, 4),
            "most_used_commands": sorted(
                command_counts.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:10]
        }
        
    def clear(self) -> None:
        """Clear all history."""
        self._history.clear()
        self._index.clear()
        
    def to_json(self) -> str:
        """Export history as JSON."""
        return json.dumps([e.to_dict() for e in self._history], indent=2)
        
    @property
    def count(self) -> int:
        """Get total entry count."""
        return len(self._history)


# Global history instance
_history: Optional[CommandHistory] = None


def get_history() -> CommandHistory:
    """Get the global command history."""
    global _history
    if _history is None:
        _history = CommandHistory()
    return _history
