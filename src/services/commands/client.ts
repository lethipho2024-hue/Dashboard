// Command Client
// Client for executing framework commands via REST API

import type {
  Command,
  CommandResponse,
  CommandInfo,
  CommandQueueItem,
  CommandHistoryItem,
  ValidationResult,
  CommandQueueResponse,
  CommandHistoryResponse,
  CommandStats,
} from './types'

const API_BASE = '/api'

export class CommandClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options)

    if (!response.ok) {
      throw new Error(`Command API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Execute a command
  async execute(
    command: string,
    arguments_: Record<string, unknown> = {},
    sender: string = 'dashboard',
    devMode: boolean = false
  ): Promise<CommandResponse> {
    const requestId = `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const cmd: Command = {
      command,
      request_id: requestId,
      timestamp: new Date().toISOString(),
      arguments: arguments_,
      sender,
      permission_level: 'operator' as const,
    }

    return this.request<CommandResponse>(
      'POST',
      `/commands/execute?sender=${sender}&dev_mode=${devMode}`,
      cmd
    )
  }

  // Execute a command with full Command object
  async executeCommand(
    command: Command,
    sender: string = 'dashboard',
    devMode: boolean = false
  ): Promise<CommandResponse> {
    return this.request<CommandResponse>(
      'POST',
      `/commands/execute?sender=${sender}&dev_mode=${devMode}`,
      command
    )
  }

  // List available commands
  async listCommands(
    category?: string,
    permission?: string
  ): Promise<{ commands: CommandInfo[]; categories: Record<string, CommandInfo[]>; total: number }> {
    let endpoint = '/commands'
    const params: string[] = []

    if (category) params.push(`category=${category}`)
    if (permission) params.push(`permission=${permission}`)

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`
    }

    return this.request(endpoint)
  }

  // Get command information
  async getCommandInfo(commandName: string): Promise<CommandInfo | { error: string }> {
    return this.request(`/commands/${encodeURIComponent(commandName)}`)
  }

  // Get command queue status
  async getQueue(): Promise<CommandQueueResponse> {
    return this.request('/commands/queue')
  }

  // Get command execution status
  async getStatus(requestId: string): Promise<{
    request_id: string
    status: string
    command?: string
    execution_time?: number
    message?: string
    error_code?: string
  }> {
    return this.request(`/commands/status/${encodeURIComponent(requestId)}`)
  }

  // Cancel a queued command
  async cancel(requestId: string): Promise<{
    success: boolean
    request_id: string
    message: string
  }> {
    return this.request('DELETE', `/commands/queue/${encodeURIComponent(requestId)}`)
  }

  // Get command history
  async getHistory(
    limit: number = 50,
    command?: string,
    status?: string,
    sender?: string
  ): Promise<CommandHistoryResponse> {
    const params: string[] = [`limit=${limit}`]

    if (command) params.push(`command=${encodeURIComponent(command)}`)
    if (status) params.push(`status=${status}`)
    if (sender) params.push(`sender=${encodeURIComponent(sender)}`)

    return this.request(`/commands/history?${params.join('&')}`)
  }

  // Get command dispatcher stats
  async getStats(): Promise<CommandStats> {
    return this.request('/commands/stats')
  }

  // Validate a command without executing
  async validate(
    command: string,
    arguments_: Record<string, unknown> = {},
    sender: string = 'dashboard'
  ): Promise<ValidationResult> {
    const requestId = `val-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const cmd: Command = {
      command,
      request_id: requestId,
      timestamp: new Date().toISOString(),
      arguments: arguments_,
      sender,
      permission_level: 'operator' as const,
    }

    return this.request<ValidationResult>(
      'POST',
      `/commands/validate?sender=${sender}`,
      cmd
    )
  }
}

// Singleton instance
let clientInstance: CommandClient | null = null

export function getCommandClient(): CommandClient {
  if (!clientInstance) {
    clientInstance = new CommandClient()
  }
  return clientInstance
}
