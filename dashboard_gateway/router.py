"""
REST API Router
=============
REST API endpoints for Dashboard Gateway.
"""

from typing import Optional, Dict, Any
from datetime import datetime

from .logger import get_logger


class RESTRouter:
    """
    REST API router for Dashboard Gateway.
    
    Provides endpoints for:
    - Health check
    - Framework status
    - Kernel status
    - Metrics
    - Events
    - License
    """
    
    def __init__(self, gateway):
        self.gateway = gateway
        self.logger = get_logger("router")
    
    async def get_health(self) -> Dict[str, Any]:
        """GET /health - Health check endpoint."""
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "framework_connected": self.gateway.runtime.is_connected(),
        }
    
    async def get_framework(self) -> Dict[str, Any]:
        """GET /framework - Framework status."""
        status = self.gateway.runtime.get_framework_status()
        return status.to_dict()
    
    async def get_kernel(self) -> Dict[str, Any]:
        """GET /kernel - Kernel status."""
        status = self.gateway.kernel.get_kernel_status()
        return status.to_dict()
    
    async def get_metrics(self, limit: Optional[int] = None) -> Dict[str, Any]:
        """GET /metrics - Metrics endpoint."""
        current = self.gateway.metrics.get_current_metrics()
        history = self.gateway.metrics.get_metrics_history(limit=limit or 100)
        
        return {
            "current": current.to_dict(),
            "history": [h.to_dict() for h in history],
            "stats": self.gateway.metrics.get_stats(),
        }
    
    async def get_events(self, limit: Optional[int] = None, level: Optional[str] = None) -> Dict[str, Any]:
        """GET /events - Events endpoint."""
        events = self.gateway.events.get_events(limit=limit or 100, level=level)
        
        return {
            "events": events,
            "count": len(events),
            "stats": self.gateway.events.get_stats(),
        }
    
    async def get_health_status(self) -> Dict[str, Any]:
        """GET /health/status - Health status."""
        status = self.gateway.health.get_health_status()
        return {
            "status": status.to_dict(),
            "stats": self.gateway.health.get_stats(),
            "timeline": self.gateway.health.get_timeline(),
        }
    
    async def get_replay(self) -> Dict[str, Any]:
        """GET /replay - Replay status."""
        status = self.gateway.replay.get_replay_status()
        return {
            "status": status.to_dict(),
            "stats": self.gateway.replay.get_stats(),
        }
    
    async def get_modules(self) -> Dict[str, Any]:
        """GET /modules - Module status."""
        health_status = self.gateway.health.get_health_status()
        return {
            "modules": health_status.module_status,
            "total": len(health_status.module_status),
        }
    
    async def get_license(self) -> Dict[str, Any]:
        """GET /license - License information."""
        license_info = self.gateway.license_validator.get_current_license()
        
        if license_info:
            return {
                "license_type": license_info.license_type.value,
                "valid": license_info.valid,
                "expires_at": license_info.expires_at.isoformat() if license_info.expires_at else None,
                "features": license_info.features,
                "max_clients": license_info.max_clients,
                "max_sessions": license_info.max_sessions,
            }
        
        return {
            "license_type": "none",
            "valid": False,
        }
    
    async def post_license_activate(self, license_key: str) -> Dict[str, Any]:
        """POST /license/activate - Activate license."""
        try:
            license_info = self.gateway.license_validator.activate(license_key)
            self.logger.info(f"License activated: {license_key[:8]}...")
            
            return {
                "success": True,
                "license_type": license_info.license_type.value,
                "expires_at": license_info.expires_at.isoformat() if license_info.expires_at else None,
            }
        except ValueError as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    async def get_stats(self) -> Dict[str, Any]:
        """GET /stats - Gateway statistics."""
        client_stats = await self.gateway.client_manager.get_stats()
        channel_stats = self.gateway.channel_manager.get_all_stats()
        
        return {
            "clients": client_stats,
            "channels": channel_stats,
            "websocket": self.gateway.ws_manager.get_stats(),
            "runtime": self.gateway.runtime.get_info(),
        }
    
    async def get_logs(self, limit: Optional[int] = None) -> Dict[str, Any]:
        """GET /logs - Gateway logs (internal)."""
        # This would return gateway internal logs
        return {
            "logs": [],
            "count": 0,
        }
