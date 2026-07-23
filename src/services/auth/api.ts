// Auth API
// Authentication API client

import type {
  LoginCredentials,
  LoginResponse,
  User,
  Session,
  ApiResponse,
  License,
  LicenseValidation,
  AuditEntry,
  AuditFilter,
  HardwareInfo,
} from './types'

const API_BASE = '/api'

export class AuthApi {
  private baseUrl: string
  private accessToken: string | null = null

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    requiresAuth: boolean = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (requiresAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      'POST',
      '/auth/login',
      credentials,
      false
    )
    
    if (response.success && response.access_token) {
      this.setAccessToken(response.access_token)
    }
    
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request('POST', '/auth/logout', {}, true)
    } finally {
      this.setAccessToken(null)
    }
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      'POST',
      '/auth/refresh',
      { refresh_token: refreshToken },
      false
    )
    
    if (response.success && response.access_token) {
      this.setAccessToken(response.access_token)
    }
    
    return response
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.request<ApiResponse<User>>(
        'GET',
        '/auth/me',
        undefined,
        true
      )
      return response.success ? response.data || null : null
    } catch {
      return null
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const response = await this.request<ApiResponse<Session>>(
        'GET',
        '/auth/session',
        undefined,
        true
      )
      return response.success ? response.data || null : null
    } catch {
      return null
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(
      'POST',
      '/auth/change-password',
      { current_password: currentPassword, new_password: newPassword },
      true
    )
  }

  // License
  async getLicense(): Promise<License | null> {
    try {
      const response = await this.request<ApiResponse<License>>(
        'GET',
        '/license',
        undefined,
        true
      )
      return response.success ? response.data || null : null
    } catch {
      return null
    }
  }

  async activateLicense(licenseKey: string): Promise<ApiResponse<License>> {
    return this.request<ApiResponse<License>>(
      'POST',
      '/license/activate',
      { license_key: licenseKey },
      true
    )
  }

  async deactivateLicense(): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(
      'POST',
      '/license/deactivate',
      {},
      true
    )
  }

  async refreshLicense(): Promise<ApiResponse<License>> {
    return this.request<ApiResponse<License>>(
      'POST',
      '/license/refresh',
      {},
      true
    )
  }

  async getLicenseStatus(): Promise<LicenseValidation> {
    return this.request<LicenseValidation>(
      'GET',
      '/license/status',
      undefined,
      true
    )
  }

  async validateLicense(license: License, hardwareInfo: HardwareInfo): Promise<LicenseValidation> {
    return this.request<LicenseValidation>(
      'POST',
      '/license/validate',
      { license, hardware_info: hardwareInfo },
      true
    )
  }

  // Permissions
  async getPermissions(): Promise<Record<string, string[]>> {
    try {
      const response = await this.request<ApiResponse<Record<string, string[]>>>(
        'GET',
        '/permissions',
        undefined,
        true
      )
      return response.success ? response.data || {} : {}
    } catch {
      return {}
    }
  }

  async getRoles(): Promise<string[]> {
    try {
      const response = await this.request<ApiResponse<string[]>>(
        'GET',
        '/roles',
        undefined,
        true
      )
      return response.success ? response.data || [] : []
    } catch {
      return []
    }
  }

  // Audit
  async getAuditLogs(filter?: AuditFilter): Promise<AuditEntry[]> {
    const params = new URLSearchParams()
    
    if (filter?.start_date) params.append('start_date', filter.start_date)
    if (filter?.end_date) params.append('end_date', filter.end_date)
    if (filter?.event) params.append('event', filter.event)
    if (filter?.user_id) params.append('user_id', filter.user_id)
    if (filter?.resource) params.append('resource', filter.resource)
    if (filter?.limit) params.append('limit', filter.limit.toString())
    
    const query = params.toString()
    const endpoint = `/audit/logs${query ? `?${query}` : ''}`
    
    try {
      const response = await this.request<ApiResponse<AuditEntry[]>>(
        'GET',
        endpoint,
        undefined,
        true
      )
      return response.success ? response.data || [] : []
    } catch {
      return []
    }
  }

  async getAuditHistory(limit: number = 100): Promise<AuditEntry[]> {
    try {
      const response = await this.request<ApiResponse<AuditEntry[]>>(
        'GET',
        `/audit/history?limit=${limit}`,
        undefined,
        true
      )
      return response.success ? response.data || [] : []
    } catch {
      return []
    }
  }
}

// Singleton instance
let apiInstance: AuthApi | null = null

export function getAuthApi(): AuthApi {
  if (!apiInstance) {
    apiInstance = new AuthApi()
  }
  return apiInstance
}
