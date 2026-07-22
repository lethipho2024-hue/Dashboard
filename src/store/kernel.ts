// Kernel state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface KernelStatus {
  running: boolean
  current_tick: number
  tick_rate: number
  current_stage: string
  scheduler_queue_size: number
  runtime_status: string
  uptime_seconds: number
  tick_duration_ms: number
  lastUpdate: Date
}

interface KernelStore {
  status: KernelStatus
  isLoading: boolean
}

type KernelAction =
  | { type: 'UPDATE_STATUS'; payload: Partial<KernelStatus> }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: KernelStore = {
  status: {
    running: false,
    current_tick: 0,
    tick_rate: 0,
    current_stage: 'idle',
    scheduler_queue_size: 0,
    runtime_status: 'stopped',
    uptime_seconds: 0,
    tick_duration_ms: 0,
    lastUpdate: new Date(),
  },
  isLoading: true,
}

function kernelReducer(state: KernelStore, action: KernelAction): KernelStore {
  switch (action.type) {
    case 'UPDATE_STATUS':
      return { 
        ...state, 
        status: { ...state.status, ...action.payload, lastUpdate: new Date() },
        isLoading: false 
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface KernelContextType extends KernelStore {
  getTickFormatted: () => string
  getStageLabel: () => string
}

const KernelContext = createContext<KernelContextType | null>(null)

interface KernelProviderProps {
  children: ReactNode
}

export function KernelProvider({ children }: KernelProviderProps) {
  const [state, dispatch] = useReducer(kernelReducer, initialState)

  const handleKernelUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as {
      running?: boolean
      current_tick?: number
      tick_rate?: number
      current_stage?: string
      scheduler_queue_size?: number
      runtime_status?: string
      uptime_seconds?: number
    }

    dispatch({
      type: 'UPDATE_STATUS',
      payload: {
        running: data.running ?? state.status.running,
        current_tick: data.current_tick ?? state.status.current_tick,
        tick_rate: data.tick_rate ?? state.status.tick_rate,
        current_stage: data.current_stage ?? state.status.current_stage,
        scheduler_queue_size: data.scheduler_queue_size ?? state.status.scheduler_queue_size,
        runtime_status: data.runtime_status ?? state.status.runtime_status,
        uptime_seconds: data.uptime_seconds ?? state.status.uptime_seconds,
      },
    })
  }, [state.status])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.KERNEL, handleKernelUpdate)
    
    const history = ws.getHistory(CHANNELS.KERNEL, 1)
    if (history.length > 0) {
      handleKernelUpdate(history[history.length - 1])
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handleKernelUpdate])

  const getTickFormatted = useCallback(() => {
    return state.status.current_tick.toLocaleString()
  }, [state.status.current_tick])

  const getStageLabel = useCallback(() => {
    const stages: Record<string, string> = {
      idle: 'Idle',
      training: 'Training',
      evaluating: 'Evaluating',
      inference: 'Inference',
      paused: 'Paused',
    }
    return stages[state.status.current_stage] || state.status.current_stage
  }, [state.status.current_stage])

  const value: KernelContextType = {
    ...state,
    getTickFormatted,
    getStageLabel,
  }

  return (
    <KernelContext.Provider value={value}>
      {children}
    </KernelContext.Provider>
  )
}

export function useKernel(): KernelContextType {
  const context = useContext(KernelContext)
  if (!context) {
    throw new Error('useKernel must be used within KernelProvider')
  }
  return context
}
