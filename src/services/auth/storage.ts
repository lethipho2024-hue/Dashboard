// Auth Storage
// Secure storage utilities for auth data

import type { Session, License } from './types'

const AUTH_STORAGE_KEY = 'zbgym_auth'
const LICENSE_STORAGE_KEY = 'zbgym_license'
const DEVICE_ID_KEY = 'zbgym_device_id'
const OFFLINE_CACHE_KEY = 'zbgym_offline_cache'

export class AuthStorage {
  // Check if we're in local developer mode
  static isDeveloperMode(): boolean {
    return localStorage.getItem('zbgym_dev_mode') === 'true'
  }

  static setDeveloperMode(enabled: boolean): void {
    if (enabled) {
      localStorage.setItem('zbgym_dev_mode', 'true')
    } else {
      localStorage.removeItem('zbgym_dev_mode')
    }
  }

  // Session storage
  static saveSession(session: Session): void {
    try {
      // Use sessionStorage for sensitive data (cleared on tab close)
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      
      // Also save to localStorage if remember_me is enabled
      if (session.remember_me) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      }
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  static getSession(): Session | null {
    try {
      // Try sessionStorage first
      const sessionStr = sessionStorage.getItem(AUTH_STORAGE_KEY)
      if (sessionStr) {
        return JSON.parse(sessionStr)
      }

      // Fall back to localStorage for remember_me sessions
      const localStr = localStorage.getItem(AUTH_STORAGE_KEY)
      if (localStr) {
        const session = JSON.parse(localStr) as Session
        // Move to sessionStorage for this session
        sessionStorage.setItem(AUTH_STORAGE_KEY, localStr)
        return session
      }

      return null
    } catch (error) {
      console.error('Failed to get session:', error)
      return null
    }
  }

  static clearSession(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    // Keep localStorage session for remember_me
  }

  static clearAllSessions(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  // License storage
  static saveLicense(license: License): void {
    try {
      localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(license))
    } catch (error) {
      console.error('Failed to save license:', error)
    }
  }

  static getLicense(): License | null {
    try {
      const licenseStr = localStorage.getItem(LICENSE_STORAGE_KEY)
      if (licenseStr) {
        return JSON.parse(licenseStr)
      }
      return null
    } catch (error) {
      console.error('Failed to get license:', error)
      return null
    }
  }

  static clearLicense(): void {
    localStorage.removeItem(LICENSE_STORAGE_KEY)
  }

  // Offline validation cache
  static saveOfflineCache(validation: unknown, expiresIn: number): void {
    try {
      const cache = {
        data: validation,
        expires_at: Date.now() + expiresIn,
      }
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('Failed to save offline cache:', error)
    }
  }

  static getOfflineCache<T>(): { data: T; valid: boolean } | null {
    try {
      const cacheStr = localStorage.getItem(OFFLINE_CACHE_KEY)
      if (!cacheStr) return null

      const cache = JSON.parse(cacheStr)
      const valid = Date.now() < cache.expires_at
      return { data: cache.data, valid }
    } catch (error) {
      console.error('Failed to get offline cache:', error)
      return null
    }
  }

  static clearOfflineCache(): void {
    localStorage.removeItem(OFFLINE_CACHE_KEY)
  }

  // Device ID
  static getDeviceId(): string | null {
    return localStorage.getItem(DEVICE_ID_KEY)
  }

  static setDeviceId(deviceId: string): void {
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }

  // Clear all auth data
  static clearAll(): void {
    this.clearSession()
    this.clearLicense()
    this.clearOfflineCache()
    localStorage.removeItem(DEVICE_ID_KEY)
    localStorage.removeItem('zbgym_dev_mode')
  }
}

// Secure token utilities
export class TokenUtils {
  // Decode JWT payload (without verification - for display only)
  static decodePayload(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(payload)
    } catch {
      return null
    }
  }

  // Check if token is expired
  static isExpired(token: string): boolean {
    const payload = this.decodePayload(token)
    if (!payload || !payload.exp) return true
    
    const exp = payload.exp as number
    return Date.now() >= exp * 1000
  }

  // Get time until expiration
  static getExpiresIn(token: string): number {
    const payload = this.decodePayload(token)
    if (!payload || !payload.exp) return 0
    
    const exp = payload.exp as number
    const msUntilExpiration = exp * 1000 - Date.now()
    return Math.max(0, Math.floor(msUntilExpiration / 1000))
  }

  // Check if token needs refresh (expires within threshold)
  static needsRefresh(token: string, thresholdSeconds: number = 300): boolean {
    return this.getExpiresIn(token) < thresholdSeconds
  }
}
