// useCommands Hook
// React hook for executing and managing commands

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getCommandClient,
  getCommandQueue,
  getCommandHistory,
  CommandClient,
  CommandQueue,
  CommandHistoryManager,
} from '../services/commands'
import {
  CommandInfo,
  CommandResponse,
  CommandQueueItem,
  ExecutionHistoryItem,
  CommandStatus,
} from '../services/commands/types'
import {
  getCurrentUserId,
  getCurrentUserPermission,
} from '../services/commands/permissions'

export interface UseCommandsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface UseCommandsResult {
  // Commands
  commands: CommandInfo[]
  commandsByCategory: Record<string, CommandInfo[]>
  isLoadingCommands: boolean
  refreshCommands: () => Promise<void>

  // Queue
  queue: CommandQueueItem[]
  executing: CommandQueueItem[]
  isRefreshingQueue: boolean
  refreshQueue: () => Promise<void>
  cancelCommand: (requestId: string) => Promise<boolean>

  // History
  history: ExecutionHistoryItem[]
  isLoadingHistory: boolean
  refreshHistory: () => Promise<void>

  // Execution
  execute: (
    command: string,
    arguments_?: Record<string, unknown>,
    devMode?: boolean
  ) => Promise<CommandResponse | null>
  isExecuting: boolean
  lastResponse: CommandResponse | null
  error: string | null

  // Stats
  stats: {
    queueSize: number
    executingCount: number
    historyTotal: number
    historyCompleted: number
    historyFailed: number
    successRate: number
  }
}

export function useCommands(options: UseCommandsOptions = {}): UseCommandsResult {
  const { autoRefresh = true, refreshInterval = 3000 } = options

  const client = useRef<CommandClient>(getCommandClient())
  const queueManager = useRef<CommandQueue>(getCommandQueue())
  const historyManager = useRef<CommandHistoryManager>(getCommandHistory())

  // Commands state
  const [commands, setCommands] = useState<CommandInfo[]>([])
  const [commandsByCategory, setCommandsByCategory] = useState<Record<string, CommandInfo[]>>({})
  const [isLoadingCommands, setIsLoadingCommands] = useState(true)

  // Queue state
  const [queue, setQueue] = useState<CommandQueueItem[]>([])
  const [executing, setExecuting] = useState<CommandQueueItem[]>([])
  const [isRefreshingQueue, setIsRefreshingQueue] = useState(false)

  // History state
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastResponse, setLastResponse] = useState<CommandResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Stats
  const [stats, setStats] = useState({
    queueSize: 0,
    executingCount: 0,
    historyTotal: 0,
    historyCompleted: 0,
    historyFailed: 0,
    successRate: 0,
  })

  // Load commands
  const refreshCommands = useCallback(async () => {
    try {
      setIsLoadingCommands(true)
      const response = await client.current.listCommands()
      setCommands(response.commands)
      setCommandsByCategory(response.categories)
    } catch (err) {
      console.error('Failed to load commands:', err)
    } finally {
      setIsLoadingCommands(false)
    }
  }, [])

  // Load queue
  const refreshQueue = useCallback(async () => {
    try {
      setIsRefreshingQueue(true)
      const response = await client.current.getQueue()
      setQueue(response.queue)
      setExecuting(response.executing)
      setStats((prev) => ({
        ...prev,
        queueSize: response.queue.length,
        executingCount: response.executing.length,
      }))
    } catch (err) {
      console.error('Failed to load queue:', err)
    } finally {
      setIsRefreshingQueue(false)
    }
  }, [])

  // Cancel command
  const cancelCommand = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      const success = await queueManager.current.cancel(requestId)
      if (success) {
        await refreshQueue()
      }
      return success
    } catch (err) {
      console.error('Failed to cancel command:', err)
      return false
    }
  }, [refreshQueue])

  // Load history
  const refreshHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true)
      const response = await client.current.getHistory(50)
      setHistory(response.history)
      const completed = response.history.filter((h) => h.status === 'completed').length
      const failed = response.history.filter((h) => h.status === 'failed').length
      const total = response.history.length
      setStats((prev) => ({
        ...prev,
        historyTotal: total,
        historyCompleted: completed,
        historyFailed: failed,
        successRate: total > 0 ? (completed / (completed + failed || 1)) * 100 : 0,
      }))
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  // Execute command
  const execute = useCallback(
    async (
      command: string,
      arguments_: Record<string, unknown> = {},
      devMode: boolean = false
    ): Promise<CommandResponse | null> => {
      try {
        setIsExecuting(true)
        setError(null)

        const userId = getCurrentUserId()
        const userLevel = getCurrentUserPermission()

        const response = await client.current.execute(command, arguments_, userId, devMode)

        setLastResponse(response)
        queueManager.current.setLastRequestId(response.request_id)

        // Refresh queue and history
        await Promise.all([refreshQueue(), refreshHistory()])

        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Command execution failed'
        setError(errorMessage)
        console.error('Command execution failed:', err)
        return null
      } finally {
        setIsExecuting(false)
      }
    },
    [refreshQueue, refreshHistory]
  )

  // Initial load and polling
  useEffect(() => {
    refreshCommands()
    refreshQueue()
    refreshHistory()
  }, [refreshCommands, refreshQueue, refreshHistory])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    queueManager.current.startPolling(refreshInterval)
    historyManager.current.startPolling(refreshInterval)

    // Subscribe to queue updates
    const unsubQueue = queueManager.current.subscribe((newQueue) => {
      setQueue(newQueue)
    })

    const unsubExec = queueManager.current.subscribeToExecution((newExecuting) => {
      setExecuting(newExecuting)
      setStats((prev) => ({
        ...prev,
        executingCount: newExecuting.length,
      }))
    })

    const unsubHistory = historyManager.current.subscribe((newHistory) => {
      setHistory(newHistory)
    })

    return () => {
      queueManager.current.stopPolling()
      historyManager.current.stopPolling()
      unsubQueue()
      unsubExec()
      unsubHistory()
    }
  }, [autoRefresh, refreshInterval])

  return {
    // Commands
    commands,
    commandsByCategory,
    isLoadingCommands,
    refreshCommands,

    // Queue
    queue,
    executing,
    isRefreshingQueue,
    refreshQueue,
    cancelCommand,

    // History
    history,
    isLoadingHistory,
    refreshHistory,

    // Execution
    execute,
    isExecuting,
    lastResponse,
    error,

    // Stats
    stats,
  }
}

// Quick action hook
export function useQuickActions() {
  const { execute, isExecuting } = useCommands()

  const quickActions = [
    {
      id: 'restart_kernel',
      name: 'Restart Kernel',
      command: 'restart_kernel',
      category: 'kernel' as const,
      icon: '🔄',
      isDestructive: true,
    },
    {
      id: 'pause_training',
      name: 'Pause Training',
      command: 'pause_training',
      category: 'trainer' as const,
      icon: '⏸️',
    },
    {
      id: 'resume_training',
      name: 'Resume Training',
      command: 'resume_training',
      category: 'trainer' as const,
      icon: '▶️',
    },
    {
      id: 'save_checkpoint',
      name: 'Save Checkpoint',
      command: 'save_checkpoint',
      category: 'trainer' as const,
      icon: '💾',
      args: { name: `checkpoint-${Date.now()}` },
    },
    {
      id: 'start_recording',
      name: 'Start Recording',
      command: 'start_recording',
      category: 'replay' as const,
      icon: '⏺',
    },
    {
      id: 'stop_recording',
      name: 'Stop Recording',
      command: 'stop_recording',
      category: 'replay' as const,
      icon: '⏹️',
    },
    {
      id: 'clear_logs',
      name: 'Clear Logs',
      command: 'clear_logs',
      category: 'logs' as const,
      icon: '🗑️',
      isDestructive: true,
    },
    {
      id: 'framework_snapshot',
      name: 'Framework Snapshot',
      command: 'framework_snapshot',
      category: 'framework' as const,
      icon: '📸',
    },
  ]

  const executeQuickAction = useCallback(
    async (action: (typeof quickActions)[0]) => {
      if (isExecuting) return null
      return execute(action.command, action.args || {})
    },
    [execute, isExecuting]
  )

  return {
    quickActions,
    executeQuickAction,
    isExecuting,
  }
}
