// Command Types
// Types for the command system

export enum PermissionLevel {
  VIEWER = 'viewer',
  OPERATOR = 'operator',
  DEVELOPER = 'developer',
  ADMINISTRATOR = 'administrator',
}

export enum CommandCategory {
  KERNEL = 'kernel',
  RUNTIME = 'runtime',
  TRAINER = 'trainer',
  REPLAY = 'replay',
  PLUGINS = 'plugins',
  LOGS = 'logs',
  METRICS = 'metrics',
  FRAMEWORK = 'framework',
}

export enum CommandStatus {
  QUEUED = 'queued',
  PENDING = 'pending',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  DENIED = 'denied',
}

export interface Command {
  command: string
  request_id?: string
  timestamp?: string
  arguments: Record<string, unknown>
  sender: string
  permission_level: PermissionLevel
}

export interface CommandResponse {
  success: boolean
  request_id: string
  command: string
  execution_time: number
  timestamp: string
  message: string
  payload?: Record<string, unknown>
  error_code?: string
  traceback?: string
}

export interface CommandInfo {
  name: string
  category: CommandCategory
  description: string
  permission_level: PermissionLevel
  arguments_schema?: Record<string, unknown>
  aliases: string[]
  version: string
  is_destructive: boolean
  requires_framework: boolean
}

export interface CommandQueueItem {
  request_id: string
  command: string
  arguments: Record<string, unknown>
  status: CommandStatus
  queued_at: string
  started_at?: string
  completed_at?: string
  sender: string
}

export interface ExecutionHistoryItem {
  request_id: string
  command: string
  arguments: Record<string, unknown>
  sender: string
  permission_level: PermissionLevel
  status: CommandStatus
  execution_time: number
  queued_at: string
  started_at?: string
  completed_at?: string
  message: string
  error_code?: string
  response?: Record<string, unknown>
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  command_info?: CommandInfo
}

export interface CommandQueueResponse {
  queue: CommandQueueItem[]
  executing: CommandQueueItem[]
  stats: {
    queue_size: number
    max_queue_size: number
    executing_count: number
    total_commands: number
  }
}

export interface CommandHistoryResponse {
  history: ExecutionHistoryItem[]
  stats: {
    total_commands: number
    completed: number
    failed: number
    executing: number
    queued: number
    success_rate: number
    average_execution_time: number
  }
  total: number
}

export interface CommandStats {
  queue_size: number
  max_queue_size: number
  executing: number
  total_commands: number
  history_stats: {
    total_commands: number
    completed: number
    failed: number
    executing: number
    queued: number
    success_rate: number
    average_execution_time: number
    most_used_commands: [string, number][]
  }
}

// Quick action type
export interface QuickAction {
  id: string
  name: string
  icon: string
  command: string
  arguments?: Record<string, unknown>
  category: CommandCategory
  permission_level: PermissionLevel
  is_destructive?: boolean
}

// Command execution callback
export type CommandCallback = (response: CommandResponse) => void

// Command validation callback
export type ValidationCallback = (result: ValidationResult) => void
