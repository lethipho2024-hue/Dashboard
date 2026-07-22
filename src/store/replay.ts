// Replay state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface ReplayStatus {
  recording: boolean
  replay_size_mb: number
  current_replay: string | null
  replay_queue_size: number
  disk_usage_percent: number
  lastUpdate: Date
}

interface ReplayStore {
  status: ReplayStatus
  history: ReplayStatus[]
  isLoading: boolean
}

type ReplayAction =
  | { type: 'UPDATE_REPLAY'; payload: Partial<ReplayStatus> }
  | { type: 'ADD_TO_HISTORY'; payload: ReplayStatus }
  | { type: 'SET_LOADING'; payload: boolean }

const MAX_HISTORY = 50

const initialState: ReplayStore = {
  status: {
    recording: false,
    replay_size_mb: 0,
    current_replay: null,
    replay_queue_size: 0,
    disk_usage_percent: 0,
    lastUpdate: new Date(),
  },
  history: [],
  isLoading: true,
}

function replayReducer(state: ReplayStore, action: ReplayAction): ReplayStore {
  switch (action.type) {
    case 'UPDATE_REPLAY':
      const newStatus = { ...state.status, ...action.payload, lastUpdate: new Date() }
      const newHistory = [...state.history, newStatus].slice(-MAX_HISTORY)
      return { 
        ...state, 
        status: newStatus,
        history: newHistory,
        isLoading: false,
      }
    case 'ADD_TO_HISTORY':
      const updatedHistory = [...state.history, action.payload].slice(-MAX_HISTORY)
      return { ...state, history: updatedHistory }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface ReplayContextType extends ReplayStore {
  isRecording: () => boolean
  getSizeFormatted: () => string
  getRecordingDuration: () => number
}

const ReplayContext = createContext<ReplayContextType | null>(null)

interface ReplayProviderProps {
  children: ReactNode
}

export function ReplayProvider({ children }: ReplayProviderProps) {
  const [state, dispatch] = useReducer(replayReducer, initialState)

  const handleReplayUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as {
      recording?: boolean
      replay_size_mb?: number
      current_replay?: string | null
      replay_queue_size?: number
      disk_usage_percent?: number
    }

    dispatch({ type: 'UPDATE_REPLAY', payload: data })
  }, [])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.REPLAY, handleReplayUpdate)
    
    const history = ws.getHistory(CHANNELS.REPLAY, 1)
    if (history.length > 0) {
      handleReplayUpdate(history[history.length - 1])
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handleReplayUpdate])

  const isRecording = useCallback(() => {
    return state.status.recording
  }, [state.status.recording])

  const getSizeFormatted = useCallback(() => {
    const size = state.status.replay_size_mb
    if (size >= 1000) {
      return `${(size / 1000).toFixed(2)} GB`
    }
    return `${size.toFixed(2)} MB`
  }, [state.status.replay_size_mb])

  const getRecordingDuration = useCallback(() => {
    if (state.history.length < 2) return 0
    const first = state.history[0]
    const last = state.history[state.history.length - 1]
    if (!first.lastUpdate || !last.lastUpdate) return 0
    return Math.floor((new Date(last.lastUpdate).getTime() - new Date(first.lastUpdate).getTime()) / 1000)
  }, [state.history])

  const value: ReplayContextType = {
    ...state,
    isRecording,
    getSizeFormatted,
    getRecordingDuration,
  }

  return (
    <ReplayContext.Provider value={value}>
      {children}
    </ReplayContext.Provider>
  )
}

export function useReplay(): ReplayContextType {
  const context = useContext(ReplayContext)
  if (!context) {
    throw new Error('useReplay must be used within ReplayProvider')
  }
  return context
}
