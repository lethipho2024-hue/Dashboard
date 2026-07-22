"""
Replay Integration
===============
Integration with ZBGym ReplayRecorder.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from dataclasses import dataclass, field

from .logger import get_logger
from .serializers import ReplayStatus, EventSerializer


class ReplayIntegrator:
    """
    Integrates with ZBGym ReplayRecorder.
    
    This class provides an interface to:
    - Monitor replay state
    - Track recording status
    - Broadcast replay updates
    
    WITHOUT modifying the ReplayRecorder architecture.
    """
    
    def __init__(self, config, channel_manager):
        self.config = config
        self.channel_manager = channel_manager
        self.logger = get_logger("replay")
        
        # Replay state
        self._recording = False
        self._replay_size_mb = 0.0
        self._current_replay: Optional[str] = None
        self._replay_queue_size = 0
        self._disk_usage_percent = 0.0
        
        self.logger.info("ReplayIntegrator initialized")
    
    def get_replay_status(self) -> ReplayStatus:
        """Get current replay status."""
        return ReplayStatus(
            recording=self._recording,
            replay_size_mb=self._replay_size_mb,
            current_replay=self._current_replay,
            replay_queue_size=self._replay_queue_size,
            disk_usage_percent=self._disk_usage_percent,
            timestamp=datetime.utcnow().isoformat(),
        )
    
    async def update_replay(self, **kwargs):
        """Update replay state."""
        if "recording" in kwargs:
            old_recording = self._recording
            self._recording = kwargs["recording"]
            if self._recording and not old_recording:
                self.logger.info("Replay recording started")
            elif not self._recording and old_recording:
                self.logger.info("Replay recording stopped")
        
        if "replay_size_mb" in kwargs:
            self._replay_size_mb = kwargs["replay_size_mb"]
        
        if "current_replay" in kwargs:
            self._current_replay = kwargs["current_replay"]
        
        if "replay_queue_size" in kwargs:
            self._replay_queue_size = kwargs["replay_queue_size"]
        
        if "disk_usage_percent" in kwargs:
            self._disk_usage_percent = kwargs["disk_usage_percent"]
        
        # Broadcast
        await self._broadcast_replay()
    
    async def start_recording(self):
        """Start recording."""
        self._recording = True
        await self._broadcast_replay()
    
    async def stop_recording(self):
        """Stop recording."""
        self._recording = False
        await self._broadcast_replay()
    
    async def _broadcast_replay(self):
        """Broadcast replay status to subscribers."""
        status = self.get_replay_status()
        payload = EventSerializer.serialize_replay(status)
        
        from .channels import ChannelMessage
        message = ChannelMessage(
            channel="replay",
            type="replay_update",
            data=payload["data"],
            timestamp=status.timestamp,
        )
        
        await self.channel_manager.publish("replay", message)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get replay statistics."""
        return {
            "recording": self._recording,
            "replay_size_mb": self._replay_size_mb,
            "current_replay": self._current_replay,
            "replay_queue_size": self._replay_queue_size,
            "disk_usage_percent": self._disk_usage_percent,
        }
