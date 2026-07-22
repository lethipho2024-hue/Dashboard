// Events state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface FrameworkEvent {
  id: string
  type: string
  level: string
  timestamp: string
  source: string
  message: string
  data?: Record<string, unknown>
}

interface EventsStore {
  events: FrameworkEvent[]
  filteredEvents: FrameworkEvent[]
  levelFilter: string | null
  sourceFilter: string | null
  stats: {
    total: number
    info: number
    warning: number
    error: number
    debug: number
  }
  isLoading: boolean
}

type EventsAction =
  | { type: 'ADD_EVENT'; payload: FrameworkEvent }
  | { type: 'SET_EVENTS'; payload: FrameworkEvent[] }
  | { type: 'SET_LEVEL_FILTER'; payload: string | null }
  | { type: 'SET_SOURCE_FILTER'; payload: string | null }
  | { type: 'CLEAR_EVENTS' }
  | { type: 'SET_LOADING'; payload: boolean }

const MAX_EVENTS = 500

const initialState: EventsStore = {
  events: [],
  filteredEvents: [],
  levelFilter: null,
  sourceFilter: null,
  stats: {
    total: 0,
    info: 0,
    warning: 0,
    error: 0,
    debug: 0,
  },
  isLoading: true,
}

function calculateStats(events: FrameworkEvent[]) {
  return {
    total: events.length,
    info: events.filter(e => e.level === 'info').length,
    warning: events.filter(e => e.level === 'warning').length,
    error: events.filter(e => e.level === 'error').length,
    debug: events.filter(e => e.level === 'debug').length,
  }
}

function applyFilters(events: FrameworkEvent[], levelFilter: string | null, sourceFilter: string | null): FrameworkEvent[] {
  let filtered = events
  
  if (levelFilter) {
    filtered = filtered.filter(e => e.level === levelFilter)
  }
  
  if (sourceFilter) {
    filtered = filtered.filter(e => e.source === sourceFilter)
  }
  
  return filtered
}

function eventsReducer(state: EventsStore, action: EventsAction): EventsStore {
  switch (action.type) {
    case 'ADD_EVENT':
      const newEvents = [action.payload, ...state.events].slice(0, MAX_EVENTS)
      return { 
        ...state, 
        events: newEvents,
        filteredEvents: applyFilters(newEvents, state.levelFilter, state.sourceFilter),
        stats: calculateStats(newEvents),
        isLoading: false,
      }
    case 'SET_EVENTS':
      return { 
        ...state, 
        events: action.payload,
        filteredEvents: applyFilters(action.payload, state.levelFilter, state.sourceFilter),
        stats: calculateStats(action.payload),
        isLoading: false,
      }
    case 'SET_LEVEL_FILTER':
      return { 
        ...state, 
        levelFilter: action.payload,
        filteredEvents: applyFilters(state.events, action.payload, state.sourceFilter),
      }
    case 'SET_SOURCE_FILTER':
      return { 
        ...state, 
        sourceFilter: action.payload,
        filteredEvents: applyFilters(state.events, state.levelFilter, action.payload),
      }
    case 'CLEAR_EVENTS':
      return { 
        ...state, 
        events: [],
        filteredEvents: [],
        stats: { total: 0, info: 0, warning: 0, error: 0, debug: 0 },
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface EventsContextType extends EventsStore {
  setLevelFilter: (level: string | null) => void
  setSourceFilter: (source: string | null) => void
  clearEvents: () => void
  getEventIcon: (level: string) => string
  getEventColor: (level: string) => string
}

const EventsContext = createContext<EventsContextType | null>(null)

interface EventsProviderProps {
  children: ReactNode
}

export function EventsProvider({ children }: EventsProviderProps) {
  const [state, dispatch] = useReducer(eventsReducer, initialState)

  const handleEventUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as {
      id?: string
      type?: string
      level?: string
      timestamp?: string
      source?: string
      message?: string
      data?: Record<string, unknown>
    }

    const event: FrameworkEvent = {
      id: data.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type || message.type || 'unknown',
      level: data.level || 'info',
      timestamp: data.timestamp || message.timestamp || new Date().toISOString(),
      source: data.source || 'Unknown',
      message: data.message || '',
      data: data.data,
    }

    dispatch({ type: 'ADD_EVENT', payload: event })
  }, [])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.EVENTS, handleEventUpdate)
    
    const history = ws.getHistory(CHANNELS.EVENTS, 100)
    if (history.length > 0) {
      const events = history.map((msg, idx) => {
        const data = msg.data as Record<string, unknown>
        return {
          id: (data.id as string) || `hist-${idx}`,
          type: (data.type as string) || msg.type || 'unknown',
          level: (data.level as string) || 'info',
          timestamp: msg.timestamp || new Date().toISOString(),
          source: (data.source as string) || 'Unknown',
          message: (data.message as string) || '',
          data: data,
        }
      })
      dispatch({ type: 'SET_EVENTS', payload: events.reverse() })
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handleEventUpdate])

  const setLevelFilter = useCallback((level: string | null) => {
    dispatch({ type: 'SET_LEVEL_FILTER', payload: level })
  }, [])

  const setSourceFilter = useCallback((source: string | null) => {
    dispatch({ type: 'SET_SOURCE_FILTER', payload: source })
  }, [])

  const clearEvents = useCallback(() => {
    dispatch({ type: 'CLEAR_EVENTS' })
  }, [])

  const getEventIcon = useCallback((level: string) => {
    const icons: Record<string, string> = {
      info: 'info',
      warning: 'warning',
      error: 'error',
      debug: 'debug',
    }
    return icons[level] || 'info'
  }, [])

  const getEventColor = useCallback((level: string) => {
    const colors: Record<string, string> = {
      info: 'blue',
      warning: 'yellow',
      error: 'red',
      debug: 'purple',
    }
    return colors[level] || 'blue'
  }, [])

  const value: EventsContextType = {
    ...state,
    setLevelFilter,
    setSourceFilter,
    clearEvents,
    getEventIcon,
    getEventColor,
  }

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents(): EventsContextType {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error('useEvents must be used within EventsProvider')
  }
  return context
}
