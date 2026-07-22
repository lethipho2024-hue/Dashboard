// Framework state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface FrameworkStatus {
  running: boolean
  version: string
  uptime_seconds: number
  active_sessions: number
  total_sessions: number
  framework_type: string
  pid: number | null
  lastUpdate: Date
}

interface FrameworkStore {
  status: FrameworkStatus
  isLoading: boolean
  error: string | null
}

type FrameworkAction =
  | { type: 'UPDATE_STATUS'; payload: FrameworkStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: FrameworkStore = {
  status: {
    running: false,
    version: '0.0.0',
    uptime_seconds: 0,
    active_sessions: 0,
    total_sessions: 0,
    framework_type: 'Unknown',
    pid: null,
    lastUpdate: new Date(),
  },
  isLoading: true,
  error: null,
}

function frameworkReducer(state: FrameworkStore, action: FrameworkAction): FrameworkStore {
  switch (action.type) {
    case 'UPDATE_STATUS':
      return { ...state, status: action.payload, isLoading: false, error: null }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    default:
      return state
  }
}

interface FrameworkContextType extends FrameworkStore {
  getUptimeFormatted: () => string
}

const FrameworkContext = createContext<FrameworkContextType | null>(null)

interface FrameworkProviderProps {
  children: ReactNode
}

export function FrameworkProvider({ children }: FrameworkProviderProps) {
  const [state, dispatch] = useReducer(frameworkReducer, initialState)

  const handleFrameworkUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as {
      running?: boolean
      version?: string
      uptime_seconds?: number
      active_sessions?: number
      total_sessions?: number
      framework_type?: string
      pid?: number
    }

    dispatch({
      type: 'UPDATE_STATUS',
      payload: {
        running: data.running ?? state.status.running,
        version: data.version ?? state.status.version,
        uptime_seconds: data.uptime_seconds ?? state.status.uptime_seconds,
        active_sessions: data.active_sessions ?? state.status.active_sessions,
        total_sessions: data.total_sessions ?? state.status.total_sessions,
        framework_type: data.framework_type ?? state.status.framework_type,
        pid: data.pid ?? state.status.pid,
        lastUpdate: new Date(),
      },
    })
  }, [state.status])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.FRAMEWORK, handleFrameworkUpdate)
    
    // Get history
    const history = ws.getHistory(CHANNELS.FRAMEWORK, 1)
    if (history.length > 0) {
      handleFrameworkUpdate(history[history.length - 1])
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handleFrameworkUpdate])

  const getUptimeFormatted = useCallback(() => {
    const seconds = state.status.uptime_seconds
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [state.status.uptime_seconds])

  const value: FrameworkContextType = {
    ...state,
    getUptimeFormatted,
  }

  return (
    <FrameworkContext.Provider value={value}>
      {children}
    </FrameworkContext.Provider>
  )
}

export function useFramework(): FrameworkContextType {
  const context = useContext(FrameworkContext)
  if (!context) {
    throw new Error('useFramework must be used within FrameworkProvider')
  }
  return context
}
