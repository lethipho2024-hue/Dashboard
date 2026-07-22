"""
Command Schemas
==============
Pydantic schemas for command validation.
"""

from typing import Optional, Dict, Any, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class PermissionLevel(str, Enum):
    """Permission levels for commands."""
    VIEWER = "viewer"
    OPERATOR = "operator"
    DEVELOPER = "developer"
    ADMINISTRATOR = "administrator"


class CommandCategory(str, Enum):
    """Command categories."""
    KERNEL = "kernel"
    RUNTIME = "runtime"
    TRAINER = "trainer"
    REPLAY = "replay"
    PLUGINS = "plugins"
    LOGS = "logs"
    METRICS = "metrics"
    FRAMEWORK = "framework"


class CommandStatus(str, Enum):
    """Command execution status."""
    QUEUED = "queued"
    PENDING = "pending"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    DENIED = "denied"


class CommandSchema(BaseModel):
    """Command request schema."""
    command: str = Field(..., description="Command name")
    request_id: Optional[str] = Field(None, description="Unique request ID")
    timestamp: Optional[datetime] = Field(None, description="Request timestamp")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Command arguments")
    sender: str = Field("dashboard", description="Command sender identifier")
    permission_level: PermissionLevel = Field(PermissionLevel.OPERATOR, description="Required permission")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class CommandResponseSchema(BaseModel):
    """Command response schema."""
    success: bool = Field(..., description="Whether command succeeded")
    request_id: str = Field(..., description="Request ID")
    command: str = Field(..., description="Command name")
    execution_time: float = Field(..., description="Execution time in seconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message: str = Field(..., description="Response message")
    payload: Optional[Dict[str, Any]] = Field(None, description="Response payload")
    error_code: Optional[str] = Field(None, description="Error code if failed")
    traceback: Optional[str] = Field(None, description="Traceback (dev mode only)")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class CommandInfo(BaseModel):
    """Command information schema."""
    name: str = Field(..., description="Command name")
    category: CommandCategory = Field(..., description="Command category")
    description: str = Field(..., description="Command description")
    permission_level: PermissionLevel = Field(..., description="Required permission")
    arguments_schema: Optional[Dict[str, Any]] = Field(None, description="Arguments JSON schema")
    aliases: List[str] = Field(default_factory=list, description="Command aliases")
    version: str = Field("1.0.0", description="Command version")
    is_destructive: bool = Field(False, description="Whether command is destructive")
    requires_framework: bool = Field(True, description="Whether framework must be running")


class CommandQueueItem(BaseModel):
    """Command queue item schema."""
    request_id: str = Field(..., description="Request ID")
    command: str = Field(..., description="Command name")
    arguments: Dict[str, Any] = Field(default_factory=dict)
    status: CommandStatus = Field(..., description="Queue status")
    queued_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = Field(None)
    completed_at: Optional[datetime] = Field(None)
    sender: str = Field("dashboard")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ExecutionHistoryItem(BaseModel):
    """Execution history item schema."""
    request_id: str = Field(..., description="Request ID")
    command: str = Field(..., description="Command name")
    arguments: Dict[str, Any] = Field(default_factory=dict)
    sender: str = Field(..., description="Command sender")
    permission_level: PermissionLevel = Field(..., description="Permission level used")
    status: CommandStatus = Field(..., description="Execution status")
    execution_time: float = Field(..., description="Execution time in seconds")
    queued_at: datetime = Field(..., description="When queued")
    started_at: Optional[datetime] = Field(None)
    completed_at: Optional[datetime] = Field(None)
    message: str = Field(..., description="Result message")
    error_code: Optional[str] = Field(None)
    response: Optional[Dict[str, Any]] = Field(None)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ValidationResult(BaseModel):
    """Command validation result."""
    valid: bool = Field(..., description="Whether command is valid")
    errors: List[str] = Field(default_factory=list, description="Validation errors")
    warnings: List[str] = Field(default_factory=list, description="Validation warnings")
    command_info: Optional[CommandInfo] = Field(None, description="Command info if valid")


# Command argument schemas for specific commands
COMMAND_SCHEMAS: Dict[str, Dict[str, Any]] = {
    "start_kernel": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "stop_kernel": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "restart_kernel": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "pause_kernel": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "resume_kernel": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "reload_runtime": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "reset_runtime": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "runtime_snapshot": {
        "type": "object",
        "properties": {
            "include_modules": {"type": "boolean", "default": True},
            "include_state": {"type": "boolean", "default": True}
        },
        "required": []
    },
    "start_training": {
        "type": "object",
        "properties": {
            "env_id": {"type": "string"},
            "algorithm": {"type": "string"},
            "config": {"type": "object", "default": {}}
        },
        "required": ["env_id", "algorithm"]
    },
    "pause_training": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "resume_training": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "stop_training": {
        "type": "object",
        "properties": {
            "save_checkpoint": {"type": "boolean", "default": True}
        },
        "required": []
    },
    "save_checkpoint": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "path": {"type": "string"}
        },
        "required": ["name"]
    },
    "load_checkpoint": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "path": {"type": "string"}
        },
        "required": ["name"]
    },
    "start_recording": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "stop_recording": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "save_replay": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "path": {"type": "string"}
        },
        "required": ["name"]
    },
    "clear_replay_queue": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "load_plugin": {
        "type": "object",
        "properties": {
            "plugin_id": {"type": "string"},
            "config": {"type": "object", "default": {}}
        },
        "required": ["plugin_id"]
    },
    "unload_plugin": {
        "type": "object",
        "properties": {
            "plugin_id": {"type": "string"}
        },
        "required": ["plugin_id"]
    },
    "reload_plugin": {
        "type": "object",
        "properties": {
            "plugin_id": {"type": "string"}
        },
        "required": ["plugin_id"]
    },
    "enable_plugin": {
        "type": "object",
        "properties": {
            "plugin_id": {"type": "string"}
        },
        "required": ["plugin_id"]
    },
    "disable_plugin": {
        "type": "object",
        "properties": {
            "plugin_id": {"type": "string"}
        },
        "required": ["plugin_id"]
    },
    "clear_logs": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "export_logs": {
        "type": "object",
        "properties": {
            "format": {"type": "string", "enum": ["json", "csv", "txt"], "default": "json"},
            "path": {"type": "string"}
        },
        "required": []
    },
    "reset_metrics": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "export_metrics": {
        "type": "object",
        "properties": {
            "format": {"type": "string", "enum": ["json", "csv"], "default": "json"},
            "path": {"type": "string"}
        },
        "required": []
    },
    "framework_shutdown": {
        "type": "object",
        "properties": {
            "force": {"type": "boolean", "default": False}
        },
        "required": []
    },
    "framework_restart": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "framework_snapshot": {
        "type": "object",
        "properties": {
            "include_state": {"type": "boolean", "default": True}
        },
        "required": []
    }
}
