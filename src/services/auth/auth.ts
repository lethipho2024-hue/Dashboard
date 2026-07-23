// Auth Service
// Central authentication service

import type {
  AuthStatus,
  AuthState,
  User,
  Session,
  LoginCredentials,
  LoginResponse,
  UserRole,
} from './types'
import { AuthStorage, TokenUtils } from './storage'
import { AuthApi, getAuthApi } from './api'

export type AuthListener = (state: AuthState) => void
export type SessionExpiredListener = () => void

const SESSION_EXPIRY_WARNING_MS = 5 * 60 * 1000 // 5 minutes before expiry

export class AuthService {
  private api: AuthApi
  private listeners: Set<AuthListener> = new Set()
  private sessionExpiredListeners: Set<SessionExpiredListener> = new Set()
  private state: AuthState
  private refreshTimer: number | null = null
  private expiryWarningTimer: number | null = null

  constructor(api?: AuthApi) {
    this.api = api || getAuthApi()
    this.state = this.createInitialState()
  }

  private createInitialState(): AuthState {
    return {
      status: AuthStatus.UNKNOWN,
      user: null,
      session: null,
      isLoading: true,
      error: null,
    }
  }

  // Subscribe to auth state changes
  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener)
    listener(this.state) // Immediately notify with current state
    return () => this.listeners.delete(listener)
  }

  subscribeToSessionExpiry(listener: SessionExpiredListener): () => void {
    this.sessionExpiredListeners.add(listener)
    return () => this.sessionExpiredListeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }))
  }

  private notifySessionExpired(): void {
    this.sessionExpiredListeners.forEach((listener) => listener())
  }

  // Get current state
  getState(): AuthState {
    return { ...this.state }
  }

  // Check if developer mode
  isDeveloperMode(): boolean {
    return AuthStorage.isDeveloperMode()
  }

  // Enable/disable developer mode
  setDeveloperMode(enabled: boolean): void {
    AuthStorage.setDeveloperMode(enabled)
    this.state.error = null
    this.notify()
  }

  // Initialize auth state from stored session
  async initialize(): Promise<AuthState> {
    this.state.isLoading = true
    this.notify()

    try {
      // Check for stored session
      const storedSession = AuthStorage.getSession()

      if (storedSession) {
        // Check if token is expired
        if (TokenUtils.isExpired(storedSession.access_token)) {
          // Try to refresh
          if (storedSession.refresh_token) {
            try {
              const refreshed = await this.api.refresh(storedSession.refresh_token)
              if (refreshed.success) {
                const newSession: Session = {
                  ...storedSession,
                  access_token: refreshed.access_token,
                  refresh_token: refreshed.refresh_token,
                  expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
                  last_activity: new Date().toISOString(),
                }
                AuthStorage.saveSession(newSession)
                this.api.setAccessToken(newSession.access_token)
                
                this.state = {
                  status: AuthStatus.AUTHENTICATED,
                  user: refreshed.user || null,
                  session: newSession,
                  isLoading: false,
                  error: null,
                }
                
                this.startRefreshTimer()
                this.notify()
                return this.state
              }
            } catch {
              // Refresh failed, clear session
            }
          }
          
          // Token expired and can't refresh
          AuthStorage.clearSession()
          this.state = {
            status: AuthStatus.SESSION_EXPIRED,
            user: null,
            session: null,
            isLoading: false,
            error: 'Session expired. Please login again.',
          }
          this.notify()
          return this.state
        }

        // Token still valid
        this.api.setAccessToken(storedSession.access_token)
        
        // Try to get current user
        const user = await this.api.getCurrentUser()
        
        if (user) {
          this.state = {
            status: AuthStatus.AUTHENTICATED,
            user,
            session: storedSession,
            isLoading: false,
            error: null,
          }
          
          this.startRefreshTimer()
        } else {
          // User fetch failed, but token might still be valid
          this.state = {
            status: AuthStatus.AUTHENTICATED,
            user: null,
            session: storedSession,
            isLoading: false,
            error: null,
          }
        }
        
        this.notify()
        return this.state
      }

      // No stored session
      this.state = {
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        session: null,
        isLoading: false,
        error: null,
      }
      this.notify()
      return this.state
    } catch (error) {
      this.state = {
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        session: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }
      this.notify()
      return this.state
    }
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthState> {
    this.state.isLoading = true
    this.state.error = null
    this.notify()

    try {
      const response = await this.api.login(credentials)

      if (!response.success) {
        this.state = {
          status: AuthStatus.UNAUTHENTICATED,
          user: null,
          session: null,
          isLoading: false,
          error: response.message || 'Login failed',
        }
        this.notify()
        return this.state
      }

      const session: Session = {
        id: `session-${Date.now()}`,
        user_id: response.user?.id || '',
        username: response.user?.username || credentials.username,
        role: response.user?.role || UserRole.VIEWER,
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_at: new Date(Date.now() + response.expires_in * 1000).toISOString(),
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        remember_me: credentials.remember_me || false,
      }

      AuthStorage.saveSession(session)
      this.api.setAccessToken(session.access_token)

      this.state = {
        status: AuthStatus.AUTHENTICATED,
        user: response.user || null,
        session,
        isLoading: false,
        error: null,
      }

      this.startRefreshTimer()
      this.notify()
      return this.state
    } catch (error) {
      this.state = {
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        session: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }
      this.notify()
      return this.state
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.api.logout()
    } finally {
      this.stopTimers()
      AuthStorage.clearSession()
      this.api.setAccessToken(null)
      
      this.state = {
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        session: null,
        isLoading: false,
        error: null,
      }
      this.notify()
    }
  }

  // Refresh session
  async refreshSession(): Promise<boolean> {
    if (!this.state.session?.refresh_token) {
      return false
    }

    try {
      const response = await this.api.refresh(this.state.session.refresh_token)

      if (response.success) {
        const newSession: Session = {
          ...this.state.session,
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: new Date(Date.now() + response.expires_in * 1000).toISOString(),
          last_activity: new Date().toISOString(),
        }

        AuthStorage.saveSession(newSession)
        this.api.setAccessToken(newSession.access_token)

        this.state = {
          ...this.state,
          user: response.user || this.state.user,
          session: newSession,
        }

        this.startRefreshTimer()
        this.notify()
        return true
      }
    } catch {
      // Refresh failed
    }

    return false
  }

  // Get access token
  getAccessToken(): string | null {
    return this.state.session?.access_token || null
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.state.status === AuthStatus.AUTHENTICATED
  }

  // Check if has role
  hasRole(minimumRole: UserRole): boolean {
    const userRole = this.state.user?.role || UserRole.VIEWER
    return this.compareRoles(userRole, minimumRole) >= 0
  }

  // Compare roles
  compareRoles(role1: UserRole, role2: UserRole): number {
    const roleOrder = [
      UserRole.VIEWER,
      UserRole.OPERATOR,
      UserRole.DEVELOPER,
      UserRole.ADMINISTRATOR,
      UserRole.OWNER,
    ]
    return roleOrder.indexOf(role1) - roleOrder.indexOf(role2)
  }

  // Timer management
  private startRefreshTimer(): void {
    this.stopTimers()

    if (!this.state.session?.access_token) return

    // Refresh 1 minute before expiry
    const expiresIn = TokenUtils.getExpiresIn(this.state.session.access_token)
    const refreshIn = Math.max(0, expiresIn - 60) * 1000

    this.refreshTimer = window.setTimeout(() => {
      this.refreshSession()
    }, refreshIn)

    // Warning before expiry
    if (expiresIn > 300) {
      this.expiryWarningTimer = window.setTimeout(() => {
        this.notifySessionExpired()
      }, expiresIn - 300)
    }
  }

  private stopTimers(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    if (this.expiryWarningTimer) {
      clearTimeout(this.expiryWarningTimer)
      this.expiryWarningTimer = null
    }
  }
}

// Singleton instance
let authInstance: AuthService | null = null

export function getAuthService(): AuthService {
  if (!authInstance) {
    authInstance = new AuthService()
  }
  return authInstance
}
