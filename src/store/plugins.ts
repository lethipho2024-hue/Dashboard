// Plugins state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface Plugin {
  id: string
  name: string
  version: string
  status: 'loaded' | 'enabled' | 'disabled' | 'error'
  health: 'healthy' | 'warning' | 'error'
  description?: string
}

interface PluginsStore {
  plugins: Plugin[]
  stats: {
    total: number
    loaded: number
    enabled: number
    disabled: number
    errors: number
  }
  isLoading: boolean
}

type PluginsAction =
  | { type: 'SET_PLUGINS'; payload: Plugin[] }
  | { type: 'UPDATE_PLUGIN'; payload: Plugin }
  | { type: 'ADD_PLUGIN'; payload: Plugin }
  | { type: 'REMOVE_PLUGIN'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: PluginsStore = {
  plugins: [],
  stats: {
    total: 0,
    loaded: 0,
    enabled: 0,
    disabled: 0,
    errors: 0,
  },
  isLoading: true,
}

function calculateStats(plugins: Plugin[]) {
  return {
    total: plugins.length,
    loaded: plugins.filter(p => p.status === 'loaded').length,
    enabled: plugins.filter(p => p.status === 'enabled').length,
    disabled: plugins.filter(p => p.status === 'disabled').length,
    errors: plugins.filter(p => p.status === 'error' || p.health === 'error').length,
  }
}

function pluginsReducer(state: PluginsStore, action: PluginsAction): PluginsStore {
  switch (action.type) {
    case 'SET_PLUGINS':
      return { 
        ...state, 
        plugins: action.payload,
        stats: calculateStats(action.payload),
        isLoading: false,
      }
    case 'UPDATE_PLUGIN':
      const updatedPlugins = state.plugins.map(p => 
        p.id === action.payload.id ? action.payload : p
      )
      return { 
        ...state, 
        plugins: updatedPlugins,
        stats: calculateStats(updatedPlugins),
      }
    case 'ADD_PLUGIN':
      const addedPlugins = [...state.plugins, action.payload]
      return { 
        ...state, 
        plugins: addedPlugins,
        stats: calculateStats(addedPlugins),
      }
    case 'REMOVE_PLUGIN':
      const removedPlugins = state.plugins.filter(p => p.id !== action.payload)
      return { 
        ...state, 
        plugins: removedPlugins,
        stats: calculateStats(removedPlugins),
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface PluginsContextType extends PluginsStore {
  getPluginById: (id: string) => Plugin | undefined
  getPluginsByStatus: (status: Plugin['status']) => Plugin[]
  getHealthyPlugins: () => Plugin[]
  getErrorPlugins: () => Plugin[]
}

const PluginsContext = createContext<PluginsContextType | null>(null)

interface PluginsProviderProps {
  children: ReactNode
}

export function PluginsProvider({ children }: PluginsProviderProps) {
  const [state, dispatch] = useReducer(pluginsReducer, initialState)

  const handlePluginsUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as {
      plugins?: Plugin[]
      plugin?: Plugin
      id?: string
      status?: Plugin['status']
      health?: Plugin['health']
    }

    if (data.plugins) {
      dispatch({ type: 'SET_PLUGINS', payload: data.plugins })
    } else if (data.plugin) {
      dispatch({ type: 'UPDATE_PLUGIN', payload: data.plugin })
    } else if (data.id) {
      dispatch({ type: 'UPDATE_PLUGIN', payload: {
        id: data.id,
        name: data.id,
        version: 'unknown',
        status: data.status || 'loaded',
        health: data.health || 'healthy',
      }})
    }
  }, [])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.PLUGINS, handlePluginsUpdate)
    
    const history = ws.getHistory(CHANNELS.PLUGINS, 1)
    if (history.length > 0) {
      handlePluginsUpdate(history[history.length - 1])
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handlePluginsUpdate])

  const getPluginById = useCallback((id: string) => {
    return state.plugins.find(p => p.id === id)
  }, [state.plugins])

  const getPluginsByStatus = useCallback((status: Plugin['status']) => {
    return state.plugins.filter(p => p.status === status)
  }, [state.plugins])

  const getHealthyPlugins = useCallback(() => {
    return state.plugins.filter(p => p.health === 'healthy')
  }, [state.plugins])

  const getErrorPlugins = useCallback(() => {
    return state.plugins.filter(p => p.health === 'error' || p.status === 'error')
  }, [state.plugins])

  const value: PluginsContextType = {
    ...state,
    getPluginById,
    getPluginsByStatus,
    getHealthyPlugins,
    getErrorPlugins,
  }

  return (
    <PluginsContext.Provider value={value}>
      {children}
    </PluginsContext.Provider>
  )
}

export function usePlugins(): PluginsContextType {
  const context = useContext(PluginsContext)
  if (!context) {
    throw new Error('usePlugins must be used within PluginsProvider')
  }
  return context
}
