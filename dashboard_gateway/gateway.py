"""
Dashboard Gateway
================
Main gateway orchestrating all components.
"""

import asyncio
from typing import Optional

from .config import GatewayConfig
from .logger import get_logger
from .license import LicenseValidator
from .auth import AuthManager
from .client_manager import ClientManager
from .channels import ChannelManager
from .runtime import RuntimeIntegrator
from .events import EventIntegrator
from .metrics import MetricsIntegrator
from .health import HealthIntegrator
from .kernel import KernelIntegrator
from .replay import ReplayIntegrator
from .websocket import WebSocketManager
from .router import RESTRouter


class DashboardGateway:
    """
    Main Dashboard Gateway class.
    
    Orchestrates all gateway components:
    - Channel management
    - Client management
    - Authentication
    - License validation
    - Framework integration
    - WebSocket server
    - REST API
    """
    
    def __init__(self, config: Optional[GatewayConfig] = None):
        self.config = config or GatewayConfig.standalone()
        self.logger = get_logger("gateway", self.config.log_level, self.config.log_file)
        
        self.logger.info("Initializing Dashboard Gateway...")
        
        # Initialize components
        self.license_validator = LicenseValidator(self.config)
        self.auth_manager = AuthManager(self.config, self.license_validator)
        self.channel_manager = ChannelManager(self.config)
        self.client_manager = ClientManager(self.config, self.auth_manager)
        
        # Framework integrators
        self.runtime = RuntimeIntegrator(self.config, self.channel_manager)
        self.events = EventIntegrator(self.config, self.channel_manager)
        self.metrics = MetricsIntegrator(self.config, self.channel_manager)
        self.health = HealthIntegrator(self.config, self.channel_manager)
        self.kernel = KernelIntegrator(self.config, self.channel_manager)
        self.replay = ReplayIntegrator(self.config, self.channel_manager)
        
        # WebSocket and REST
        self.ws_manager = WebSocketManager(self)
        self.router = RESTRouter(self)
        
        self._running = False
        self._cleanup_task: Optional[asyncio.Task] = None
        
        self.logger.info("Dashboard Gateway initialized")
    
    async def start(self):
        """Start the gateway."""
        if self._running:
            self.logger.warning("Gateway already running")
            return
        
        self.logger.info("Starting Dashboard Gateway...")
        self._running = True
        
        # Start WebSocket manager
        await self.ws_manager.start()
        
        # Connect to framework
        await self.runtime.connect()
        
        # Start cleanup task
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())
        
        self.logger.info("Dashboard Gateway started successfully")
    
    async def stop(self):
        """Stop the gateway."""
        if not self._running:
            self.logger.warning("Gateway not running")
            return
        
        self.logger.info("Stopping Dashboard Gateway...")
        self._running = False
        
        # Cancel cleanup task
        if self._cleanup_task:
            self._cleanup_task.cancel()
        
        # Disconnect from framework
        await self.runtime.disconnect()
        
        # Stop WebSocket manager
        await self.ws_manager.stop()
        
        self.logger.info("Dashboard Gateway stopped")
    
    async def _cleanup_loop(self):
        """Periodic cleanup tasks."""
        while self._running:
            try:
                await asyncio.sleep(60)
                
                # Cleanup expired sessions
                self.auth_manager.cleanup_expired_sessions()
                
                # Cleanup dead clients
                await self.client_manager.cleanup_dead_clients()
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                self.logger.error(f"Cleanup error: {e}")
    
    async def restart(self):
        """Restart the gateway."""
        await self.stop()
        await asyncio.sleep(1)
        await self.start()
    
    def is_running(self) -> bool:
        """Check if gateway is running."""
        return self._running
    
    async def get_status(self) -> dict:
        """Get gateway status."""
        return {
            "running": self._running,
            "config": {
                "host": self.config.host,
                "port": self.config.port,
                "require_auth": self.config.require_auth,
            },
            "clients": await self.client_manager.get_stats(),
            "channels": self.channel_manager.get_all_stats(),
            "framework": self.runtime.get_info(),
        }
