// Heartbeat management for WebSocket connection

import { HeartbeatState } from './types'

export interface HeartbeatConfig {
  interval: number // ms
  timeout: number // ms
  maxMissed: number
}

export const DEFAULT_HEARTBEAT_CONFIG: HeartbeatConfig = {
  interval: 15000,
  timeout: 10000,
  maxMissed: 3,
}

export class HeartbeatManager {
  private config: HeartbeatConfig
  private state: HeartbeatState
  private intervalId: ReturnType<typeof setInterval> | null = null
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private onHeartbeat: (() => void) | null = null
  private onTimeout: (() => void) | null = null
  private isRunning: boolean = false

  constructor(config: Partial<HeartbeatConfig> = {}) {
    this.config = { ...DEFAULT_HEARTBEAT_CONFIG, ...config }
    this.state = {
      lastHeartbeat: null,
      lastAck: null,
      delay: 0,
      missed: 0,
    }
  }

  getState(): HeartbeatState {
    return { ...this.state }
  }

  getDelay(): number {
    return this.state.delay
  }

  getMissed(): number {
    return this.state.missed
  }

  isHealthy(): boolean {
    return this.state.missed < this.config.maxMissed
  }

  start(onHeartbeat: () => void, onTimeout: () => void): void {
    this.onHeartbeat = onHeartbeat
    this.onTimeout = onTimeout
    this.isRunning = true
    
    this.scheduleHeartbeat()
  }

  private scheduleHeartbeat(): void {
    if (!this.isRunning) return

    this.intervalId = setInterval(() => {
      if (!this.isRunning) return
      
      this.state.lastHeartbeat = new Date()
      this.state.missed++
      
      // Send heartbeat
      if (this.onHeartbeat) {
        this.onHeartbeat()
      }

      // Set timeout for response
      this.timeoutId = setTimeout(() => {
        if (!this.isRunning) return
        
        // No response received
        if (this.state.missed >= this.config.maxMissed) {
          if (this.onTimeout) {
            this.onTimeout()
          }
        }
      }, this.config.timeout)
    }, this.config.interval)
  }

  receiveAck(): void {
    if (this.state.lastHeartbeat) {
      this.state.delay = Date.now() - this.state.lastHeartbeat.getTime()
    }
    this.state.lastAck = new Date()
    this.state.missed = 0

    // Clear timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  reset(): void {
    this.state = {
      lastHeartbeat: null,
      lastAck: null,
      delay: 0,
      missed: 0,
    }
  }

  stop(): void {
    this.isRunning = false
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}
