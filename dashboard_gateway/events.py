"""
Event Integration
===============
Integration with ZBGym EventDispatcher.
"""

from typing import Optional, Dict, Any, Callable, List
from datetime import datetime

from .logger import get_logger
from .serializers import EventSerializer, EventLevel, EventType, SerializedEvent


class EventIntegrator:
    """
    Integrates with ZBGym EventDispatcher.
    
    This class provides an interface to:
    - Subscribe to framework events
    - Broadcast events to Dashboard clients
    - Filter and route events
    
    WITHOUT modifying the EventDispatcher architecture.
    """
    
    def __init__(self, config, channel_manager):
        self.config = config
        self.channel_manager = channel_manager
        self.logger = get_logger("events")
        
        # Event storage
        self._event_history: List[SerializedEvent] = []
        self._max_history = 1000
        
        # Event filters
        self._level_filters: Dict[str, bool] = {
            "debug": True,
            "info": True,
            "warning": True,
            "error": True,
        }
        
        self._source_filters: Optional[List[str]] = None
        
        # Callbacks
        self._event_callbacks: List[Callable] = []
        
        self.logger.info("EventIntegrator initialized")
    
    def get_events(self, limit: int = 100, level: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recent events."""
        events = self._event_history[-limit:]
        
        if level:
            events = [e for e in events if e.level.lower() == level.lower()]
        
        return [e.to_dict() for e in events]
    
    async def emit_event(
        self,
        event_type: str,
        level: str,
        source: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> SerializedEvent:
        """Emit an event from the framework."""
        # Check filters
        if not self._level_filters.get(level.lower(), True):
            return None
        
        if self._source_filters and source not in self._source_filters:
            return None
        
        # Serialize event
        event = EventSerializer.serialize(
            event_type=event_type,
            level=level,
            source=source,
            message=message,
            data=data or {},
            channel="events",
        )
        
        # Store in history
        self._event_history.append(event)
        if len(self._event_history) > self._max_history:
            self._event_history = self._event_history[-self._max_history:]
        
        # Call callbacks
        for callback in self._event_callbacks:
            try:
                await callback(event)
            except Exception as e:
                self.logger.error(f"Event callback error: {e}")
        
        # Broadcast to events channel
        from .channels import ChannelMessage
        message_obj = ChannelMessage(
            channel="events",
            type=event.type,
            data=event.to_dict(),
            timestamp=event.timestamp,
        )
        
        await self.channel_manager.publish("events", message_obj)
        
        self.logger.debug(f"Event emitted: {event_type} from {source}")
        return event
    
    def register_event_callback(self, callback: Callable):
        """Register a callback for events."""
        self._event_callbacks.append(callback)
    
    def unregister_event_callback(self, callback: Callable):
        """Unregister an event callback."""
        if callback in self._event_callbacks:
            self._event_callbacks.remove(callback)
    
    def set_level_filter(self, level: str, enabled: bool):
        """Enable or disable a level filter."""
        self._level_filters[level.lower()] = enabled
    
    def set_source_filters(self, sources: Optional[List[str]]):
        """Set source filters."""
        self._source_filters = sources
    
    def clear_history(self):
        """Clear event history."""
        self._event_history = []
        self.logger.info("Event history cleared")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get event statistics."""
        return {
            "total_events": len(self._event_history),
            "debug_count": len([e for e in self._event_history if e.level == "debug"]),
            "info_count": len([e for e in self._event_history if e.level == "info"]),
            "warning_count": len([e for e in self._event_history if e.level == "warning"]),
            "error_count": len([e for e in self._event_history if e.level == "error"]),
        }
