// Reconnection logic with exponential backoff

export interface ReconnectConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  multiplier: number
}

export const DEFAULT_RECONNECT_CONFIG: ReconnectConfig = {
  maxAttempts: 10,
  baseDelay: 1000,
  maxDelay: 30000,
  multiplier: 1.5,
}

export class ReconnectManager {
  private attempts: number = 0
  private config: ReconnectConfig
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private isRunning: boolean = false
  private onReconnect: (() => void) | null = null

  constructor(config: Partial<ReconnectConfig> = {}) {
    this.config = { ...DEFAULT_RECONNECT_CONFIG, ...config }
  }

  getDelay(): number {
    if (this.attempts >= this.config.maxAttempts) {
      return -1 // Stop reconnecting
    }
    
    const delay = Math.min(
      this.config.baseDelay * Math.pow(this.config.multiplier, this.attempts),
      this.config.maxDelay
    )
    
    // Add jitter (0-10% random)
    const jitter = delay * (Math.random() * 0.1)
    return Math.floor(delay + jitter)
  }

  getAttempts(): number {
    return this.attempts
  }

  getMaxAttempts(): number {
    return this.config.maxAttempts
  }

  shouldRetry(): boolean {
    return this.attempts < this.config.maxAttempts
  }

  scheduleReconnect(onReconnect: () => void): number | -1 {
    this.onReconnect = onReconnect
    this.attempts++
    
    const delay = this.getDelay()
    
    if (delay === -1) {
      return -1
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.isRunning = true
    this.timeoutId = setTimeout(() => {
      if (this.isRunning && this.onReconnect) {
        this.onReconnect()
      }
    }, delay)

    return delay
  }

  reset(): void {
    this.attempts = 0
    this.isRunning = false
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  stop(): void {
    this.isRunning = false
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}
