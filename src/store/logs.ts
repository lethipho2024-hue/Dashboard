// Logs state store (same pattern as events)

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface LogEntry {
  id: string
  level: string
  message: string
  timestamp: string
  source?: string
}

interface LogsStore {
  logs: LogEntry[]
  filteredLogs: LogEntry[]
  levelFilter: string | null
  searchQuery: string
  isAutoScrollEnabled: boolean
  isLoading: boolean
}

type LogsAction =
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'SET_LOGS'; payload: LogEntry[] }
  | { type: 'SET_LEVEL_FILTER'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_AUTO_SCROLL' }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_LOADING'; payload: boolean }

const MAX_LOGS = 1000

const initialState: LogsStore = {
  logs: [],
  filteredLogs: [],
  levelFilter: null,
  searchQuery: '',
  isAutoScrollEnabled: true,
  isLoading: true,
}

function applyFilters(logs: LogEntry[], levelFilter: string | null, searchQuery: string): LogEntry[] {
  let filtered = logs
  
  if (levelFilter) {
    filtered = filtered.filter(log => log.level === levelFilter)
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(log => 
      log.message.toLowerCase().includes(query) ||
      log.source?.toLowerCase().includes(query)
    )
  }
  
  return filtered
}

function logsReducer(state: LogsStore, action: LogsAction): LogsStore {
  switch (action.type) {
    case 'ADD_LOG':
      const newLogs = [action.payload, ...state.logs].slice(0, MAX_LOGS)
      return { 
        ...state, 
        logs: newLogs,
        filteredLogs: applyFilters(newLogs, state.levelFilter, state.searchQuery),
        isLoading: false,
      }
    case 'SET_LOGS':
      return { 
        ...state, 
        logs: action.payload,
        filteredLogs: applyFilters(action.payload, state.levelFilter, state.searchQuery),
        isLoading: false,
      }
    case 'SET_LEVEL_FILTER':
      return { 
        ...state, 
        levelFilter: action.payload,
        filteredLogs: applyFilters(state.logs, action.payload, state.searchQuery),
      }
    case 'SET_SEARCH_QUERY':
      return { 
        ...state, 
        searchQuery: action.payload,
        filteredLogs: applyFilters(state.logs, state.levelFilter, action.payload),
      }
    case 'TOGGLE_AUTO_SCROLL':
      return { ...state, isAutoScrollEnabled: !state.isAutoScrollEnabled }
    case 'CLEAR_LOGS':
      return { 
        ...state, 
        logs: [],
        filteredLogs: [],
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface LogsContextType extends LogsStore {
  setLevelFilter: (level: string | null) => void
  setSearchQuery: (query: string) => void
  toggleAutoScroll: () => void
  clearLogs: () => void
  getLogColor: (level: string) => string
}

const LogsContext = createContext<LogsContextType | null>(null)

interface LogsProviderProps {
  children: ReactNode
}

export function LogsProvider({ children }: LogsProviderProps) {
  const [state, dispatch] = useReducer(logsReducer, initialState)

  const handleLogUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as {
      id?: string
      level?: string
      message?: string
      timestamp?: string
      source?: string
    }

    const log: LogEntry = {
      id: data.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level: data.level || 'info',
      message: data.message || '',
      timestamp: data.timestamp || message.timestamp || new Date().toISOString(),
      source: data.source,
    }

    dispatch({ type: 'ADD_LOG', payload: log })
  }, [])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.LOGS, handleLogUpdate)
    
    const history = ws.getHistory(CHANNELS.LOGS, 100)
    if (history.length > 0) {
      const logs = history.map((msg, idx) => {
        const data = msg.data as Record<string, unknown>
        return {
          id: (data.id as string) || `hist-${idx}`,
          level: (data.level as string) || 'info',
          message: (data.message as string) || '',
          timestamp: msg.timestamp || new Date().toISOString(),
          source: data.source as string | undefined,
        }
      })
      dispatch({ type: 'SET_LOGS', payload: logs.reverse() })
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handleLogUpdate])

  const setLevelFilter = useCallback((level: string | null) => {
    dispatch({ type: 'SET_LEVEL_FILTER', payload: level })
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
  }, [])

  const toggleAutoScroll = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTO_SCROLL' })
  }, [])

  const clearLogs = useCallback(() => {
    dispatch({ type: 'CLEAR_LOGS' })
  }, [])

  const getLogColor = useCallback((level: string) => {
    const colors: Record<string, string> = {
      info: 'blue',
      warning: 'yellow',
      error: 'red',
      debug: 'purple',
    }
    return colors[level] || 'gray'
  }, [])

  const value: LogsContextType = {
    ...state,
    setLevelFilter,
    setSearchQuery,
    toggleAutoScroll,
    clearLogs,
    getLogColor,
  }

  return (
    <LogsContext.Provider value={value}>
      {children}
    </LogsContext.Provider>
  )
}

export function useLogs(): LogsContextType {
  const context = useContext(LogsContext)
  if (!context) {
    throw new Error('useLogs must be used within LogsProvider')
  }
  return context
}
