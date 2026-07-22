"""
Gateway Configuration
=====================
Configuration settings for the Dashboard Gateway.
"""

import os
from dataclasses import dataclass, field
from typing import List, Optional
from enum import Enum


class LicenseType(Enum):
    """License types supported by the gateway."""
    TRIAL = "trial"
    DEVELOPER = "developer"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


@dataclass
class GatewayConfig:
    """Main configuration for the Dashboard Gateway."""
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8080
    debug: bool = False
    
    # WebSocket settings
    ws_path: str = "/ws"
    ws_heartbeat_interval: int = 30  # seconds
    ws_ping_interval: int = 15  # seconds
    ws_pong_timeout: int = 10  # seconds
    ws_max_connections: int = 100
    ws_connection_timeout: int = 300  # seconds
    
    # Framework connection
    framework_host: str = "localhost"
    framework_port: int = 5555
    framework_timeout: int = 10  # seconds
    
    # License settings
    license_type: LicenseType = LicenseType.TRIAL
    license_key: Optional[str] = None
    license_check_interval: int = 3600  # seconds
    
    # Authentication
    require_auth: bool = True
    api_keys: List[str] = field(default_factory=list)
    session_timeout: int = 3600  # seconds
    
    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    
    # Logging
    log_level: str = "INFO"
    log_file: Optional[str] = None
    
    # Performance
    max_queue_size: int = 1000
    batch_size: int = 50
    broadcast_interval: float = 0.1  # seconds
    
    # Channels to enable
    enabled_channels: List[str] = field(default_factory=lambda: [
        "framework",
        "kernel", 
        "metrics",
        "health",
        "events",
        "replay",
        "ai"
    ])
    
    @classmethod
    def from_env(cls) -> "GatewayConfig":
        """Create config from environment variables."""
        return cls(
            host=os.getenv("GATEWAY_HOST", "0.0.0.0"),
            port=int(os.getenv("GATEWAY_PORT", "8080")),
            debug=os.getenv("GATEWAY_DEBUG", "false").lower() == "true",
            framework_host=os.getenv("FRAMEWORK_HOST", "localhost"),
            framework_port=int(os.getenv("FRAMEWORK_PORT", "5555")),
            license_key=os.getenv("LICENSE_KEY"),
            require_auth=os.getenv("REQUIRE_AUTH", "true").lower() == "true",
            log_level=os.getenv("LOG_LEVEL", "INFO"),
        )
    
    @classmethod
    def standalone(cls) -> "GatewayConfig":
        """Create config for standalone mode (no auth, local)."""
        return cls(
            require_auth=False,
            license_type=LicenseType.DEVELOPER,
        )


@dataclass
class ChannelConfig:
    """Configuration for a specific channel."""
    name: str
    enabled: bool = True
    broadcast_interval: float = 1.0  # seconds
    buffer_size: int = 100
    include_history: bool = True
    history_size: int = 50
