"""
Channels
=======
Realtime channel definitions for broadcasting data.
"""

from enum import Enum
from typing import List, Optional, Dict, Any, Callable
from dataclasses import dataclass, field
from collections import deque
import asyncio

from .logger import get_logger


class ChannelType(Enum):
    """Channel types."""
    FRAMEWORK = "framework"
    KERNEL = "kernel"
    METRICS = "metrics"
    HEALTH = "health"
    EVENTS = "events"
    REPLAY = "replay"
    AI = "ai"


@dataclass
class ChannelMessage:
    """A message to be sent on a channel."""
    channel: str
    type: str
    data: Dict[str, Any]
    timestamp: str


class Channel:
    """A realtime broadcast channel."""
    
    def __init__(
        self,
        name: str,
        channel_type: ChannelType,
        buffer_size: int = 100,
        include_history: bool = True,
        history_size: int = 50,
    ):
        self.name = name
        self.channel_type = channel_type
        self.buffer_size = buffer_size
        self.include_history = include_history
        self.history_size = history_size
        
        self._history: deque = deque(maxlen=history_size) if include_history else None
        self._subscribers: Dict[str, Callable] = {}
        self._lock = asyncio.Lock()
        self.logger = get_logger(f"channel.{name}")
        
        self._last_update: Optional[float] = None
        self._update_count: int = 0
    
    async def publish(self, message: ChannelMessage):
        """Publish a message to all subscribers."""
        async with self._lock:
            # Store in history
            if self._history is not None:
                self._history.append(message)
            
            self._last_update = message.timestamp
            self._update_count += 1
            
            # Send to all subscribers
            for client_id, callback in self._subscribers.items():
                try:
                    await callback(message)
                except Exception as e:
                    self.logger.error(f"Failed to send to {client_id}: {e}")
    
    async def subscribe(self, client_id: str, callback: Callable):
        """Subscribe a client to this channel."""
        async with self._lock:
            self._subscribers[client_id] = callback
            self.logger.debug(f"Client {client_id} subscribed to {self.name}")
    
    async def unsubscribe(self, client_id: str):
        """Unsubscribe a client from this channel."""
        async with self._lock:
            if client_id in self._subscribers:
                del self._subscribers[client_id]
                self.logger.debug(f"Client {client_id} unsubscribed from {self.name}")
    
    def get_history(self, limit: int = 50) -> List[ChannelMessage]:
        """Get recent messages from history."""
        if self._history is None:
            return []
        return list(self._history)[-limit:]
    
    def get_subscriber_count(self) -> int:
        """Get number of subscribers."""
        return len(self._subscribers)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get channel statistics."""
        return {
            "name": self.name,
            "type": self.channel_type.value,
            "subscribers": len(self._subscribers),
            "history_size": len(self._history) if self._history else 0,
            "update_count": self._update_count,
            "last_update": self._last_update,
        }


class ChannelManager:
    """Manages all channels."""
    
    def __init__(self, config):
        self.config = config
        self.logger = get_logger("channels")
        self._channels: Dict[str, Channel] = {}
        self._lock = asyncio.Lock()
        
        # Initialize default channels
        self._initialize_default_channels()
    
    def _initialize_default_channels(self):
        """Initialize default channels."""
        default_channels = [
            (ChannelType.FRAMEWORK.value, ChannelType.FRAMEWORK),
            (ChannelType.KERNEL.value, ChannelType.KERNEL),
            (ChannelType.METRICS.value, ChannelType.METRICS),
            (ChannelType.HEALTH.value, ChannelType.HEALTH),
            (ChannelType.EVENTS.value, ChannelType.EVENTS),
            (ChannelType.REPLAY.value, ChannelType.REPLAY),
            (ChannelType.AI.value, ChannelType.AI),
        ]
        
        for name, channel_type in default_channels:
            if name in self.config.enabled_channels:
                self._channels[name] = Channel(
                    name=name,
                    channel_type=channel_type,
                    buffer_size=self.config.max_queue_size,
                    history_size=50,
                )
                self.logger.info(f"Channel initialized: {name}")
    
    async def get_channel(self, name: str) -> Optional[Channel]:
        """Get a channel by name."""
        return self._channels.get(name)
    
    async def publish(self, channel_name: str, message: ChannelMessage):
        """Publish to a channel."""
        channel = self._channels.get(channel_name)
        if channel:
            await channel.publish(message)
        else:
            self.logger.warning(f"Channel not found: {channel_name}")
    
    async def subscribe(self, client_id: str, channel_name: str, callback: Callable) -> bool:
        """Subscribe a client to a channel."""
        channel = self._channels.get(channel_name)
        if channel:
            await channel.subscribe(client_id, callback)
            return True
        return False
    
    async def unsubscribe(self, client_id: str, channel_name: str):
        """Unsubscribe a client from a channel."""
        channel = self._channels.get(channel_name)
        if channel:
            await channel.unsubscribe(client_id)
    
    async def unsubscribe_all(self, client_id: str):
        """Unsubscribe a client from all channels."""
        for channel in self._channels.values():
            await channel.unsubscribe(client_id)
    
    def get_all_stats(self) -> Dict[str, Dict[str, Any]]:
        """Get statistics for all channels."""
        return {
            name: channel.get_stats()
            for name, channel in self._channels.items()
        }
    
    def get_channel_names(self) -> List[str]:
        """Get list of channel names."""
        return list(self._channels.keys())
