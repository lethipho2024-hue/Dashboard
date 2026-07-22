"""
Kernel Integration
===============
Integration with ZBGym Kernel.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from dataclasses import dataclass, field

from .logger import get_logger
from .serializers import KernelStatus, EventSerializer


class KernelIntegrator:
    """
    Integrates with ZBGym Kernel.
    
    This class provides an interface to:
    - Monitor kernel state
    - Track tick count and rate
    - Broadcast kernel updates
    
    WITHOUT modifying the Kernel architecture.
    """
    
    def __init__(self, config, channel_manager):
        self.config = config
        self.channel_manager = channel_manager
        self.logger = get_logger("kernel")
        
        # Kernel state
        self._running = False
        self._current_tick = 0
        self._tick_rate = 0.0
        self._current_stage = "idle"
        self._scheduler_queue_size = 0
        self._runtime_status = "stopped"
        self._uptime_seconds = 0.0
        self._start_time: Optional[datetime] = None
        
        self.logger.info("KernelIntegrator initialized")
    
    def get_kernel_status(self) -> KernelStatus:
        """Get current kernel status."""
        return KernelStatus(
            running=self._running,
            current_tick=self._current_tick,
            tick_rate=self._tick_rate,
            current_stage=self._current_stage,
            scheduler_queue_size=self._scheduler_queue_size,
            runtime_status=self._runtime_status,
            uptime_seconds=self._uptime_seconds,
        )
    
    async def update_kernel(self, **kwargs):
        """Update kernel state."""
        if "running" in kwargs:
            self._running = kwargs["running"]
            if self._running and not self._start_time:
                self._start_time = datetime.utcnow()
            elif not self._running:
                self._start_time = None
        
        if "current_tick" in kwargs:
            self._current_tick = kwargs["current_tick"]
        
        if "tick_rate" in kwargs:
            self._tick_rate = kwargs["tick_rate"]
        
        if "current_stage" in kwargs:
            old_stage = self._current_stage
            self._current_stage = kwargs["current_stage"]
            # Detect stage change
            if old_stage != self._current_stage:
                self.logger.info(f"Kernel stage changed: {old_stage} -> {self._current_stage}")
        
        if "scheduler_queue_size" in kwargs:
            self._scheduler_queue_size = kwargs["scheduler_queue_size"]
        
        if "runtime_status" in kwargs:
            self._runtime_status = kwargs["runtime_status"]
        
        # Update uptime
        if self._start_time:
            self._uptime_seconds = (datetime.utcnow() - self._start_time).total_seconds()
        
        # Broadcast
        await self._broadcast_kernel()
    
    async def _broadcast_kernel(self):
        """Broadcast kernel status to subscribers."""
        status = self.get_kernel_status()
        payload = EventSerializer.serialize_kernel_status(status)
        
        from .channels import ChannelMessage
        message = ChannelMessage(
            channel="kernel",
            type="status_update",
            data=payload["data"],
            timestamp=datetime.utcnow().isoformat(),
        )
        
        await self.channel_manager.publish("kernel", message)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get kernel statistics."""
        return {
            "running": self._running,
            "current_tick": self._current_tick,
            "tick_rate": self._tick_rate,
            "current_stage": self._current_stage,
            "scheduler_queue_size": self._scheduler_queue_size,
            "runtime_status": self._runtime_status,
            "uptime_seconds": self._uptime_seconds,
        }
