"""
Dashboard Gateway Main Entry Point
=================================
FastAPI application for the Dashboard Gateway.
"""

import asyncio
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from .gateway import DashboardGateway
from .config import GatewayConfig
from .logger import get_logger
from .commands import CommandRouter, CommandSchema
from .auth import AuthRouter, LicenseRouter, AuditRouter, get_auth_router, get_license_router, get_audit_router, AuthMiddleware
from .auth.sessions import get_session_manager


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


# Command endpoints
@app.post("/commands/execute")
async def execute_command(
    request: Request,
    command: CommandSchema,
    sender: str = "dashboard",
    dev_mode: bool = False
):
    """Execute a command."""
    global gateway
    router = CommandRouter(gateway)
    return await router.post_command(command, sender, dev_mode)


@app.get("/commands")
async def list_commands(
    category: Optional[str] = None,
    permission: Optional[str] = None
):
    """List available commands."""
    global gateway
    router = CommandRouter(gateway)
    return await router.get_commands(category, permission)


@app.get("/commands/{command_name}")
async def get_command_info(command_name: str):
    """Get command information."""
    global gateway
    router = CommandRouter(gateway)
    return await router.get_command_info(command_name)


@app.get("/commands/queue")
async def get_command_queue():
    """Get command queue status."""
    global gateway
    router = CommandRouter(gateway)
    return await router.get_queue()


@app.get("/commands/status/{request_id}")
async def get_command_status(request_id: str):
    """Get command execution status."""
    global gateway
    router = CommandRouter(gateway)
    return await router.get_status(request_id)


@app.delete("/commands/queue/{request_id}")
async def cancel_command(request_id: str):
    """Cancel a queued command."""
    global gateway
    router = CommandRouter(gateway)
    return await router.cancel_command(request_id)


@app.get("/commands/history")
async def get_command_history(
    limit: int = 50,
    command: Optional[str] = None,
    status: Optional[str] = None,
    sender: Optional[str] = None
):
    """Get command history."""
    global gateway
    router = CommandRouter(gateway)
    return await router.get_history(limit, command, status, sender)


@app.get("/commands/stats")
async def get_command_stats():
    """Get command dispatcher stats."""
    global gateway
    router = CommandRouter(gateway)
    return await router.get_stats()


@app.post("/commands/validate")
async def validate_command(
    command: CommandSchema,
    sender: str = "dashboard"
):
    """Validate a command without executing."""
    global gateway
    router = CommandRouter(gateway)
    return await router.validate_command(command, sender)


# Auth endpoints
from .auth import LoginRequest

@app.post("/auth/login")
async def login(request: Request, login_data: LoginRequest):
    """User login."""
    router = get_auth_router()
    result = await router.post_login(request, login_data)
    
    # Log login attempt
    audit = get_audit_router()
    audit._logger.log_login(
        username=login_data.username,
        success=result.success,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        error_message=result.message if not result.success else None
    )
    
    return result


@app.post("/auth/logout")
async def logout(request: Request):
    """User logout."""
    from .auth.authentication import get_current_user
    user = None
    try:
        user = get_current_user(request)
    except:
        pass
    
    if user:
        audit = get_audit_router()
        audit._logger.log_logout(
            user_id=user.user_id,
            username=user.username,
            ip_address=request.client.host if request.client else None
        )
    
    router = get_auth_router()
    return await router.post_logout(request, user)


@app.post("/auth/refresh")
async def refresh_token(refresh_data: dict):
    """Refresh access token."""
    from .auth.router import RefreshRequest
    router = get_auth_router()
    return await router.post_refresh(RefreshRequest(**refresh_data))


@app.get("/auth/me")
async def get_me(request: Request):
    """Get current user."""
    router = get_auth_router()
    return await router.get_me(request)


@app.get("/auth/session")
async def get_session(request: Request):
    """Get current session."""
    router = get_auth_router()
    return await router.get_session(request)


@app.post("/auth/change-password")
async def change_password(request: Request, data: dict):
    """Change password."""
    router = get_auth_router()
    return await router.post_change_password(
        request,
        data.get("current_password", ""),
        data.get("new_password", ""),
        request
    )


@app.get("/permissions")
async def get_permissions(request: Request):
    """Get user permissions."""
    router = get_auth_router()
    return await router.get_permissions(request)


@app.get("/roles")
async def get_roles():
    """Get all roles."""
    router = get_auth_router()
    return await router.get_roles()


# License endpoints
@app.get("/license")
async def get_license():
    """Get license info."""
    router = get_license_router()
    return await router.get_license()


@app.post("/license/activate")
async def activate_license(data: dict):
    """Activate license."""
    from .license.router import ActivateRequest
    router = get_license_router()
    return await router.activate(ActivateRequest(**data))


@app.post("/license/deactivate")
async def deactivate_license(license_key: Optional[str] = None):
    """Deactivate license."""
    router = get_license_router()
    return await router.deactivate(license_key)


@app.post("/license/refresh")
async def refresh_license(license_key: Optional[str] = None):
    """Refresh license."""
    router = get_license_router()
    return await router.refresh(license_key)


@app.get("/license/status")
async def get_license_status():
    """Get license status."""
    router = get_license_router()
    return await router.get_status()


@app.post("/license/validate")
async def validate_license(data: dict):
    """Validate license."""
    router = get_license_router()
    return await router.validate(
        data.get("license", {}),
        data.get("hardware_info")
    )


# Audit endpoints
@app.get("/audit/logs")
async def get_audit_logs(
    request: Request,
    event: Optional[str] = None,
    user_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """Get audit logs."""
    router = get_audit_router()
    return await router.get_logs(request, event, user_id, start_date, end_date, limit)


@app.get("/audit/history")
async def get_audit_history(request: Request, limit: int = 100):
    """Get audit history."""
    router = get_audit_router()
    return await router.get_history(request, limit)


@app.get("/audit/stats")
async def get_audit_stats(request: Request):
    """Get audit stats."""
    router = get_audit_router()
    return await router.get_stats(request)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "ZBGym Dashboard Gateway",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "websocket": "/ws",
        "commands": "/commands",
        "auth": "/auth",
        "license": "/license",
        "audit": "/audit",
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
