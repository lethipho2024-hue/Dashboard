"""
Runtime Integration
=================
Integration with ZBGym RuntimeContext.
"""

from typing import Optional, Dict, Any, Callable, List
from dataclasses import dataclass, field
from datetime import datetime
import asyncio

from .logger import get_logger
from .serializers import FrameworkStatus, EventSerializer, EventLevel, EventType


class RuntimeIntegrator:
    """
    Integrates with ZBGym RuntimeContext.
    
    This class provides an interface to:
    - Get framework status
    - Subscribe to framework events
    - Monitor runtime health
    
    WITHOUT modifying the RuntimeContext architecture.
    """
    
    def __init__(self, config, channel_manager):
        self.config = config
        self.channel_manager = channel_manager
        self.logger = get_logger("runtime")
        
        # Framework state (would be populated from actual RuntimeContext)
        self._running = False
        self._version = "1.0.0"
        self._framework_type = "ZBGym"
        self._pid: Optional[int] = None
        self._start_time: Optional[datetime] = None
        self._total_sessions = 0
        self._active_sessions = 0
        
        # Event callbacks
        self._event_callbacks: List[Callable] = []
        
        self.logger.info("RuntimeIntegrator initialized")
    
    def is_connected(self) -> bool:
        """Check if framework is connected."""
        return self._running
    
    def get_framework_status(self) -> FrameworkStatus:
        """Get current framework status."""
        uptime = 0
        if self._start_time:
            uptime = (datetime.utcnow() - self._start_time).total_seconds()
        
        return FrameworkStatus(
            running=self._running,
            version=self._version,
            uptime_seconds=uptime,
            active_sessions=self._active_sessions,
            total_sessions=self._total_sessions,
            framework_type=self._framework_type,
            pid=self._pid,
        )
    
    async def update_status(self, **kwargs):
        """Update framework status from RuntimeContext data."""
        if "running" in kwargs:
            was_running = self._running
            self._running = kwargs["running"]
            
            # Detect state changes
            if self._running and not was_running:
                self._start_time = datetime.utcnow()
                await self._emit_event(
                    EventType.FRAMEWORK_STARTED,
                    EventLevel.INFO,
                    "Framework",
                    f"{self._framework_type} framework started"
                )
            elif not self._running and was_running:
                await self._emit_event(
                    EventType.FRAMEWORK_STOPPED,
                    EventLevel.INFO,
                    "Framework",
                    f"{self._framework_type} framework stopped"
                )
        
        if "version" in kwargs:
            self._version = kwargs["version"]
        if "pid" in kwargs:
            self._pid = kwargs["pid"]
        if "total_sessions" in kwargs:
            self._total_sessions = kwargs["total_sessions"]
        if "active_sessions" in kwargs:
            self._active_sessions = kwargs["active_sessions"]
        
        # Broadcast updated status
        await self._broadcast_framework_status()
    
    async def _broadcast_framework_status(self):
        """Broadcast framework status to subscribers."""
        status = self.get_framework_status()
        payload = EventSerializer.serialize_framework_status(status)
        
        from .channels import ChannelMessage
        message = ChannelMessage(
            channel="framework",
            type="status_update",
            data=payload["data"],
            timestamp=datetime.utcnow().isoformat(),
        )
        
        await self.channel_manager.publish("framework", message)
    
    async def _emit_event(self, event_type: EventType, level: EventLevel, source: str, message: str, data: Optional[Dict] = None):
        """Emit an event."""
        event = EventSerializer.serialize(
            event_type=event_type,
            level=level,
            source=source,
            message=message,
            data=data or {},
        )
        
        # Call registered callbacks
        for callback in self._event_callbacks:
            try:
                await callback(event)
            except Exception as e:
                self.logger.error(f"Event callback error: {e}")
        
        # Publish to events channel
        from .channels import ChannelMessage
        message = ChannelMessage(
            channel="events",
            type=event.type,
            data=event.to_dict(),
            timestamp=event.timestamp,
        )
        
        await self.channel_manager.publish("events", message)
    
    def register_event_callback(self, callback: Callable):
        """Register a callback for framework events."""
        self._event_callbacks.append(callback)
    
    def unregister_event_callback(self, callback: Callable):
        """Unregister an event callback."""
        if callback in self._event_callbacks:
            self._event_callbacks.remove(callback)
    
    async def connect(self):
        """Connect to RuntimeContext."""
        self.logger.info("Connecting to RuntimeContext...")
        # In production, this would establish actual connection
        self._running = True
        self._start_time = datetime.utcnow()
        await self._broadcast_framework_status()
    
    async def disconnect(self):
        """Disconnect from RuntimeContext."""
        self.logger.info("Disconnecting from RuntimeContext...")
        self._running = False
        await self._broadcast_framework_status()
    
    def get_info(self) -> Dict[str, Any]:
        """Get runtime info."""
        return {
            "connected": self._running,
            "version": self._version,
            "framework_type": self._framework_type,
            "pid": self._pid,
            "uptime_seconds": (
                (datetime.utcnow() - self._start_time).total_seconds()
                if self._start_time else 0
            ),
        }
