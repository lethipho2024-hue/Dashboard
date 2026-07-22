// Trainer state store

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { getDashboardWs, CHANNELS, ChannelMessage } from '../services/websocket'

export interface TrainerStatus {
  training: boolean
  current_episode: number
  total_episodes: number
  current_reward: number
  mean_reward: number
  learning_rate: number
  progress_percent: number
  checkpoint_status: string
  last_checkpoint: string | null
  elapsed_time: number
  estimated_time_remaining: number
  lastUpdate: Date
}

interface TrainerStore {
  status: TrainerStatus
  history: { episode: number; reward: number; timestamp: Date }[]
  isLoading: boolean
}

type TrainerAction =
  | { type: 'UPDATE_TRAINER'; payload: Partial<TrainerStatus> }
  | { type: 'ADD_REWARD_HISTORY'; payload: { episode: number; reward: number } }
  | { type: 'SET_LOADING'; payload: boolean }

const MAX_HISTORY = 200

const initialState: TrainerStore = {
  status: {
    training: false,
    current_episode: 0,
    total_episodes: 0,
    current_reward: 0,
    mean_reward: 0,
    learning_rate: 0,
    progress_percent: 0,
    checkpoint_status: 'idle',
    last_checkpoint: null,
    elapsed_time: 0,
    estimated_time_remaining: 0,
    lastUpdate: new Date(),
  },
  history: [],
  isLoading: true,
}

function trainerReducer(state: TrainerStore, action: TrainerAction): TrainerStore {
  switch (action.type) {
    case 'UPDATE_TRAINER':
      return { 
        ...state, 
        status: { ...state.status, ...action.payload, lastUpdate: new Date() },
        isLoading: false,
      }
    case 'ADD_REWARD_HISTORY':
      const newHistory = [...state.history, { 
        ...action.payload, 
        timestamp: new Date() 
      }].slice(-MAX_HISTORY)
      return { ...state, history: newHistory }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface TrainerContextType extends TrainerStore {
  isTraining: () => boolean
  getProgressFormatted: () => string
  getTimeFormatted: (seconds: number) => string
  getRewardChartData: (count?: number) => { episode: number; reward: number }[]
}

const TrainerContext = createContext<TrainerContextType | null>(null)

interface TrainerProviderProps {
  children: ReactNode
}

export function TrainerProvider({ children }: TrainerProviderProps) {
  const [state, dispatch] = useReducer(trainerReducer, initialState)

  const handleTrainerUpdate = useCallback((message: ChannelMessage) => {
    const data = message.data as {
      training?: boolean
      current_episode?: number
      total_episodes?: number
      current_reward?: number
      mean_reward?: number
      learning_rate?: number
      progress_percent?: number
      checkpoint_status?: string
      last_checkpoint?: string | null
      elapsed_time?: number
      estimated_time_remaining?: number
    }

    dispatch({ type: 'UPDATE_TRAINER', payload: data })
    
    // Add to reward history if available
    if (data.current_reward !== undefined && data.current_episode !== undefined) {
      dispatch({ 
        type: 'ADD_REWARD_HISTORY', 
        payload: { episode: data.current_episode, reward: data.current_reward } 
      })
    }
  }, [])

  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.subscribe(CHANNELS.TRAINER, handleTrainerUpdate)
    
    const history = ws.getHistory(CHANNELS.TRAINER, 1)
    if (history.length > 0) {
      handleTrainerUpdate(history[history.length - 1])
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    return unsubscribe
  }, [handleTrainerUpdate])

  const isTraining = useCallback(() => {
    return state.status.training
  }, [state.status.training])

  const getProgressFormatted = useCallback(() => {
    return `${state.status.progress_percent.toFixed(1)}%`
  }, [state.status.progress_percent])

  const getTimeFormatted = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m ${secs}s`
  }, [])

  const getRewardChartData = useCallback((count: number = 50) => {
    return state.history.slice(-count).map(h => ({
      episode: h.episode,
      reward: h.reward,
    }))
  }, [state.history])

  const value: TrainerContextType = {
    ...state,
    isTraining,
    getProgressFormatted,
    getTimeFormatted,
    getRewardChartData,
  }

  return (
    <TrainerContext.Provider value={value}>
      {children}
    </TrainerContext.Provider>
  )
}

export function useTrainer(): TrainerContextType {
  const context = useContext(TrainerContext)
  if (!context) {
    throw new Error('useTrainer must be used within TrainerProvider')
  }
  return context
}
