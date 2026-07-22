// WebSocket module exports

export { getDashboardWs, resetDashboardWs, DashboardWebSocketClient } from './client'
export type { DashboardWsConfig } from './client'
export { ConnectionManager } from './connection'
export { SubscriptionManager } from './subscriptions'
export { HeartbeatManager } from './heartbeat'
export { ReconnectManager } from './reconnect'
export {
  ConnectionStatus,
  ConnectionState,
  HeartbeatState,
  ChannelMessage,
  ChannelName,
  ChannelConfig,
  WsMessage,
  WsOutgoingMessage,
  IncomingMessage,
  CHANNELS,
  CHANNEL_CONFIG,
  ALL_CHANNELS,
} from './types'
