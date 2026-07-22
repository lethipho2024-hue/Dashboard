// Dashboard WebSocket Client - Main entry point
// Manages single WebSocket connection to Dashboard Gateway

import { 
  ConnectionStatus, 
  ChannelMessage, 
  ChannelName, 
  ALL_CHANNELS,
  CHANNEL_CONFIG,
  IncomingMessage,
  ConnectedMessage,
  ChannelMessage as WSChannelMessage,
  SubscribedMessage,
  ErrorMessage,
  HeartbeatAckMessage,
} from './types'
import { ConnectionManager } from './connection'
import { SubscriptionManager } from './subscriptions'
import { HeartbeatManager } from './heartbeat'
import { ReconnectManager } from './reconnect'

export interface DashboardWsConfig {
  gatewayUrl?: string
  autoConnect?: boolean
  autoSubscribe?: boolean
  requireAuth?: boolean
  licenseKey?: string
}

const DEFAULT_CONFIG: Required<DashboardWsConfig> = {
  gatewayUrl: 'ws://localhost:8080/ws',
  autoConnect: true,
  autoSubscribe: true,
  requireAuth: false,
  licenseKey: '',
}

type StatusChangeCallback = (status: ConnectionStatus) => void
type ChannelCallback = (channel: ChannelName, message: ChannelMessage) => void
type NotificationCallback = (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success') => void

class DashboardWebSocketClient {
  private static instance: DashboardWebSocketClient | null = null
  
  private connection: ConnectionManager
  private subscriptions: SubscriptionManager
  private heartbeat: HeartbeatManager
  private reconnect: ReconnectManager
  private config: Required<DashboardWsConfig>
  
  private statusListeners: Set<StatusChangeCallback> = new Set()
  private channelListeners: Set<ChannelCallback> = new Set()
  private notificationListeners: Set<NotificationCallback> = new Set()
  
  private isConnecting: boolean = false
  private shouldReconnect: boolean = true
  private isDestroyed: boolean = false

  private constructor(config: DashboardWsConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    this.connection = new ConnectionManager(this.config.gatewayUrl)
    this.subscriptions = new SubscriptionManager()
    this.heartbeat = new HeartbeatManager()
    this.reconnect = new ReconnectManager()
    
    this.setupConnectionHandlers()
    
    if (this.config.autoConnect) {
      this.connect()
    }
  }

  static getInstance(config?: DashboardWsConfig): DashboardWebSocketClient {
    if (!DashboardWebSocketClient.instance || config) {
      DashboardWebSocketClient.instance = new DashboardWebSocketClient(config)
    }
    return DashboardWebSocketClient.instance
  }

  static resetInstance(): void {
    if (DashboardWebSocketClient.instance) {
      DashboardWebSocketClient.instance.destroy()
      DashboardWebSocketClient.instance = null
    }
  }

  // Connection handlers
  private setupConnectionHandlers(): void {
    this.connection.onOpen(() => {
      console.log('[DashboardWS] Connected')
      this.isConnecting = false
      
      // Authenticate if required
      if (this.config.requireAuth && this.config.licenseKey) {
        this.authenticate(this.config.licenseKey)
      }
      
      // Auto-subscribe to channels
      if (this.config.autoSubscribe) {
        this.autoSubscribeChannels()
      }
      
      // Start heartbeat
      this.heartbeat.start(
        () => this.sendHeartbeat(),
        () => this.handleHeartbeatTimeout()
      )
      
      this.notifyStatusChange('connected')
    })

    this.connection.onClose((code, reason) => {
      console.log('[DashboardWS] Disconnected:', code, reason)
      this.isConnecting = false
      this.heartbeat.stop()
      
      if (this.shouldReconnect && !this.isDestroyed) {
        this.handleDisconnect()
      } else {
        this.connection.setStatus('disconnected')
        this.notifyStatusChange('disconnected')
      }
    })

    this.connection.onError((error) => {
      console.error('[DashboardWS] Error:', error)
      this.isConnecting = false
    })

    this.connection.onMessage((message) => {
      this.handleMessage(message)
    })
  }

  private handleMessage(message: IncomingMessage): void {
    switch (message.type) {
      case 'connected':
        this.handleConnected(message as ConnectedMessage)
        break
        
      case 'auth_success':
        console.log('[DashboardWS] Authenticated')
        this.notifyNotification('Connected', 'Successfully connected to Gateway', 'success')
        break
        
      case 'auth_failed':
        console.error('[DashboardWS] Auth failed:', (message as ErrorMessage).message)
        this.notifyNotification('Auth Failed', (message as ErrorMessage).message, 'error')
        break
        
      case 'subscribed':
        const subMsg = message as SubscribedMessage
        console.log(`[DashboardWS] Subscribed to ${subMsg.channel}`)
        // Broadcast history if available
        if (subMsg.history) {
          for (const histMsg of subMsg.history) {
            this.subscriptions.broadcast(subMsg.channel, histMsg as ChannelMessage)
          }
        }
        break
        
      case 'subscribe_failed':
        console.warn(`[DashboardWS] Subscribe failed:`, (message as ErrorMessage).message)
        break
        
      case 'heartbeat_ack':
        this.heartbeat.receiveAck()
        break
        
      case 'pong':
        // Ping response for latency measurement
        break
        
      case 'error':
        console.error('[DashboardWS] Server error:', (message as ErrorMessage).message)
        break
        
      default:
        // Check if this is a channel update
        if (message.channel) {
          const channelMsg: ChannelMessage = {
            channel: message.channel,
            type: message.type || 'update',
            data: message.data as Record<string, unknown> || {},
            timestamp: (message as { timestamp?: string }).timestamp || new Date().toISOString(),
          }
          
          // Broadcast to subscribers
          this.subscriptions.broadcast(message.channel, channelMsg)
          
          // Notify channel listeners
          this.notifyChannelListener(message.channel as ChannelName, channelMsg)
        }
        break
    }
  }

  private handleConnected(message: ConnectedMessage): void {
    console.log(`[DashboardWS] Client connected with ID: ${message.client_id}`)
    this.notifyNotification('Gateway Connected', 'Dashboard connected to Gateway', 'success')
  }

  private handleDisconnect(): void {
    const delay = this.reconnect.scheduleReconnect(() => {
      if (!this.isDestroyed && this.shouldReconnect) {
        this.connection.setStatus('reconnecting')
        this.notifyStatusChange('reconnecting')
        this.connect()
      }
    })

    if (delay === -1) {
      console.log('[DashboardWS] Max reconnect attempts reached')
      this.connection.setStatus('gateway_unavailable')
      this.notifyStatusChange('gateway_unavailable')
      this.notifyNotification('Connection Lost', 'Unable to reconnect to Gateway', 'error')
    } else {
      console.log(`[DashboardWS] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.reconnect.getAttempts()}/${this.reconnect.getMaxAttempts()})`)
    }
  }

  private handleHeartbeatTimeout(): void {
    console.warn('[DashboardWS] Heartbeat timeout')
    this.connection.incrementDroppedMessages()
    
    if (!this.heartbeat.isHealthy()) {
      console.error('[DashboardWS] Connection unhealthy, reconnecting...')
      this.reconnect.reset()
      this.connection.disconnect()
    }
  }

  // Public API
  connect(): void {
    if (this.isConnecting || this.connection.isConnected() || this.isDestroyed) {
      return
    }

    this.isConnecting = true
    this.connection.connect()
  }

  disconnect(): void {
    this.shouldReconnect = false
    this.reconnect.stop()
    this.heartbeat.stop()
    this.connection.disconnect()
  }

  destroy(): void {
    this.isDestroyed = true
    this.shouldReconnect = false
    this.reconnect.stop()
    this.heartbeat.stop()
    this.connection.destroy()
    this.subscriptions.unsubscribeAllGlobal()
    this.statusListeners.clear()
    this.channelListeners.clear()
    this.notificationListeners.clear()
    DashboardWebSocketClient.instance = null
  }

  // Authentication
  authenticate(licenseKey: string): void {
    this.connection.send({
      type: 'auth',
      method: 'license_key',
      credentials: licenseKey,
    })
  }

  // Channel subscription
  subscribe(channel: ChannelName, callback: (message: ChannelMessage) => void): () => void {
    // Store subscription
    const subscription = this.subscriptions.subscribe(channel, callback)

    // Send subscribe message if connected
    if (this.connection.isConnected()) {
      this.connection.send({
        type: 'subscribe',
        channel: channel,
      })
    }

    return subscription.unsubscribe
  }

  unsubscribe(channel: ChannelName): void {
    this.subscriptions.unsubscribeAll(channel)
    if (this.connection.isConnected()) {
      this.connection.send({
        type: 'unsubscribe',
        channel: channel,
      })
    }
  }

  getHistory(channel: ChannelName, limit: number = 50): ChannelMessage[] {
    return this.subscriptions.getHistory(channel, limit)
  }

  private autoSubscribeChannels(): void {
    for (const channel of ALL_CHANNELS) {
      const config = CHANNEL_CONFIG[channel]
      if (config?.autoSubscribe) {
        this.connection.send({
          type: 'subscribe',
          channel: channel,
        })
      }
    }
  }

  // Heartbeat
  private sendHeartbeat(): void {
    this.connection.send({ type: 'heartbeat' })
  }

  // Event listeners
  onStatusChange(callback: StatusChangeCallback): () => void {
    this.statusListeners.add(callback)
    return () => this.statusListeners.delete(callback)
  }

  onChannelUpdate(callback: ChannelCallback): () => void {
    this.channelListeners.add(callback)
    return () => this.channelListeners.delete(callback)
  }

  onNotification(callback: NotificationCallback): () => void {
    this.notificationListeners.add(callback)
    return () => this.notificationListeners.delete(callback)
  }

  private notifyStatusChange(status: ConnectionStatus): void {
    for (const callback of this.statusListeners) {
      try {
        callback(status)
      } catch (error) {
        console.error('[DashboardWS] Error in status listener:', error)
      }
    }
  }

  private notifyChannelListener(channel: ChannelName, message: ChannelMessage): void {
    for (const callback of this.channelListeners) {
      try {
        callback(channel, message)
      } catch (error) {
        console.error('[DashboardWS] Error in channel listener:', error)
      }
    }
  }

  private notifyNotification(title: string, message: string, type: 'info' | 'warning' | 'error' | 'success'): void {
    for (const callback of this.notificationListeners) {
      try {
        callback(title, message, type)
      } catch (error) {
        console.error('[DashboardWS] Error in notification listener:', error)
      }
    }
  }

  // State getters
  getStatus(): ConnectionStatus {
    return this.connection.getStatus()
  }

  getLatency(): number {
    return this.heartbeat.getDelay()
  }

  getHeartbeatState() {
    return this.heartbeat.getState()
  }

  getConnectionState() {
    return this.connection.getState()
  }

  getSubscribedChannels(): ChannelName[] {
    return this.subscriptions.getSubscribedChannels()
  }

  isConnected(): boolean {
    return this.connection.isConnected()
  }

  isHealthy(): boolean {
    return this.heartbeat.isHealthy() && this.connection.isConnected()
  }
}

// Export singleton getter
export function getDashboardWs(config?: DashboardWsConfig): DashboardWebSocketClient {
  return DashboardWebSocketClient.getInstance(config)
}

export function resetDashboardWs(): void {
  DashboardWebSocketClient.resetInstance()
}

export type { DashboardWebSocketClient }
export { DashboardWebSocketClient }
