// ZBGym WebSocket Client with auto-reconnect

import type { WsMessage } from './types'
import { getClient } from './client'

type MessageHandler = (message: WsMessage) => void
type ConnectionHandler = (connected: boolean) => void

class ZBGymWebSocket {
  private ws: WebSocket | null = null
  private url: string = ''
  private messageHandlers: Set<MessageHandler> = new Set()
  private connectionHandlers: Set<ConnectionHandler> = new Set()
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 3000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private shouldReconnect: boolean = true

  connect(baseUrl?: string) {
    this.shouldReconnect = true
    const client = getClient(baseUrl)
    this.url = client.getWebSocketUrl()
    this.establishConnection()
  }

  private establishConnection() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('[ZBGymWS] Connected')
        this.reconnectAttempts = 0
        this.notifyConnectionHandlers(true)
      }

      this.ws.onclose = () => {
        console.log('[ZBGymWS] Disconnected')
        this.notifyConnectionHandlers(false)
        this.scheduleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('[ZBGymWS] Error:', error)
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WsMessage
          this.notifyMessageHandlers(message)
        } catch (e) {
          console.warn('[ZBGymWS] Failed to parse message:', event.data)
        }
      }
    } catch (error) {
      console.error('[ZBGymWS] Failed to create WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[ZBGymWS] Max reconnect attempts reached')
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts

    console.log(`[ZBGymWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.establishConnection()
    }, delay)
  }

  private notifyMessageHandlers(message: WsMessage) {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message)
      } catch (e) {
        console.error('[ZBGymWS] Handler error:', e)
      }
    })
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected)
      } catch (e) {
        console.error('[ZBGymWS] Connection handler error:', e)
      }
    })
  }

  send(message: WsMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[ZBGymWS] Cannot send - not connected')
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  onConnection(handler: ConnectionHandler) {
    this.connectionHandlers.add(handler)
    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
    this.connectionHandlers.clear()
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
let wsInstance: ZBGymWebSocket | null = null

export function getWebSocket(): ZBGymWebSocket {
  if (!wsInstance) {
    wsInstance = new ZBGymWebSocket()
  }
  return wsInstance
}

export function disconnectWebSocket() {
  if (wsInstance) {
    wsInstance.disconnect()
    wsInstance = null
  }
}

export type { ZBGymWebSocket }

export default getWebSocket
