// Connection state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { 
  getDashboardWs, 
  ConnectionStatus, 
  ConnectionState,
  HeartbeatState,
  ChannelMessage,
  DashboardWsConfig 
} from '../services/websocket'

interface ConnectionStore {
  status: ConnectionStatus
  latency: number
  messageRate: number
  droppedMessages: number
  reconnectAttempts: number
  lastConnected: Date | null
  lastDisconnected: Date | null
  lastReceivedPacket: Date | null
  heartbeat: HeartbeatState
  isHealthy: boolean
  subscribedChannels: string[]
}

type ConnectionAction =
  | { type: 'SET_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_CONNECTION_STATE'; payload: ConnectionState }
  | { type: 'SET_HEARTBEAT_STATE'; payload: HeartbeatState }
  | { type: 'SET_SUBSCRIBED_CHANNELS'; payload: string[] }

const initialState: ConnectionStore = {
  status: 'disconnected',
  latency: 0,
  messageRate: 0,
  droppedMessages: 0,
  reconnectAttempts: 0,
  lastConnected: null,
  lastDisconnected: null,
  lastReceivedPacket: null,
  heartbeat: {
    lastHeartbeat: null,
    lastAck: null,
    delay: 0,
    missed: 0,
  },
  isHealthy: false,
  subscribedChannels: [],
}

function connectionReducer(state: ConnectionStore, action: ConnectionAction): ConnectionStore {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        latency: action.payload.latency,
        messageRate: action.payload.messageRate,
        droppedMessages: action.payload.droppedMessages,
        reconnectAttempts: action.payload.reconnectAttempts,
        lastConnected: action.payload.lastConnected || state.lastConnected,
        lastDisconnected: action.payload.lastDisconnected || state.lastDisconnected,
        lastReceivedPacket: action.payload.lastReceivedPacket || state.lastReceivedPacket,
        isHealthy: action.payload.status === 'connected',
      }
    case 'SET_HEARTBEAT_STATE':
      return { ...state, heartbeat: action.payload }
    case 'SET_SUBSCRIBED_CHANNELS':
      return { ...state, subscribedChannels: action.payload }
    default:
      return state
  }
}

interface ConnectionContextType extends ConnectionStore {
  connect: () => void
  disconnect: () => void
  reconnect: () => void
}

const ConnectionContext = createContext<ConnectionContextType | null>(null)

interface ConnectionProviderProps {
  children: ReactNode
  config?: DashboardWsConfig
}

export function ConnectionProvider({ children, config }: ConnectionProviderProps) {
  const [state, dispatch] = useReducer(connectionReducer, initialState)

  const updateStatus = useCallback((status: ConnectionStatus) => {
    dispatch({ type: 'SET_STATUS', payload: status })
  }, [])

  const updateConnectionState = useCallback(() => {
    const ws = getDashboardWs()
    const connState = ws.getConnectionState()
    dispatch({ type: 'SET_CONNECTION_STATE', payload: connState })
    
    const hbState = ws.getHeartbeatState()
    dispatch({ type: 'SET_HEARTBEAT_STATE', payload: hbState })
    
    const channels = ws.getSubscribedChannels()
    dispatch({ type: 'SET_SUBSCRIBED_CHANNELS', payload: channels })
  }, [])

  useEffect(() => {
    const ws = getDashboardWs(config)

    const unsubStatus = ws.onStatusChange((status) => {
      updateStatus(status)
      updateConnectionState()
    })

    // Poll connection state periodically
    const interval = setInterval(updateConnectionState, 1000)

    return () => {
      unsubStatus()
      clearInterval(interval)
    }
  }, [config, updateStatus, updateConnectionState])

  const connect = useCallback(() => {
    getDashboardWs().connect()
  }, [])

  const disconnect = useCallback(() => {
    getDashboardWs().disconnect()
  }, [])

  const reconnect = useCallback(() => {
    getDashboardWs().disconnect()
    setTimeout(() => getDashboardWs().connect(), 500)
  }, [])

  const value: ConnectionContextType = {
    ...state,
    connect,
    disconnect,
    reconnect,
  }

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  )
}

export function useConnection(): ConnectionContextType {
  const context = useContext(ConnectionContext)
  if (!context) {
    throw new Error('useConnection must be used within ConnectionProvider')
  }
  return context
}

// Hook for channel updates
export function useChannelUpdate(channel: string, callback: (message: ChannelMessage) => void) {
  useEffect(() => {
    const ws = getDashboardWs()
    return ws.subscribe(channel as any, callback)
  }, [channel, callback])
}
