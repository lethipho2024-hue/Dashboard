"""
Metrics Integration
================
Integration with ZBGym MetricsCollector.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from dataclasses import dataclass, field

from .logger import get_logger
from .serializers import MetricsSnapshot, EventSerializer


@dataclass
class MetricsData:
    """Metrics data container."""
    fps: float = 0.0
    tick_time_ms: float = 0.0
    cpu_usage_percent: float = 0.0
    memory_usage_mb: float = 0.0
    gpu_usage_percent: float = 0.0
    vram_usage_mb: float = 0.0
    latency_ms: float = 0.0
    inference_time_ms: float = 0.0
    network_usage_mbps: float = 0.0
    reward_rate: float = 0.0
    episode_count: int = 0
    replay_size_mb: float = 0.0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


class MetricsIntegrator:
    """
    Integrates with ZBGym MetricsCollector.
    
    This class provides an interface to:
    - Collect metrics from the framework
    - Broadcast metrics to Dashboard clients
    - Store metrics history
    
    WITHOUT modifying the MetricsCollector architecture.
    """
    
    def __init__(self, config, channel_manager):
        self.config = config
        self.channel_manager = channel_manager
        self.logger = get_logger("metrics")
        
        # Current metrics
        self._metrics = MetricsData()
        
        # Metrics history
        self._history: list = []
        self._max_history = 1000
        
        self.logger.info("MetricsIntegrator initialized")
    
    def get_current_metrics(self) -> MetricsSnapshot:
        """Get current metrics snapshot."""
        return MetricsSnapshot(
            fps=self._metrics.fps,
            tick_time_ms=self._metrics.tick_time_ms,
            cpu_usage_percent=self._metrics.cpu_usage_percent,
            memory_usage_mb=self._metrics.memory_usage_mb,
            gpu_usage_percent=self._metrics.gpu_usage_percent,
            vram_usage_mb=self._metrics.vram_usage_mb,
            latency_ms=self._metrics.latency_ms,
            inference_time_ms=self._metrics.inference_time_ms,
            network_usage_mbps=self._metrics.network_usage_mbps,
            reward_rate=self._metrics.reward_rate,
            episode_count=self._metrics.episode_count,
            replay_size_mb=self._metrics.replay_size_mb,
            timestamp=self._metrics.timestamp,
        )
    
    def get_metrics_history(self, limit: int = 100) -> list:
        """Get metrics history."""
        return self._history[-limit:]
    
    async def update_metrics(self, **kwargs):
        """Update metrics from MetricsCollector data."""
        changed = False
        
        for key, value in kwargs.items():
            if hasattr(self._metrics, key):
                if getattr(self._metrics, key) != value:
                    setattr(self._metrics, key, value)
                    changed = True
        
        if changed:
            self._metrics.timestamp = datetime.utcnow().isoformat()
            
            # Store in history
            snapshot = self.get_current_metrics()
            self._history.append(snapshot)
            
            if len(self._history) > self._max_history:
                self._history = self._history[-self._max_history:]
            
            # Broadcast
            await self._broadcast_metrics()
    
    async def _broadcast_metrics(self):
        """Broadcast current metrics to subscribers."""
        metrics = self.get_current_metrics()
        payload = EventSerializer.serialize_metrics(metrics)
        
        from .channels import ChannelMessage
        message = ChannelMessage(
            channel="metrics",
            type="metrics_update",
            data=payload["data"],
            timestamp=metrics.timestamp,
        )
        
        await self.channel_manager.publish("metrics", message)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get metrics statistics."""
        return {
            "fps_avg": sum(m.fps for m in self._history[-100:]) / len(self._history[-100:]) if self._history else 0,
            "cpu_avg": sum(m.cpu_usage_percent for m in self._history[-100:]) / len(self._history[-100:]) if self._history else 0,
            "memory_avg": sum(m.memory_usage_mb for m in self._history[-100:]) / len(self._history[-100:]) if self._history else 0,
            "reward_rate_avg": sum(m.reward_rate for m in self._history[-100:]) / len(self._history[-100:]) if self._history else 0,
            "total_episodes": self._metrics.episode_count,
            "history_size": len(self._history),
        }
