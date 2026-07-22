// ZBGym API Client

import type {
  RootResponse,
  HealthResponse,
  Session,
  SessionDetail,
  CreateSessionRequest,
  Model,
  ModelDetail,
  EvaluateResponse,
  Stats,
  LogEntry,
  LogsQueryParams,
  ApiError,
} from './types'

class ZBGymClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url
  }

  getBaseUrl() {
    return this.baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ApiError
        throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`)
      }

      const text = await response.text()
      if (!text) return {} as T
      return JSON.parse(text) as T
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Cannot connect to ${this.baseUrl}`)
      }
      throw error
    }
  }

  // Root endpoint
  async getRoot(): Promise<RootResponse> {
    return this.request<RootResponse>('/')
  }

  // Health check
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health')
  }

  // Sessions
  async getSessions(): Promise<Session[]> {
    return this.request<Session[]>('/sessions')
  }

  async getSession(id: number): Promise<SessionDetail> {
    return this.request<SessionDetail>(`/sessions/${id}`)
  }

  async createSession(data: CreateSessionRequest = {}): Promise<Session> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteSession(id: number): Promise<void> {
    await this.request<void>(`/sessions/${id}`, {
      method: 'DELETE',
    })
  }

  // Models
  async getModels(): Promise<Model[]> {
    return this.request<Model[]>('/models')
  }

  async getModel(id: number): Promise<ModelDetail> {
    return this.request<ModelDetail>(`/models/${id}`)
  }

  async evaluateModel(id: number, n_episodes: number = 10): Promise<EvaluateResponse> {
    return this.request<EvaluateResponse>(
      `/models/${id}/evaluate?n_episodes=${n_episodes}`
    )
  }

  // Stats
  async getStats(): Promise<Stats> {
    return this.request<Stats>('/stats')
  }

  // Logs
  async getLogs(params: LogsQueryParams = {}): Promise<LogEntry[]> {
    const queryParams = new URLSearchParams()
    if (params.session_id !== undefined) {
      queryParams.set('session_id', params.session_id.toString())
    }
    if (params.limit !== undefined) {
      queryParams.set('limit', params.limit.toString())
    }
    const query = queryParams.toString()
    return this.request<LogEntry[]>(`/logs${query ? `?${query}` : ''}`)
  }

  // WebSocket URL
  getWebSocketUrl(): string {
    const wsBase = this.baseUrl.replace('http', 'ws')
    return `${wsBase}/ws`
  }
}

// Singleton instance
let clientInstance: ZBGymClient | null = null

export function getClient(baseUrl?: string): ZBGymClient {
  if (!clientInstance) {
    clientInstance = new ZBGymClient(baseUrl)
  } else if (baseUrl) {
    clientInstance.setBaseUrl(baseUrl)
  }
  return clientInstance
}

export function resetClient() {
  clientInstance = null
}

export { ZBGymClient }
export default getClient
