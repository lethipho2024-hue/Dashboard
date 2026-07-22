"""
Health Integration
================
Integration with ZBGym HealthMonitor.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from dataclasses import dataclass, field

from .logger import get_logger
from .serializers import HealthStatus, EventSerializer


class HealthIntegrator:
    """
    Integrates with ZBGym HealthMonitor.
    
    This class provides an interface to:
    - Monitor framework health
    - Track module health
    - Broadcast health updates
    
    WITHOUT modifying the HealthMonitor architecture.
    """
    
    def __init__(self, config, channel_manager):
        self.config = config
        self.channel_manager = channel_manager
        self.logger = get_logger("health")
        
        # Health state
        self._health_score = 100
        self._module_status: Dict[str, str] = {}
        self._warnings: List[str] = []
        self._errors: List[str] = []
        self._crash_count = 0
        self._temperature: Optional[float] = None
        
        # History
        self._history: List[HealthStatus] = []
        self._max_history = 100
        
        self.logger.info("HealthIntegrator initialized")
    
    def get_health_status(self) -> HealthStatus:
        """Get current health status."""
        return HealthStatus(
            health_score=self._health_score,
            module_status=self._module_status.copy(),
            warnings=self._warnings.copy(),
            errors=self._errors.copy(),
            crash_count=self._crash_count,
            temperature_celsius=self._temperature,
            timestamp=datetime.utcnow().isoformat(),
        )
    
    async def update_health(self, **kwargs):
        """Update health from HealthMonitor data."""
        if "health_score" in kwargs:
            self._health_score = max(0, min(100, kwargs["health_score"]))
        
        if "module_status" in kwargs:
            self._module_status.update(kwargs["module_status"])
        
        if "warnings" in kwargs:
            self._warnings = kwargs["warnings"]
        
        if "errors" in kwargs:
            self._errors = kwargs["errors"]
        
        if "crash_count" in kwargs:
            self._crash_count = kwargs["crash_count"]
        
        if "temperature" in kwargs:
            self._temperature = kwargs["temperature"]
        
        # Store in history
        health = self.get_health_status()
        self._history.append(health)
        
        if len(self._history) > self._max_history:
            self._history = self._history[-self._max_history:]
        
        # Broadcast
        await self._broadcast_health()
    
    async def add_warning(self, warning: str):
        """Add a health warning."""
        if warning not in self._warnings:
            self._warnings.append(warning)
            self._health_score = max(0, self._health_score - 5)
            await self._broadcast_health()
    
    async def add_error(self, error: str):
        """Add a health error."""
        if error not in self._errors:
            self._errors.append(error)
            self._health_score = max(0, self._health_score - 10)
            await self._broadcast_health()
    
    async def clear_warning(self, warning: str):
        """Clear a warning."""
        if warning in self._warnings:
            self._warnings.remove(warning)
            self._health_score = min(100, self._health_score + 5)
            await self._broadcast_health()
    
    async def clear_error(self, error: str):
        """Clear an error."""
        if error in self._errors:
            self._errors.remove(error)
            self._health_score = min(100, self._health_score + 10)
            await self._broadcast_health()
    
    async def _broadcast_health(self):
        """Broadcast health status to subscribers."""
        health = self.get_health_status()
        payload = EventSerializer.serialize_health(health)
        
        from .channels import ChannelMessage
        message = ChannelMessage(
            channel="health",
            type="health_update",
            data=payload["data"],
            timestamp=health.timestamp,
        )
        
        await self.channel_manager.publish("health", message)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get health statistics."""
        return {
            "health_score": self._health_score,
            "total_modules": len(self._module_status),
            "healthy_modules": len([s for s in self._module_status.values() if s == "healthy"]),
            "warning_modules": len([s for s in self._module_status.values() if s == "warning"]),
            "error_modules": len([s for s in self._module_status.values() if s == "error"]),
            "warning_count": len(self._warnings),
            "error_count": len(self._errors),
            "crash_count": self._crash_count,
            "temperature": self._temperature,
        }
    
    def get_timeline(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get health timeline."""
        return [h.to_dict() for h in self._history[-limit:]]
