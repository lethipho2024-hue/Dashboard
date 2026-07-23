// License Service
// License validation and management

import type {
  License,
  LicenseValidation,
  LicenseEdition,
  LicenseStatus,
  HardwareInfo,
} from './types'
import { AuthStorage, TokenUtils } from './storage'
import { AuthApi, getAuthApi } from './api'

export type LicenseListener = (validation: LicenseValidation) => void

export class LicenseService {
  private api: AuthApi
  private listeners: Set<LicenseListener> = new Set()
  private validation: LicenseValidation
  private refreshTimer: number | null = null

  constructor(api?: AuthApi) {
    this.api = api || getAuthApi()
    this.validation = {
      valid: false,
      license: null,
      errors: ['Not initialized'],
      warnings: [],
      offline_cache_valid: false,
    }
  }

  // Subscribe to license validation changes
  subscribe(listener: LicenseListener): () => void {
    this.listeners.add(listener)
    listener(this.validation)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener({ ...this.validation }))
  }

  // Get current validation
  getValidation(): LicenseValidation {
    return { ...this.validation }
  }

  // Check if license is valid
  isValid(): boolean {
    return this.validation.valid
  }

  // Get license info
  getLicense(): License | null {
    return this.validation.license
  }

  // Initialize license from storage
  async initialize(): Promise<LicenseValidation> {
    // Try offline cache first
    const cached = AuthStorage.getOfflineCache<LicenseValidation>()
    if (cached && cached.valid) {
      this.validation = cached.data
      this.notify()
    }

    // Try to validate online
    await this.validate()
    return this.validation
  }

  // Validate license
  async validate(): Promise<LicenseValidation> {
    try {
      // Get hardware info
      const hardwareInfo = this.getHardwareInfo()

      // Try API validation
      try {
        const response = await this.api.getLicenseStatus()
        
        this.validation = response
        
        // Cache for offline use
        if (response.valid) {
          AuthStorage.saveOfflineCache(response, 24 * 60 * 60 * 1000) // 24 hours
        }
      } catch {
        // API call failed, use offline cache
        const cached = AuthStorage.getOfflineCache<LicenseValidation>()
        if (cached && cached.valid) {
          this.validation = cached.data
        } else {
          this.validation = {
            valid: false,
            license: null,
            errors: ['Cannot validate license: offline and no cache'],
            warnings: ['Running in offline mode without valid cache'],
            offline_cache_valid: false,
          }
        }
      }

      this.notify()
      return this.validation
    } catch (error) {
      this.validation = {
        valid: false,
        license: null,
        errors: [error instanceof Error ? error.message : 'License validation failed'],
        warnings: [],
        offline_cache_valid: false,
      }
      this.notify()
      return this.validation
    }
  }

  // Activate license
  async activate(licenseKey: string): Promise<LicenseValidation> {
    try {
      const response = await this.api.activateLicense(licenseKey)

      if (response.success && response.data) {
        AuthStorage.saveLicense(response.data)
        
        this.validation = {
          valid: true,
          license: response.data,
          errors: [],
          warnings: [],
          offline_cache_valid: true,
        }
        
        this.startRefreshTimer()
        this.notify()
      } else {
        this.validation = {
          valid: false,
          license: null,
          errors: [response.error || 'Activation failed'],
          warnings: [],
          offline_cache_valid: false,
        }
      }

      return this.validation
    } catch (error) {
      this.validation = {
        valid: false,
        license: null,
        errors: [error instanceof Error ? error.message : 'Activation failed'],
        warnings: [],
        offline_cache_valid: false,
      }
      this.notify()
      return this.validation
    }
  }

  // Deactivate license
  async deactivate(): Promise<boolean> {
    try {
      const response = await this.api.deactivateLicense()

      if (response.success) {
        AuthStorage.clearLicense()
        AuthStorage.clearOfflineCache()
        this.stopTimer()
        
        this.validation = {
          valid: false,
          license: null,
          errors: [],
          warnings: [],
          offline_cache_valid: false,
        }
        this.notify()
        return true
      }
    } catch {
      // Deactivation failed
    }
    return false
  }

  // Refresh license
  async refresh(): Promise<LicenseValidation> {
    try {
      const response = await this.api.refreshLicense()

      if (response.success && response.data) {
        AuthStorage.saveLicense(response.data)
        
        this.validation = {
          valid: true,
          license: response.data,
          errors: [],
          warnings: [],
          offline_cache_valid: true,
        }
        this.notify()
      }

      return this.validation
    } catch (error) {
      return this.validation
    }
  }

  // Check if feature is available
  hasFeature(feature: string): boolean {
    if (!this.validation.valid || !this.validation.license) {
      return false
    }
    return this.validation.license.features.includes(feature)
  }

  // Check if edition meets minimum requirement
  hasMinimumEdition(minimumEdition: LicenseEdition): boolean {
    if (!this.validation.valid || !this.validation.license) {
      return false
    }

    const editionOrder = [
      LicenseEdition.TRIAL,
      LicenseEdition.DEVELOPER,
      LicenseEdition.PROFESSIONAL,
      LicenseEdition.ENTERPRISE,
      LicenseEdition.UNLIMITED,
    ]

    const currentIndex = editionOrder.indexOf(this.validation.license.edition)
    const minimumIndex = editionOrder.indexOf(minimumEdition)

    return currentIndex >= minimumIndex
  }

  // Get hardware info for license binding
  private getHardwareInfo(): HardwareInfo {
    // Generate a simple device fingerprint
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
    ].join('|')

    // Simple hash function
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }

    const deviceId = Math.abs(hash).toString(16)

    // Check for stored device ID
    let storedDeviceId = AuthStorage.getDeviceId()
    if (!storedDeviceId) {
      storedDeviceId = deviceId
      AuthStorage.setDeviceId(storedDeviceId)
    }

    return {
      cpu_id: 'cpu-' + storedDeviceId.substring(0, 8),
      motherboard_id: 'mb-' + storedDeviceId.substring(0, 8),
      mac_address: '00:00:00:00:00:00', // Not accessible in browser
      machine_uuid: storedDeviceId,
      os_identifier: navigator.platform,
      hostname: window.location.hostname || 'unknown',
      fingerprint: storedDeviceId,
    }
  }

  // Timer management
  private startRefreshTimer(): void {
    this.stopTimer()

    // Refresh license every 24 hours
    this.refreshTimer = window.setInterval(() => {
      this.refresh()
    }, 24 * 60 * 60 * 1000)
  }

  private stopTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  // Get edition display name
  static getEditionDisplayName(edition: LicenseEdition): string {
    const names: Record<LicenseEdition, string> = {
      [LicenseEdition.TRIAL]: 'Trial',
      [LicenseEdition.DEVELOPER]: 'Developer',
      [LicenseEdition.PROFESSIONAL]: 'Professional',
      [LicenseEdition.ENTERPRISE]: 'Enterprise',
      [LicenseEdition.UNLIMITED]: 'Unlimited',
    }
    return names[edition] || 'Unknown'
  }

  // Get status display name
  static getStatusDisplayName(status: LicenseStatus): string {
    const names: Record<LicenseStatus, string> = {
      [LicenseStatus.VALID]: 'Valid',
      [LicenseStatus.EXPIRED]: 'Expired',
      [LicenseStatus.REVOKED]: 'Revoked',
      [LicenseStatus.INVALID]: 'Invalid',
      [LicenseStatus.NOT_FOUND]: 'Not Found',
      [LicenseStatus.PENDING]: 'Pending',
    }
    return names[status] || 'Unknown'
  }
}

// Singleton instance
let licenseInstance: LicenseService | null = null

export function getLicenseService(): LicenseService {
  if (!licenseInstance) {
    licenseInstance = new LicenseService()
  }
  return licenseInstance
}
