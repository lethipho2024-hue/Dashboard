"""
Client Manager
=============
Manages connected Dashboard clients.
"""

import asyncio
import secrets
from datetime import datetime
from typing import Dict, List, Optional, Set, Any
from dataclasses import dataclass, field
from enum import Enum
import json

from .logger import get_logger
from .auth import AuthSession


class ClientStatus(Enum):
    """Client connection status."""
    CONNECTING = "connecting"
    AUTHENTICATED = "authenticated"
    CONNECTED = "connected"
    RECONNECTING = "reconnecting"
    DISCONNECTED = "disconnected"
    ERROR = "error"


@dataclass
class Client:
    """A connected Dashboard client."""
    client_id: str
    session_id: Optional[str]
    connection_time: datetime = field(default_factory=datetime.utcnow)
    last_heartbeat: datetime = field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: ClientStatus = ClientStatus.CONNECTING
    subscribed_channels: Set[str] = field(default_factory=set)
    license_type: str = "trial"
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # WebSocket connection (set by websocket handler)
    websocket = None
    
    def is_alive(self, timeout: int = 60) -> bool:
        """Check if client is still alive based on heartbeat."""
        elapsed = (datetime.utcnow() - self.last_heartbeat).total_seconds()
        return elapsed < timeout
    
    def update_heartbeat(self):
        """Update last heartbeat time."""
        self.last_heartbeat = datetime.utcnow()
    
    def subscribe(self, channel: str):
        """Subscribe to a channel."""
        self.subscribed_channels.add(channel)
    
    def unsubscribe(self, channel: str):
        """Unsubscribe from a channel."""
        self.subscribed_channels.discard(channel)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "client_id": self.client_id,
            "session_id": self.session_id,
            "connection_time": self.connection_time.isoformat(),
            "last_heartbeat": self.last_heartbeat.isoformat(),
            "ip_address": self.ip_address,
            "status": self.status.value,
            "subscribed_channels": list(self.subscribed_channels),
            "license_type": self.license_type,
            "alive": self.is_alive(),
        }


class ClientManager:
    """Manages all connected Dashboard clients."""
    
    def __init__(self, config, auth_manager):
        self.config = config
        self.auth_manager = auth_manager
        self.logger = get_logger("client_manager")
        self._clients: Dict[str, Client] = {}
        self._lock = asyncio.Lock()
    
    def _generate_client_id(self) -> str:
        """Generate a unique client ID."""
        return f"client_{secrets.token_hex(8)}"
    
    async def register_client(
        self,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Client:
        """Register a new client."""
        async with self._lock:
            client_id = self._generate_client_id()
            
            # Get license type from session if available
            license_type = "trial"
            if session_id:
                session = self.auth_manager.validate_session(session_id)
                if session and session.license_info:
                    license_type = session.license_info.license_type.value
            
            client = Client(
                client_id=client_id,
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent,
                status=ClientStatus.CONNECTING,
                license_type=license_type,
            )
            
            self._clients[client_id] = client
            self.logger.info(f"Client registered: {client_id} from {ip_address}")
            
            return client
    
    async def authenticate_client(self, client_id: str, auth_method: str, credentials: str) -> bool:
        """Authenticate a client."""
        async with self._lock:
            client = self._clients.get(client_id)
            if client is None:
                return False
            
            if auth_method == "license_key":
                session = self.auth_manager.authenticate_license_key(credentials, client.ip_address)
            elif auth_method == "api_key":
                session = self.auth_manager.authenticate_api_key(credentials, client.ip_address)
            elif auth_method == "session_token":
                session = self.auth_manager.authenticate_session(credentials, client.ip_address)
            else:
                return False
            
            if session:
                client.session_id = session.session_id
                client.status = ClientStatus.AUTHENTICATED
                client.license_type = session.license_info.license_type.value if session.license_info else "trial"
                self.logger.info(f"Client authenticated: {client_id}")
                return True
            
            return False
    
    async def connect_client(self, client_id: str):
        """Mark client as connected."""
        async with self._lock:
            client = self._clients.get(client_id)
            if client:
                client.status = ClientStatus.CONNECTED
                self.logger.info(f"Client connected: {client_id}")
    
    async def disconnect_client(self, client_id: str, reason: str = "unknown"):
        """Disconnect a client."""
        async with self._lock:
            if client_id in self._clients:
                client = self._clients[client_id]
                client.status = ClientStatus.DISCONNECTED
                self.logger.info(f"Client disconnected: {client_id} ({reason})")
                # Remove after a delay to allow reconnection
                # For now, just mark as disconnected
                del self._clients[client_id]
    
    async def heartbeat(self, client_id: str):
        """Update client heartbeat."""
        async with self._lock:
            client = self._clients.get(client_id)
            if client:
                client.update_heartbeat()
                self.logger.debug(f"Heartbeat: {client_id}")
    
    async def subscribe(self, client_id: str, channel: str):
        """Subscribe client to a channel."""
        async with self._lock:
            client = self._clients.get(client_id)
            if client:
                client.subscribe(channel)
                self.logger.debug(f"Client {client_id} subscribed to {channel}")
    
    async def unsubscribe(self, client_id: str, channel: str):
        """Unsubscribe client from a channel."""
        async with self._lock:
            client = self._clients.get(client_id)
            if client:
                client.unsubscribe(channel)
                self.logger.debug(f"Client {client_id} unsubscribed from {channel}")
    
    async def get_client(self, client_id: str) -> Optional[Client]:
        """Get a client by ID."""
        return self._clients.get(client_id)
    
    async def get_all_clients(self) -> List[Client]:
        """Get all clients."""
        return list(self._clients.values())
    
    async def get_clients_by_channel(self, channel: str) -> List[Client]:
        """Get all clients subscribed to a channel."""
        return [
            client for client in self._clients.values()
            if channel in client.subscribed_channels
        ]
    
    async def cleanup_dead_clients(self, timeout: int = 300):
        """Remove dead client connections."""
        async with self._lock:
            dead = [
                cid for cid, client in self._clients.items()
                if not client.is_alive(timeout)
            ]
            
            for cid in dead:
                self.logger.warning(f"Removing dead client: {cid}")
                del self._clients[cid]
            
            if dead:
                self.logger.info(f"Cleaned up {len(dead)} dead clients")
            
            return len(dead)
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get client statistics."""
        async with self._lock:
            return {
                "total_clients": len(self._clients),
                "connected": len([c for c in self._clients.values() if c.status == ClientStatus.CONNECTED]),
                "authenticated": len([c for c in self._clients.values() if c.status == ClientStatus.AUTHENTICATED]),
                "reconnecting": len([c for c in self._clients.values() if c.status == ClientStatus.RECONNECTING]),
                "channels": self._get_channel_stats(),
            }
    
    def _get_channel_stats(self) -> Dict[str, int]:
        """Get subscriber count per channel."""
        channels: Dict[str, int] = {}
        for client in self._clients.values():
            for channel in client.subscribed_channels:
                channels[channel] = channels.get(channel, 0) + 1
        return channels
