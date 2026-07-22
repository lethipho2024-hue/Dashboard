"""
ZBGym Dashboard Gateway
======================

A realtime communication layer between ZBGym Framework and Dashboard.
Provides WebSocket and REST API for real-time updates.
"""

__version__ = "1.0.0"
__author__ = "ZBGym Team"

from .gateway import DashboardGateway
from .config import GatewayConfig
from .channels import Channel, ChannelType

__all__ = [
    "DashboardGateway",
    "GatewayConfig", 
    "Channel",
    "ChannelType",
]
