// AI/Models state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface AIModel {
  id: string
  name: string
  type: string
  status: 'loaded' | 'loading' | 'unloaded' | 'error'
  vram_mb: number
  inference_count: number
}

export interface AIStatus {
  loaded_models: AIModel[]
  active_models: string[]
  inference_queue_size: number
  current_requests: number
  vram_allocation_mb: number
  token_throughput: number
  inference_latency_ms: number
  lastUpdate: Date
}

interface AIStore {
  status: AIStatus
  history: { time: Date; vram: number; throughput: number; latency: number }[]
  stats: {
    total_models: number
    active_count: number
    total_vram_mb: number
    avg_latency_ms: number
  }
  isLoading: boolean
}

type AIAction =
  | { type: 'UPDATE_AI'; payload: Partial<AIStatus> }
  | { type: 'ADD_TO_HISTORY'; payload: { vram: number; throughput: number; latency: number } }
  | { type: 'SET_LOADING'; payload: boolean }

const MAX_HISTORY = 100

const initialState: AIStore = {
  status: {
    loaded_models: [],
    active_models: [],
    inference_queue_size: 0,
    current_requests: 0,
    vram_allocation_mb: 0,
    token_throughput: 0,
    inference_latency_ms: 0,
    lastUpdate: new Date(),
  },
  history: [],
  stats: {
    total_models: 0,
    active_count: 0,
    total_vram_mb: 0,
    avg_latency_ms: 0,
  },
  isLoading: true,
}

function calculateStats(status: AIStatus, history: AIStore['history']) {
  const recent = history.slice(-50)
  return {
    total_models: status.loaded_models.length,
    active_count: status.active_models.length,
    total_vram_mb: status.vram_allocation_mb,
    avg_latency_ms: recent.length > 0 
      ? recent.reduce((sum, h) => sum + h.latency, 0) / recent.length 
      : 0,
  }
}

function aiReducer(state: AIStore, action: AIAction): AIStore {
  switch (action.type) {
    case 'UPDATE_AI':
      const newStatus = { ...state.status, ...action.payload, lastUpdate: new Date() }
      const newHistory = [...state.history, {
        time: new Date(),
        vram: action.payload.vram_allocation_mb ?? state.status.vram_allocation_mb,
        throughput: action.payload.token_throughput ?? state.status.token_throughput,
        latency: action.payload.inference_latency_ms ?? state.status.inference_latency_ms,
      }].slice(-MAX_HISTORY)
      
      return { 
        ...state, 
        status: newStatus,
        history: newHistory,
        stats: calculateStats(newStatus, newHistory),
        isLoading: false,
      }
    case 'ADD_TO_HISTORY':
      const updatedHistory = [...state.history, {
        time: new Date(),
        ...action.payload,
      }].slice(-MAX_HISTORY)
      return { ...state, history: updatedHistory }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface AIContextType extends AIStore {
  getModelById: (id: string) => AIModel | undefined
  isModelLoaded: (id: string) => boolean
  isModelActive: (id: string) => boolean
  getVRAMFormatted: () => string
  getThroughputFormatted: () => string
}

const AIContext = createContext<AIContextType | null>(null)

interface AIProviderProps {
  children: ReactNode
}

export function AIProvider({ children }: AIProviderProps) {
  const [state, dispatch] = useReducer(aiReducer, initialState)

  const handleAIUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as {
      loaded_models?: AIModel[]
      active_models?: string[]
      inference_queue_size?: number
      current_requests?: number
      vram_allocation_mb?: number
      token_throughput?: number
      inference_latency_ms?: number
    }

    dispatch({ type: 'UPDATE_AI', payload: data })
  }, [])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.AI, handleAIUpdate)
    
    const history = ws.getHistory(CHANNELS.AI, 1)
    if (history.length > 0) {
      handleAIUpdate(history[history.length - 1])
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handleAIUpdate])

  const getModelById = useCallback((id: string) => {
    return state.status.loaded_models.find(m => m.id === id)
  }, [state.status.loaded_models])

  const isModelLoaded = useCallback((id: string) => {
    return state.status.loaded_models.some(m => m.id === id)
  }, [state.status.loaded_models])

  const isModelActive = useCallback((id: string) => {
    return state.status.active_models.includes(id)
  }, [state.status.active_models])

  const getVRAMFormatted = useCallback(() => {
    const vram = state.status.vram_allocation_mb
    if (vram >= 1000) {
      return `${(vram / 1000).toFixed(2)} GB`
    }
    return `${vram.toFixed(0)} MB`
  }, [state.status.vram_allocation_mb])

  const getThroughputFormatted = useCallback(() => {
    const tps = state.status.token_throughput
    if (tps >= 1000) {
      return `${(tps / 1000).toFixed(1)}K tok/s`
    }
    return `${tps.toFixed(1)} tok/s`
  }, [state.status.token_throughput])

  const value: AIContextType = {
    ...state,
    getModelById,
    isModelLoaded,
    isModelActive,
    getVRAMFormatted,
    getThroughputFormatted,
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI(): AIContextType {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within AIProvider')
  }
  return context
}
