// Command Queue Management
// Manages the local command queue state

import { getCommandClient, CommandClient } from './client'
import type {
  CommandQueueItem,
  CommandResponse,
  CommandStatus,
} from './types'

export type QueueListener = (queue: CommandQueueItem[]) => void
export type ExecutionListener = (executing: CommandQueueItem[]) => void

export class CommandQueue {
  private client: CommandClient
  private queue: CommandQueueItem[] = []
  private executing: CommandQueueItem[] = []
  private listeners: Set<QueueListener> = new Set()
  private executionListeners: Set<ExecutionListener> = new Set()
  private pollInterval: number | null = null
  private lastRequestId: string | null = null

  constructor(client?: CommandClient) {
    this.client = client || getCommandClient()
  }

  // Subscribe to queue updates
  subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  subscribeToExecution(listener: ExecutionListener): () => void {
    this.executionListeners.add(listener)
    return () => this.executionListeners.delete(listener)
  }

  // Notify listeners
  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.queue]))
  }

  private notifyExecution(): void {
    this.executionListeners.forEach((listener) => listener([...this.executing]))
  }

  // Start polling for queue updates
  startPolling(intervalMs: number = 2000): void {
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

  // Refresh queue from server
  async refresh(): Promise<void> {
    try {
      const response = await this.client.getQueue()
      this.queue = response.queue
      this.executing = response.executing
      this.notify()
      this.notifyExecution()

      // Check if our last request completed
      if (this.lastRequestId) {
        const status = await this.client.getStatus(this.lastRequestId)
        if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
          this.lastRequestId = null
        }
      }
    } catch (error) {
      console.error('Failed to refresh command queue:', error)
    }
  }

  // Get current queue
  getQueue(): CommandQueueItem[] {
    return [...this.queue]
  }

  // Get currently executing commands
  getExecuting(): CommandQueueItem[] {
    return [...this.executing]
  }

  // Add command to local queue (optimistic update)
  addToQueue(item: CommandQueueItem): void {
    this.queue.push(item)
    this.notify()
  }

  // Update item status
  updateItem(requestId: string, updates: Partial<CommandQueueItem>): void {
    // Check queue
    const queueIndex = this.queue.findIndex((item) => item.request_id === requestId)
    if (queueIndex !== -1) {
      this.queue[queueIndex] = { ...this.queue[queueIndex], ...updates }

      // Move to executing if needed
      if (updates.status === 'executing') {
        const [item] = this.queue.splice(queueIndex, 1)
        this.executing.push(item)
        this.notify()
        this.notifyExecution()
        return
      }

      this.notify()
      return
    }

    // Check executing
    const execIndex = this.executing.findIndex((item) => item.request_id === requestId)
    if (execIndex !== -1) {
      this.executing[execIndex] = { ...this.executing[execIndex], ...updates }

      // Remove if completed
      if (updates.status === 'completed' || updates.status === 'failed' || updates.status === 'cancelled') {
        const [item] = this.executing.splice(execIndex, 1)
        this.notifyExecution()
      }
    }
  }

  // Cancel a queued command
  async cancel(requestId: string): Promise<boolean> {
    try {
      const result = await this.client.cancel(requestId)
      if (result.success) {
        this.updateItem(requestId, { status: 'cancelled' as CommandStatus })
        await this.refresh()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to cancel command:', error)
      return false
    }
  }

  // Set the last request ID to track
  setLastRequestId(requestId: string): void {
    this.lastRequestId = requestId
  }

  // Get last request ID
  getLastRequestId(): string | null {
    return this.lastRequestId
  }
}

// Singleton instance
let queueInstance: CommandQueue | null = null

export function getCommandQueue(): CommandQueue {
  if (!queueInstance) {
    queueInstance = new CommandQueue()
  }
  return queueInstance
}
