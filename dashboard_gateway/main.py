"""
Dashboard Gateway Main Entry Point
=================================
FastAPI application for the Dashboard Gateway.
"""

import asyncio
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from .gateway import DashboardGateway
from .config import GatewayConfig
from .logger import get_logger


# Global gateway instance
gateway: Optional[DashboardGateway] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager."""
    global gateway
    
    # Get config from environment or use defaults
    config = GatewayConfig.from_env()
    
    # Initialize gateway
    gateway = DashboardGateway(config)
    
    # Start gateway
    await gateway.start()
    
    logger = get_logger("main")
    logger.info(f"Gateway started on {config.host}:{config.port}")
    
    yield
    
    # Shutdown
    if gateway:
        await gateway.stop()
        logger.info("Gateway stopped")


# Create FastAPI app
app = FastAPI(
    title="ZBGym Dashboard Gateway",
    description="Realtime communication layer between ZBGym Framework and Dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket connection endpoint."""
    global gateway
    
    if gateway is None:
        await websocket.close(code=1011, reason="Gateway not initialized")
        return
    
    # Accept connection
    await websocket.accept()
    
    # Register client
    client = await gateway.client_manager.register_client(
        ip_address=websocket.client.host if websocket.client else None,
    )
    
    # Handle connection
    ws_handler = gateway.ws_manager.handler
    await ws_handler.handle_connection(websocket, client.client_id)


# REST API endpoints
@app.get("/health")
async def health():
    """Health check endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_health()
    return {"status": "initializing"}


@app.get("/framework")
async def framework():
    """Framework status endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_framework()
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/kernel")
async def kernel():
    """Kernel status endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_kernel()
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/metrics")
async def metrics(limit: Optional[int] = None):
    """Metrics endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_metrics(limit)
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/events")
async def events(limit: Optional[int] = None, level: Optional[str] = None):
    """Events endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_events(limit, level)
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/health/status")
async def health_status():
    """Health status endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_health_status()
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/replay")
async def replay():
    """Replay status endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_replay()
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/modules")
async def modules():
    """Modules status endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_modules()
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/license")
async def license_info():
    """License information endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_license()
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.post("/license/activate")
async def activate_license(request: Request):
    """Activate license endpoint."""
    global gateway
    body = await request.json()
    license_key = body.get("license_key")
    
    if not license_key:
        raise HTTPException(status_code=400, detail="license_key required")
    
    if gateway:
        return await gateway.router.post_license_activate(license_key)
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/stats")
async def stats():
    """Gateway statistics endpoint."""
    global gateway
    if gateway:
        return await gateway.router.get_stats()
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/channels")
async def channels():
    """List available channels."""
    global gateway
    if gateway:
        return {
            "channels": gateway.channel_manager.get_channel_names(),
            "stats": gateway.channel_manager.get_all_stats(),
        }
    raise HTTPException(status_code=503, detail="Gateway not available")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "ZBGym Dashboard Gateway",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "websocket": "/ws",
    }


def run_server(host: str = "0.0.0.0", port: int = 8080, reload: bool = False):
    """Run the gateway server."""
    uvicorn.run(
        "dashboard_gateway.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
    )


if __name__ == "__main__":
    import sys
    
    host = "0.0.0.0"
    port = 8080
    reload = False
    
    if len(sys.argv) > 1:
        host = sys.argv[1]
    if len(sys.argv) > 2:
        port = int(sys.argv[2])
    if len(sys.argv) > 3 and sys.argv[3] == "--reload":
        reload = True
    
    run_server(host, port, reload)
