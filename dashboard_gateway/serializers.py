"""
Event Serializers
=================
Serialize framework events into lightweight JSON payloads.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass, asdict, field
from enum import Enum


class EventType(Enum):
    """Event types for serialization."""
    # Framework events
    FRAMEWORK_STARTED = "framework_started"
    FRAMEWORK_STOPPED = "framework_stopped"
    FRAMEWORK_ERROR = "framework_error"
    
    # Kernel events
    KERNEL_STARTED = "kernel_started"
    KERNEL_STOPPED = "kernel_stopped"
    KERNEL_TICK = "kernel_tick"
    KERNEL_STAGE_CHANGED = "kernel_stage_changed"
    
    # Training events
    EPISODE_STARTED = "episode_started"
    EPISODE_FINISHED = "episode_finished"
    TRAINING_STARTED = "training_started"
    TRAINING_STOPPED = "training_stopped"
    
    # Metrics events
    METRICS_UPDATE = "metrics_update"
    REWARD_GENERATED = "reward_generated"
    
    # Health events
    HEALTH_WARNING = "health_warning"
    HEALTH_ERROR = "health_error"
    HEALTH_RESTORED = "health_restored"
    
    # Module events
    MODULE_LOADED = "module_loaded"
    MODULE_UNLOADED = "module_unloaded"
    MODULE_ERROR = "module_error"
    
    # Plugin events
    PLUGIN_LOADED = "plugin_loaded"
    PLUGIN_UNLOADED = "plugin_unloaded"
    PLUGIN_ERROR = "plugin_error"
    
    # Replay events
    REPLAY_STARTED = "replay_started"
    REPLAY_STOPPED = "replay_stopped"
    REPLAY_SAVED = "replay_saved"
    CHECKPOINT_SAVED = "checkpoint_saved"
    
    # AI events
    MODEL_LOADED = "model_loaded"
    MODEL_UNLOADED = "model_unloaded"
    INFERENCE_COMPLETED = "inference_completed"
    
    # General
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    DEBUG = "debug"


class EventLevel(Enum):
    """Event severity levels."""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class SerializedEvent:
    """A serialized event ready for transmission."""
    id: str
    type: str
    level: str
    timestamp: str
    source: str
    message: str
    data: Dict[str, Any] = field(default_factory=dict)
    channel: str = "events"
    
    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps(asdict(self))
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SerializedEvent":
        """Create from dictionary."""
        return cls(**data)


@dataclass  
class FrameworkStatus:
    """Framework status data."""
    running: bool
    version: str
    uptime_seconds: float
    active_sessions: int
    total_sessions: int
    framework_type: str = "ZBGym"
    pid: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class KernelStatus:
    """Kernel status data."""
    running: bool
    current_tick: int
    tick_rate: float
    current_stage: str
    scheduler_queue_size: int
    runtime_status: str
    uptime_seconds: float = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class MetricsSnapshot:
    """Metrics snapshot data."""
    fps: float
    tick_time_ms: float
    cpu_usage_percent: float
    memory_usage_mb: float
    gpu_usage_percent: float = 0
    vram_usage_mb: float = 0
    latency_ms: float = 0
    inference_time_ms: float = 0
    network_usage_mbps: float = 0
    reward_rate: float = 0
    episode_count: int = 0
    replay_size_mb: float = 0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class HealthStatus:
    """Health status data."""
    health_score: int  # 0-100
    module_status: Dict[str, str]
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    crash_count: int = 0
    temperature_celsius: Optional[float] = None
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ReplayStatus:
    """Replay status data."""
    recording: bool
    replay_size_mb: float
    current_replay: Optional[str] = None
    replay_queue_size: int = 0
    disk_usage_percent: float = 0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AIStatus:
    """AI/Model status data."""
    loaded_models: List[str] = field(default_factory=list)
    active_models: List[str] = field(default_factory=list)
    inference_queue_size: int = 0
    current_requests: int = 0
    vram_allocation_mb: float = 0
    token_throughput: float = 0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class EventSerializer:
    """Serializes framework events into JSON payloads."""
    
    _event_counter = 0
    
    @classmethod
    def serialize(
        cls,
        event_type: Union[str, EventType],
        level: Union[str, EventLevel],
        source: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        channel: str = "events"
    ) -> SerializedEvent:
        """Serialize an event."""
        cls._event_counter += 1
        
        # Convert enums to strings
        if isinstance(event_type, EventType):
            event_type = event_type.value
        if isinstance(level, EventLevel):
            level = level.value
            
        return SerializedEvent(
            id=f"evt_{cls._event_counter}_{datetime.utcnow().timestamp():.0f}",
            type=event_type,
            level=level,
            timestamp=datetime.utcnow().isoformat(),
            source=source,
            message=message,
            data=data or {},
            channel=channel
        )
    
    @classmethod
    def serialize_framework_status(cls, status: FrameworkStatus) -> Dict[str, Any]:
        """Serialize framework status."""
        return {
            "channel": "framework",
            "type": "status_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": status.to_dict()
        }
    
    @classmethod
    def serialize_kernel_status(cls, status: KernelStatus) -> Dict[str, Any]:
        """Serialize kernel status."""
        return {
            "channel": "kernel", 
            "type": "status_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": status.to_dict()
        }
    
    @classmethod
    def serialize_metrics(cls, metrics: MetricsSnapshot) -> Dict[str, Any]:
        """Serialize metrics snapshot."""
        return {
            "channel": "metrics",
            "type": "metrics_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": metrics.to_dict()
        }
    
    @classmethod
    def serialize_health(cls, health: HealthStatus) -> Dict[str, Any]:
        """Serialize health status."""
        return {
            "channel": "health",
            "type": "health_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": health.to_dict()
        }
    
    @classmethod
    def serialize_replay(cls, replay: ReplayStatus) -> Dict[str, Any]:
        """Serialize replay status."""
        return {
            "channel": "replay",
            "type": "replay_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": replay.to_dict()
        }
    
    @classmethod
    def serialize_ai_status(cls, ai_status: AIStatus) -> Dict[str, Any]:
        """Serialize AI status."""
        return {
            "channel": "ai",
            "type": "ai_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": ai_status.to_dict()
        }
    
    @classmethod
    def serialize_batch(cls, events: List[SerializedEvent]) -> str:
        """Serialize multiple events into a batch."""
        return json.dumps({
            "type": "batch",
            "timestamp": datetime.utcnow().isoformat(),
            "count": len(events),
            "events": [e.to_dict() for e in events]
        })
