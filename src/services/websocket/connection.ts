// WebSocket connection management

import { ConnectionStatus, ConnectionState, IncomingMessage } from './types'

export interface ConnectionConfig {
  url: string
  protocols?: string[]
}

export class ConnectionManager {
  private ws: WebSocket | null = null
  private config: ConnectionConfig
  private state: ConnectionState
  private messageCount: number = 0
  private lastMessageCountReset: number = Date.now()
  private messageRateInterval: ReturnType<typeof setInterval> | null = null
  private listeners: {
    open: Set<() => void>
    close: Set<(code: number, reason: string) => void>
    error: Set<(error: Event) => void>
    message: Set<(message: IncomingMessage) => void>
    statusChange: Set<(status: ConnectionStatus) => void>
  } = {
    open: new Set(),
    close: new Set(),
    error: new Set(),
    message: new Set(),
    statusChange: new Set(),
  }

  constructor(url: string) {
    this.config = { url }
    this.state = {
      status: 'disconnected',
      reconnectAttempts: 0,
      latency: 0,
      messageRate: 0,
      droppedMessages: 0,
    }
  }

  getState(): ConnectionState {
    return { ...this.state }
  }

  getStatus(): ConnectionStatus {
    return this.state.status
  }

  getLatency(): number {
    return this.state.latency
  }

  getMessageRate(): number {
    return this.state.messageRate
  }

  setStatus(status: ConnectionStatus): void {
    const previousStatus = this.state.status
    this.state.status = status
    
    if (status === 'connected' && previousStatus !== 'connected') {
      this.state.lastConnected = new Date()
      this.state.reconnectAttempts = 0
    } else if (status === 'disconnected' || status === 'reconnecting') {
      this.state.lastDisconnected = new Date()
    }

    if (previousStatus !== status) {
      this.notifyStatusChange(status)
    }
  }

  incrementReconnectAttempts(): void {
    this.state.reconnectAttempts++
  }

  setLatency(latency: number): void {
    this.state.latency = latency
  }

  incrementDroppedMessages(): void {
    this.state.droppedMessages++
  }

  getLastReceivedPacket(): Date | undefined {
    return this.state.lastReceivedPacket
  }

  // Event listeners
  onOpen(callback: () => void): () => void {
    this.listeners.open.add(callback)
    return () => this.listeners.open.delete(callback)
  }

  onClose(callback: (code: number, reason: string) => void): () => void {
    this.listeners.close.add(callback)
    return () => this.listeners.close.delete(callback)
  }

  onError(callback: (error: Event) => void): () => void {
    this.listeners.error.add(callback)
    return () => this.listeners.error.delete(callback)
  }

  onMessage(callback: (message: IncomingMessage) => void): () => void {
    this.listeners.message.add(callback)
    return () => this.listeners.message.delete(callback)
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.statusChange.add(callback)
    return () => this.listeners.statusChange.delete(callback)
  }

  // Connection methods
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return
    }

    this.setStatus('connecting')
    
    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols)
      this.setupEventHandlers()
    } catch (error) {
      console.error('[Connection] Failed to create WebSocket:', error)
      this.setStatus('disconnected')
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('[Connection] WebSocket opened')
      this.setStatus('connected')
      this.startMessageRateTracking()
      this.notifyOpen()
    }

    this.ws.onclose = (event) => {
      console.log('[Connection] WebSocket closed:', event.code, event.reason)
      this.stopMessageRateTracking()
      this.notifyClose(event.code, event.reason || 'Connection closed')
    }

    this.ws.onerror = (error) => {
      console.error('[Connection] WebSocket error:', error)
      this.notifyError(error)
    }

    this.ws.onmessage = (event) => {
      this.state.lastReceivedPacket = new Date()
      this.messageCount++
      
      try {
        const message = JSON.parse(event.data) as IncomingMessage
        this.notifyMessage(message)
      } catch (error) {
        console.warn('[Connection] Failed to parse message:', event.data)
      }
    }
  }

  send(data: object): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[Connection] Cannot send - WebSocket not open')
      return false
    }

    try {
      this.ws.send(JSON.stringify(data))
      return true
    } catch (error) {
      console.error('[Connection] Failed to send:', error)
      return false
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.setStatus('disconnected')
  }

  // Notification helpers
  private notifyOpen(): void {
    for (const callback of this.listeners.open) {
      try {
        callback()
      } catch (error) {
        console.error('[Connection] Error in open callback:', error)
      }
    }
  }

  private notifyClose(code: number, reason: string): void {
    for (const callback of this.listeners.close) {
      try {
        callback(code, reason)
      } catch (error) {
        console.error('[Connection] Error in close callback:', error)
      }
    }
  }

  private notifyError(error: Event): void {
    for (const callback of this.listeners.error) {
      try {
        callback(error)
      } catch (err) {
        console.error('[Connection] Error in error callback:', err)
      }
    }
  }

  private notifyMessage(message: IncomingMessage): void {
    for (const callback of this.listeners.message) {
      try {
        callback(message)
      } catch (error) {
        console.error('[Connection] Error in message callback:', error)
      }
    }
  }

  private notifyStatusChange(status: ConnectionStatus): void {
    for (const callback of this.listeners.statusChange) {
      try {
        callback(status)
      } catch (error) {
        console.error('[Connection] Error in status change callback:', error)
      }
    }
  }

  private startMessageRateTracking(): void {
    this.messageCount = 0
    this.lastMessageCountReset = Date.now()
    
    this.messageRateInterval = setInterval(() => {
      const elapsed = (Date.now() - this.lastMessageCountReset) / 1000
      this.state.messageRate = elapsed > 0 ? this.messageCount / elapsed : 0
      this.messageCount = 0
      this.lastMessageCountReset = Date.now()
    }, 1000)
  }

  private stopMessageRateTracking(): void {
    if (this.messageRateInterval) {
      clearInterval(this.messageRateInterval)
      this.messageRateInterval = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  destroy(): void {
    this.disconnect()
    this.listeners.open.clear()
    this.listeners.close.clear()
    this.listeners.error.clear()
    this.listeners.message.clear()
    this.listeners.statusChange.clear()
    this.stopMessageRateTracking()
  }
}
