// Types for ZBGym Framework API

export interface RootResponse {
  message: string
  version: string
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
}

export interface Session {
  id: number
  env_id: string
  algorithm: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  current_timestep: number
  mean_reward: number
}

export interface SessionDetail extends Session {
  logs?: LogEntry[]
}

export interface CreateSessionRequest {
  env_id?: string
  algorithm?: string
  total_timesteps?: number
}

export interface Model {
  id: number
  name: string
  algorithm: string
  env_id: string
  created_at: string
}

export interface ModelDetail extends Model {
  // Full model details available from GET /models/{id}
}

export interface EvaluateResponse {
  mean_reward: number
}

export interface Stats {
  total_sessions: number
  total_models: number
  active_sessions: number
}

export interface LogEntry {
  id?: number
  timestamp?: string
  level?: 'info' | 'warning' | 'error' | 'debug'
  message: string
  session_id?: number
  source?: string
}

export interface LogsQueryParams {
  session_id?: number
  limit?: number
}

export interface ApiError {
  error: string
  detail?: string
}

// WebSocket message type (flexible since backend relays messages)
export interface WsMessage {
  type?: string
  data?: unknown
  [key: string]: unknown
}
