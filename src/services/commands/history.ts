// Command History Management
// Manages local command execution history

import { getCommandClient, CommandClient } from './client'
import type {
  ExecutionHistoryItem,
  CommandHistoryResponse,
  CommandStatus,
} from './types'

export type HistoryListener = (history: ExecutionHistoryItem[]) => void

export class CommandHistoryManager {
  private client: CommandClient
  private history: ExecutionHistoryItem[] = []
  private listeners: Set<HistoryListener> = new Set()
  private maxLocalHistory: number = 100
  private pollInterval: number | null = null

  constructor(client?: CommandClient) {
    this.client = client || getCommandClient()
  }

  // Subscribe to history updates
  subscribe(listener: HistoryListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Notify listeners
  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.history]))
  }

  // Start polling for history updates
  startPolling(intervalMs: number = 3000): void {
    if (this.pollInterval) return

    this.pollInterval = window.setInterval(async () => {
      await this.refresh()
    }, intervalMs)
  }

  // Stop polling
  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  // Refresh history from server
  async refresh(limit: number = 50): Promise<void> {
    try {
      const response = await this.client.getHistory(limit)
      this.history = response.history
      this.notify()
    } catch (error) {
      console.error('Failed to refresh command history:', error)
    }
  }

  // Get current history
  getHistory(): ExecutionHistoryItem[] {
    return [...this.history]
  }

  // Add entry to local history (optimistic update)
  addEntry(entry: ExecutionHistoryItem): void {
    this.history.unshift(entry)

    // Trim to max size
    if (this.history.length > this.maxLocalHistory) {
      this.history = this.history.slice(0, this.maxLocalHistory)
    }

    this.notify()
  }

  // Update entry
  updateEntry(requestId: string, updates: Partial<ExecutionHistoryItem>): void {
    const index = this.history.findIndex((entry) => entry.request_id === requestId)
    if (index !== -1) {
      this.history[index] = { ...this.history[index], ...updates }
      this.notify()
    }
  }

  // Get entries by status
  getByStatus(status: CommandStatus): ExecutionHistoryItem[] {
    return this.history.filter((entry) => entry.status === status)
  }

  // Get entries by command name
  getByCommand(command: string): ExecutionHistoryItem[] {
    return this.history.filter((entry) => entry.command === command)
  }

  // Get entries in time range
  getInRange(startTime: Date, endTime?: Date): ExecutionHistoryItem[] {
    const end = endTime || new Date()
    return this.history.filter((entry) => {
      const entryTime = new Date(entry.queued_at)
      return entryTime >= startTime && entryTime <= end
    })
  }

  // Get stats
  getStats(): {
    total: number
    completed: number
    failed: number
    successRate: number
  } {
    const total = this.history.length
    const completed = this.history.filter((e) => e.status === 'completed').length
    const failed = this.history.filter((e) => e.status === 'failed').length
    const successRate = total > 0 ? (completed / (completed + failed)) * 100 : 0

    return { total, completed, failed, successRate }
  }

  // Clear local history
  clear(): void {
    this.history = []
    this.notify()
  }
}

// Singleton instance
let historyInstance: CommandHistoryManager | null = null

export function getCommandHistory(): CommandHistoryManager {
  if (!historyInstance) {
    historyInstance = new CommandHistoryManager()
  }
  return historyInstance
}
