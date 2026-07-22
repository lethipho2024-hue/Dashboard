# ZBGym Dashboard Gateway

Realtime communication layer between ZBGym Framework and Dashboard.

## Architecture

```
┌─────────────────┐
│  ZBGym Framework│
└────────┬────────┘
         │
┌────────▼────────┐
│ Dashboard Gateway│
├─────────────────┤
│ • Channel Mgr   │
│ • Client Mgr    │
│ • Auth Manager  │
│ • License Valid  │
│ • REST API      │
│ • WebSocket     │
└────────┬────────┘
         │
┌────────▼────────┐
│React Dashboard │
└────────────────┘
```

## Channels

- **framework**: Framework status, version, uptime
- **kernel**: Kernel running, tick count, tick rate, stage
- **metrics**: FPS, CPU, memory, GPU, rewards
- **health**: Health score, module status, warnings, errors
- **events**: All framework events
- **replay**: Recording status, replay size
- **ai**: Loaded models, inference queue

## REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/framework` | GET | Framework status |
| `/kernel` | GET | Kernel status |
| `/metrics` | GET | Metrics snapshot |
| `/events` | GET | Event log |
| `/health/status` | GET | Health status |
| `/replay` | GET | Replay status |
| `/modules` | GET | Module list |
| `/license` | GET | License info |
| `/license/activate` | POST | Activate license |
| `/stats` | GET | Gateway statistics |
| `/channels` | GET | Available channels |
| `/ws` | WS | WebSocket endpoint |

## WebSocket Messages

### Client → Server

```json
{"type": "auth", "method": "license_key", "credentials": "..."}
{"type": "subscribe", "channel": "metrics"}
{"type": "unsubscribe", "channel": "metrics"}
{"type": "heartbeat"}
{"type": "ping"}
```

### Server → Client

```json
{"type": "connected", "client_id": "..."}
{"type": "auth_success"}
{"type": "subscribed", "channel": "metrics", "history": [...]}
{"channel": "metrics", "type": "metrics_update", "data": {...}}
{"type": "heartbeat_ack"}
{"type": "pong"}
```

## License Types

- **Trial**: 1 client, 14 days
- **Developer**: 3 clients, unlimited
- **Professional**: 10 clients, custom plugins
- **Enterprise**: 100 clients, SLA guarantee

## Running

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python -m dashboard_gateway.main

# Or with uvicorn
uvicorn dashboard_gateway.main:app --host 0.0.0.0 --port 8080
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| GATEWAY_HOST | 0.0.0.0 | Server host |
| GATEWAY_PORT | 8080 | Server port |
| FRAMEWORK_HOST | localhost | Framework host |
| FRAMEWORK_PORT | 5555 | Framework port |
| LICENSE_KEY | - | License key |
| REQUIRE_AUTH | true | Require authentication |
| LOG_LEVEL | INFO | Log level |
