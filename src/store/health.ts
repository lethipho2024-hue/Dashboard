// Health state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface HealthStatus {
  health_score: number
  module_status: Record<string, string>
  warnings: string[]
  errors: string[]
  crash_count: number
  temperature_celsius: number | null
  lastUpdate: Date
}

interface HealthStore {
  status: HealthStatus
  history: HealthStatus[]
  stats: {
    healthy_modules: number
    warning_modules: number
    error_modules: number
    warning_count: number
    error_count: number
  }
  isLoading: boolean
}

type HealthAction =
  | { type: 'UPDATE_HEALTH'; payload: Partial<HealthStatus> }
  | { type: 'ADD_TO_HISTORY'; payload: HealthStatus }
  | { type: 'SET_LOADING'; payload: boolean }

const MAX_HISTORY = 100

const initialState: HealthStore = {
  status: {
    health_score: 100,
    module_status: {},
    warnings: [],
    errors: [],
    crash_count: 0,
    temperature_celsius: null,
    lastUpdate: new Date(),
  },
  history: [],
  stats: {
    healthy_modules: 0,
    warning_modules: 0,
    error_modules: 0,
    warning_count: 0,
    error_count: 0,
  },
  isLoading: true,
}

function calculateStats(status: HealthStatus) {
  const moduleValues = Object.values(status.module_status)
  return {
    healthy_modules: moduleValues.filter(s => s === 'healthy').length,
    warning_modules: moduleValues.filter(s => s === 'warning').length,
    error_modules: moduleValues.filter(s => s === 'error').length,
    warning_count: status.warnings.length,
    error_count: status.errors.length,
  }
}

function healthReducer(state: HealthStore, action: HealthAction): HealthStore {
  switch (action.type) {
    case 'UPDATE_HEALTH':
      const newStatus = { ...state.status, ...action.payload, lastUpdate: new Date() }
      const newHistory = [...state.history, newStatus].slice(-MAX_HISTORY)
      return { 
        ...state, 
        status: newStatus,
        history: newHistory,
        stats: calculateStats(newStatus),
        isLoading: false,
      }
    case 'ADD_TO_HISTORY':
      const updatedHistory = [...state.history, action.payload].slice(-MAX_HISTORY)
      return { 
        ...state, 
        history: updatedHistory,
        stats: calculateStats(action.payload),
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface HealthContextType extends HealthStore {
  getHealthColor: () => string
  getHealthLabel: () => string
  hasWarnings: () => boolean
  hasErrors: () => boolean
  getHealthChartData: (count?: number) => { time: string; score: number }[]
}

const HealthContext = createContext<HealthContextType | null>(null)

interface HealthProviderProps {
  children: ReactNode
}

export function HealthProvider({ children }: HealthProviderProps) {
  const [state, dispatch] = useReducer(healthReducer, initialState)

  const handleHealthUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as {
      health_score?: number
      module_status?: Record<string, string>
      warnings?: string[]
      errors?: string[]
      crash_count?: number
      temperature_celsius?: number | null
    }

    dispatch({ type: 'UPDATE_HEALTH', payload: data })
  }, [])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.HEALTH, handleHealthUpdate)
    
    const history = ws.getHistory(CHANNELS.HEALTH, 1)
    if (history.length > 0) {
      handleHealthUpdate(history[history.length - 1])
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handleHealthUpdate])

  const getHealthColor = useCallback(() => {
    const score = state.status.health_score
    if (score >= 80) return 'green'
    if (score >= 50) return 'yellow'
    return 'red'
  }, [state.status.health_score])

  const getHealthLabel = useCallback(() => {
    const score = state.status.health_score
    if (score >= 80) return 'Healthy'
    if (score >= 50) return 'Degraded'
    return 'Critical'
  }, [state.status.health_score])

  const hasWarnings = useCallback(() => {
    return state.status.warnings.length > 0 || state.stats.warning_modules > 0
  }, [state.status.warnings, state.stats.warning_modules])

  const hasErrors = useCallback(() => {
    return state.status.errors.length > 0 || state.stats.error_modules > 0
  }, [state.status.errors, state.stats.error_modules])

  const getHealthChartData = useCallback((count: number = 50) => {
    return state.history.slice(-count).map((h, i) => ({
      time: i.toString(),
      score: h.health_score,
    }))
  }, [state.history])

  const value: HealthContextType = {
    ...state,
    getHealthColor,
    getHealthLabel,
    hasWarnings,
    hasErrors,
    getHealthChartData,
  }

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  )
}

export function useHealth(): HealthContextType {
  const context = useContext(HealthContext)
  if (!context) {
    throw new Error('useHealth must be used within HealthProvider')
  }
  return context
}
