// Metrics state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface MetricsSnapshot {
  fps: number
  tick_time_ms: number
  cpu_usage_percent: number
  memory_usage_mb: number
  gpu_usage_percent: number
  vram_usage_mb: number
  latency_ms: number
  inference_time_ms: number
  network_usage_mbps: number
  reward_rate: number
  episode_count: number
  replay_size_mb: number
  training_speed: number
  timestamp: string
}

interface MetricsStore {
  current: MetricsSnapshot
  history: MetricsSnapshot[]
  stats: {
    fps_avg: number
    cpu_avg: number
    memory_avg: number
    reward_rate_avg: number
    total_episodes: number
  }
  isLoading: boolean
}

type MetricsAction =
  | { type: 'UPDATE_METRICS'; payload: Partial<MetricsSnapshot> }
  | { type: 'ADD_TO_HISTORY'; payload: MetricsSnapshot }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_STATS'; payload: MetricsStore['stats'] }

const MAX_HISTORY = 500

const initialState: MetricsStore = {
  current: {
    fps: 0,
    tick_time_ms: 0,
    cpu_usage_percent: 0,
    memory_usage_mb: 0,
    gpu_usage_percent: 0,
    vram_usage_mb: 0,
    latency_ms: 0,
    inference_time_ms: 0,
    network_usage_mbps: 0,
    reward_rate: 0,
    episode_count: 0,
    replay_size_mb: 0,
    training_speed: 0,
    timestamp: new Date().toISOString(),
  },
  history: [],
  stats: {
    fps_avg: 0,
    cpu_avg: 0,
    memory_avg: 0,
    reward_rate_avg: 0,
    total_episodes: 0,
  },
  isLoading: true,
}

function calculateStats(history: MetricsSnapshot[]) {
  const recent = history.slice(-100)
  if (recent.length === 0) {
    return { fps_avg: 0, cpu_avg: 0, memory_avg: 0, reward_rate_avg: 0, total_episodes: 0 }
  }
  
  return {
    fps_avg: recent.reduce((sum, m) => sum + m.fps, 0) / recent.length,
    cpu_avg: recent.reduce((sum, m) => sum + m.cpu_usage_percent, 0) / recent.length,
    memory_avg: recent.reduce((sum, m) => sum + m.memory_usage_mb, 0) / recent.length,
    reward_rate_avg: recent.reduce((sum, m) => sum + m.reward_rate, 0) / recent.length,
    total_episodes: recent[recent.length - 1].episode_count,
  }
}

function metricsReducer(state: MetricsStore, action: MetricsAction): MetricsStore {
  switch (action.type) {
    case 'UPDATE_METRICS':
      const newCurrent = { ...state.current, ...action.payload, timestamp: new Date().toISOString() }
      const newHistory = [...state.history, newCurrent].slice(-MAX_HISTORY)
      return { 
        ...state, 
        current: newCurrent,
        history: newHistory,
        stats: calculateStats(newHistory),
        isLoading: false,
      }
    case 'ADD_TO_HISTORY':
      const updatedHistory = [...state.history, action.payload].slice(-MAX_HISTORY)
      return { 
        ...state, 
        history: updatedHistory,
        stats: calculateStats(updatedHistory),
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'UPDATE_STATS':
      return { ...state, stats: action.payload }
    default:
      return state
  }
}

interface MetricsContextType extends MetricsStore {
  getChartData: (count?: number) => { time: string; fps: number; cpu: number; memory: number }[]
  getRewardChartData: (count?: number) => { time: string; reward: number }[]
}

const MetricsContext = createContext<MetricsContextType | null>(null)

interface MetricsProviderProps {
  children: ReactNode
}

export function MetricsProvider({ children }: MetricsProviderProps) {
  const [state, dispatch] = useReducer(metricsReducer, initialState)

  const handleMetricsUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as Partial<MetricsSnapshot>
    dispatch({ type: 'UPDATE_METRICS', payload: data })
  }, [])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.METRICS, handleMetricsUpdate)
    
    const history = ws.getHistory(CHANNELS.METRICS, 50)
    if (history.length > 0) {
      for (const msg of history) {
        handleMetricsUpdate(msg)
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handleMetricsUpdate])

  const getChartData = useCallback((count: number = 50) => {
    return state.history.slice(-count).map((m, i) => ({
      time: i.toString(),
      fps: m.fps,
      cpu: m.cpu_usage_percent,
      memory: m.memory_usage_mb,
    }))
  }, [state.history])

  const getRewardChartData = useCallback((count: number = 50) => {
    return state.history.slice(-count).map((m, i) => ({
      time: i.toString(),
      reward: m.reward_rate,
    }))
  }, [state.history])

  const value: MetricsContextType = {
    ...state,
    getChartData,
    getRewardChartData,
  }

  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  )
}

export function useMetrics(): MetricsContextType {
  const context = useContext(MetricsContext)
  if (!context) {
    throw new Error('useMetrics must be used within MetricsProvider')
  }
  return context
}
