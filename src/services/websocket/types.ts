// WebSocket Types for Dashboard Gateway

export type ConnectionStatus = 
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'reconnecting'
  | 'offline'
  | 'gateway_unavailable'
  | 'framework_offline'

export interface WsMessage {
  type?: string
  channel?: string
  data?: unknown
  [key: string]: unknown
}

export interface WsOutgoingMessage {
  type: string
  method?: string
  credentials?: string
  channel?: string
  timestamp?: string
}

export interface ConnectedMessage extends WsMessage {
  type: 'connected'
  client_id: string
}

export interface AuthSuccessMessage extends WsMessage {
  type: 'auth_success'
  client_id: string
}

export interface AuthFailedMessage extends WsMessage {
  type: 'auth_failed'
  message: string
}

export interface SubscribedMessage extends WsMessage {
  type: 'subscribed'
  channel: string
  history?: ChannelMessage[]
}

export interface SubscribeFailedMessage extends WsMessage {
  type: 'subscribe_failed'
  channel: string
  message: string
}

export interface HeartbeatAckMessage extends WsMessage {
  type: 'heartbeat_ack'
  timestamp: string
}

export interface PongMessage extends WsMessage {
  type: 'pong'
  timestamp: string
}

export interface ChannelMessage extends WsMessage {
  channel: string
  type: string
  data: Record<string, unknown>
  timestamp: string
}

export interface ErrorMessage extends WsMessage {
  type: 'error'
  message: string
}

export type IncomingMessage =
  | ConnectedMessage
  | AuthSuccessMessage
  | AuthFailedMessage
  | SubscribedMessage
  | SubscribeFailedMessage
  | HeartbeatAckMessage
  | PongMessage
  | ChannelMessage
  | ErrorMessage
  | WsMessage

export interface ConnectionState {
  status: ConnectionStatus
  lastConnected?: Date
  lastDisconnected?: Date
  reconnectAttempts: number
  latency: number
  messageRate: number
  droppedMessages: number
  lastReceivedPacket?: Date
}

export interface HeartbeatState {
  lastHeartbeat: Date | null
  lastAck: Date | null
  delay: number
  missed: number
}

export interface Subscription {
  channel: string
  callback: (message: ChannelMessage) => void
  unsubscribe: () => void
}

export interface ChannelConfig {
  name: string
  autoSubscribe: boolean
  historySize: number
}

// Channel definitions matching Gateway
export const CHANNELS = {
  FRAMEWORK: 'framework',
  KERNEL: 'kernel',
  METRICS: 'metrics',
  HEALTH: 'health',
  EVENTS: 'events',
  REPLAY: 'replay',
  AI: 'ai',
  TRAINER: 'trainer',
  PLUGINS: 'plugins',
  LOGS: 'logs',
  HEARTBEAT: 'heartbeat',
  SYSTEM: 'system',
} as const

export type ChannelName = typeof CHANNELS[keyof typeof CHANNELS]

export const CHANNEL_CONFIG: Record<ChannelName, ChannelConfig> = {
  [CHANNELS.FRAMEWORK]: { name: CHANNELS.FRAMEWORK, autoSubscribe: true, historySize: 50 },
  [CHANNELS.KERNEL]: { name: CHANNELS.KERNEL, autoSubscribe: true, historySize: 50 },
  [CHANNELS.METRICS]: { name: CHANNELS.METRICS, autoSubscribe: true, historySize: 100 },
  [CHANNELS.HEALTH]: { name: CHANNELS.HEALTH, autoSubscribe: true, historySize: 50 },
  [CHANNELS.EVENTS]: { name: CHANNELS.EVENTS, autoSubscribe: true, historySize: 200 },
  [CHANNELS.REPLAY]: { name: CHANNELS.REPLAY, autoSubscribe: true, historySize: 50 },
  [CHANNELS.AI]: { name: CHANNELS.AI, autoSubscribe: true, historySize: 50 },
  [CHANNELS.TRAINER]: { name: CHANNELS.TRAINER, autoSubscribe: true, historySize: 50 },
  [CHANNELS.PLUGINS]: { name: CHANNELS.PLUGINS, autoSubscribe: true, historySize: 50 },
  [CHANNELS.LOGS]: { name: CHANNELS.LOGS, autoSubscribe: true, historySize: 200 },
  [CHANNELS.HEARTBEAT]: { name: CHANNELS.HEARTBEAT, autoSubscribe: false, historySize: 10 },
  [CHANNELS.SYSTEM]: { name: CHANNELS.SYSTEM, autoSubscribe: false, historySize: 10 },
}

export const ALL_CHANNELS = Object.values(CHANNELS) as ChannelName[]
