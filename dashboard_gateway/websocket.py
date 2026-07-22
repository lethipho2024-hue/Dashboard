"""
WebSocket Server
===============
WebSocket server for realtime Dashboard communication.
"""

import asyncio
import json
from typing import Optional, Dict, Any, Callable
from datetime import datetime
import logging

from .logger import get_logger
from .channels import ChannelManager, ChannelMessage
from .client_manager import ClientManager


class WebSocketHandler:
    """
    Handles WebSocket connections from Dashboard clients.
    """
    
    def __init__(self, gateway):
        self.gateway = gateway
        self.logger = get_logger("websocket")
        self._handlers: Dict[str, Callable] = {
            "auth": self._handle_auth,
            "subscribe": self._handle_subscribe,
            "unsubscribe": self._handle_unsubscribe,
            "heartbeat": self._handle_heartbeat,
            "ping": self._handle_ping,
        }
    
    async def handle_connection(self, websocket, client_id: str):
        """Handle a WebSocket connection."""
        self.logger.info(f"WebSocket connection established: {client_id}")
        
        try:
            # Send welcome message
            await websocket.send(json.dumps({
                "type": "connected",
                "client_id": client_id,
                "timestamp": datetime.utcnow().isoformat(),
            }))
            
            # Handle messages
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self._process_message(websocket, client_id, data)
                except json.JSONDecodeError:
                    self.logger.warning(f"Invalid JSON from {client_id}")
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Invalid JSON format",
                    }))
                    
        except Exception as e:
            self.logger.error(f"WebSocket error for {client_id}: {e}")
        finally:
            # Cleanup
            await self.gateway.client_manager.disconnect_client(client_id, "connection_closed")
            await self.gateway.channel_manager.unsubscribe_all(client_id)
            self.logger.info(f"WebSocket connection closed: {client_id}")
    
    async def _process_message(self, websocket, client_id: str, data: Dict[str, Any]):
        """Process an incoming WebSocket message."""
        msg_type = data.get("type", "")
        
        handler = self._handlers.get(msg_type)
        if handler:
            await handler(websocket, client_id, data)
        else:
            await websocket.send(json.dumps({
                "type": "error",
                "message": f"Unknown message type: {msg_type}",
            }))
    
    async def _handle_auth(self, websocket, client_id: str, data: Dict[str, Any]):
        """Handle authentication message."""
        auth_method = data.get("method", "")
        credentials = data.get("credentials", "")
        
        success = await self.gateway.client_manager.authenticate_client(
            client_id, auth_method, credentials
        )
        
        if success:
            await websocket.send(json.dumps({
                "type": "auth_success",
                "client_id": client_id,
            }))
        else:
            await websocket.send(json.dumps({
                "type": "auth_failed",
                "message": "Authentication failed",
            }))
    
    async def _handle_subscribe(self, websocket, client_id: str, data: Dict[str, Any]):
        """Handle subscribe message."""
        channel = data.get("channel", "")
        
        success = await self.gateway.channel_manager.subscribe(
            client_id, channel, 
            lambda msg: self._send_to_client(websocket, msg)
        )
        
        if success:
            # Also register with client manager
            await self.gateway.client_manager.subscribe(client_id, channel)
            
            # Get channel history
            channel_obj = await self.gateway.channel_manager.get_channel(channel)
            history = []
            if channel_obj:
                history = channel_obj.get_history(limit=20)
            
            await websocket.send(json.dumps({
                "type": "subscribed",
                "channel": channel,
                "history": [h.__dict__ for h in history],
            }))
        else:
            await websocket.send(json.dumps({
                "type": "subscribe_failed",
                "channel": channel,
                "message": f"Channel not found: {channel}",
            }))
    
    async def _handle_unsubscribe(self, websocket, client_id: str, data: Dict[str, Any]):
        """Handle unsubscribe message."""
        channel = data.get("channel", "")
        
        await self.gateway.channel_manager.unsubscribe(client_id, channel)
        await self.gateway.client_manager.unsubscribe(client_id, channel)
        
        await websocket.send(json.dumps({
            "type": "unsubscribed",
            "channel": channel,
        }))
    
    async def _handle_heartbeat(self, websocket, client_id: str, data: Dict[str, Any]):
        """Handle heartbeat message."""
        await self.gateway.client_manager.heartbeat(client_id)
        
        await websocket.send(json.dumps({
            "type": "heartbeat_ack",
            "timestamp": datetime.utcnow().isoformat(),
        }))
    
    async def _handle_ping(self, websocket, client_id: str, data: Dict[str, Any]):
        """Handle ping message."""
        await websocket.send(json.dumps({
            "type": "pong",
            "timestamp": datetime.utcnow().isoformat(),
        }))
    
    async def _send_to_client(self, websocket, message: ChannelMessage):
        """Send a message to the client."""
        try:
            await websocket.send(json.dumps({
                "channel": message.channel,
                "type": message.type,
                "data": message.data,
                "timestamp": message.timestamp,
            }))
        except Exception as e:
            self.logger.error(f"Failed to send to {client_id}: {e}")


class WebSocketManager:
    """
    Manages WebSocket connections.
    """
    
    def __init__(self, gateway):
        self.gateway = gateway
        self.logger = get_logger("ws_manager")
        self.handler = WebSocketHandler(gateway)
        self._connections: Dict[str, Any] = {}
        self._cleanup_task: Optional[asyncio.Task] = None
    
    async def start(self):
        """Start the WebSocket manager."""
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())
        self.logger.info("WebSocket manager started")
    
    async def stop(self):
        """Stop the WebSocket manager."""
        if self._cleanup_task:
            self._cleanup_task.cancel()
        self.logger.info("WebSocket manager stopped")
    
    async def add_connection(self, client_id: str, websocket):
        """Add a WebSocket connection."""
        self._connections[client_id] = websocket
        self.logger.debug(f"Connection added: {client_id}")
    
    async def remove_connection(self, client_id: str):
        """Remove a WebSocket connection."""
        if client_id in self._connections:
            del self._connections[client_id]
            self.logger.debug(f"Connection removed: {client_id}")
    
    async def broadcast(self, channel: str, message: Dict[str, Any]):
        """Broadcast a message to all connections subscribed to a channel."""
        clients = await self.gateway.client_manager.get_clients_by_channel(channel)
        
        for client in clients:
            if client.client_id in self._connections:
                try:
                    ws = self._connections[client.client_id]
                    await ws.send(json.dumps(message))
                except Exception as e:
                    self.logger.error(f"Broadcast error for {client.client_id}: {e}")
    
    async def _cleanup_loop(self):
        """Periodic cleanup of dead connections."""
        while True:
            try:
                await asyncio.sleep(30)
                await self.gateway.client_manager.cleanup_dead_clients()
            except asyncio.CancelledError:
                break
            except Exception as e:
                self.logger.error(f"Cleanup error: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get WebSocket statistics."""
        return {
            "total_connections": len(self._connections),
            "active_connections": len([
                c for c in self._connections.values()
            ]),
        }
