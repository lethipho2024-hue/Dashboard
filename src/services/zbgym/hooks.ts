// React hooks for ZBGym API

import { useState, useEffect, useCallback } from 'react'
import getClient from './client'
import type {
  Session,
  CreateSessionRequest,
} from './types'

// Re-export types for consumers
export type { Stats } from './types'
export type { Session } from './types'

// Generic fetch hook with loading/error state
interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => {
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchFn()
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...dependencies])

  return { data, loading, error, refetch }
}

// Stats hook
export function useStats(apiUrl?: string) {
  return useFetch(async () => {
    const client = getClient(apiUrl)
    return client.getStats()
  }, [apiUrl])
}

// Sessions hook
export function useSessions(apiUrl?: string) {
  return useFetch(async () => {
    const client = getClient(apiUrl)
    return client.getSessions()
  }, [apiUrl])
}

// Single session hook
export function useSession(id: number | null, apiUrl?: string) {
  return useFetch(async () => {
    if (id === null) return null
    const client = getClient(apiUrl)
    return client.getSession(id)
  }, [apiUrl, id])
}

// Models hook
export function useModels(apiUrl?: string) {
  return useFetch(async () => {
    const client = getClient(apiUrl)
    return client.getModels()
  }, [apiUrl])
}

// Single model hook
export function useModel(id: number | null, apiUrl?: string) {
  return useFetch(async () => {
    if (id === null) return null
    const client = getClient(apiUrl)
    return client.getModel(id)
  }, [apiUrl, id])
}

// Logs hook
export function useLogs(params: { session_id?: number; limit?: number } = {}, apiUrl?: string) {
  return useFetch(async () => {
    const client = getClient(apiUrl)
    return client.getLogs(params)
  }, [apiUrl, params.session_id, params.limit])
}

// Health check hook
export function useHealth(apiUrl?: string) {
  return useFetch(async () => {
    const client = getClient(apiUrl)
    return client.getHealth()
  }, [apiUrl])
}

// Create session mutation hook
export function useCreateSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = useCallback(async (data: CreateSessionRequest = {}): Promise<Session | null> => {
    setLoading(true)
    setError(null)
    try {
      const client = getClient()
      const session = await client.createSession(data)
      return session
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { createSession, loading, error }
}

// Delete session mutation hook
export function useDeleteSession(onDeleted?: () => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteSession = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const client = getClient()
      await client.deleteSession(id)
      onDeleted?.()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete session'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [onDeleted])

  return { deleteSession, loading, error }
}

// Evaluate model mutation hook
export function useEvaluateModel() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const evaluate = useCallback(async (modelId: number, n_episodes: number = 10) => {
    setLoading(true)
    setError(null)
    try {
      const client = getClient()
      return await client.evaluateModel(modelId, n_episodes)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to evaluate model'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { evaluate, loading, error }
}
