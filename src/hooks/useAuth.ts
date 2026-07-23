// useAuth Hook
// React hook for authentication

import { useState, useEffect, useCallback } from 'react'
import {
  AuthService,
  getAuthService,
  AuthStatus,
  AuthState,
  LoginCredentials,
  User,
  UserRole,
} from '../services/auth'

export interface UseAuthResult {
  // State
  status: AuthStatus
  user: User | null
  session: AuthService['getState']['session']
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  isDeveloperMode: boolean

  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthState>
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
  setDeveloperMode: (enabled: boolean) => void

  // Helpers
  hasRole: (minimumRole: UserRole) => boolean
}

export function useAuth(): UseAuthResult {
  const [authService] = useState(() => getAuthService())
  const [state, setState] = useState<AuthState>(authService.getState())

  // Sync with auth service state
  useEffect(() => {
    const unsubscribe = authService.subscribe(setState)
    return unsubscribe
  }, [authService])

  // Initialize on mount
  useEffect(() => {
    authService.initialize()
  }, [authService])

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthState> => {
      return authService.login(credentials)
    },
    [authService]
  )

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    return authService.logout()
  }, [authService])

  // Refresh session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    return authService.refreshSession()
  }, [authService])

  // Developer mode
  const setDeveloperMode = useCallback(
    (enabled: boolean): void => {
      authService.setDeveloperMode(enabled)
    },
    [authService]
  )

  // Check role
  const hasRole = useCallback(
    (minimumRole: UserRole): boolean => {
      return authService.hasRole(minimumRole)
    },
    [authService]
  )

  return {
    status: state.status,
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    isAuthenticated: state.status === AuthStatus.AUTHENTICATED,
    error: state.error,
    isDeveloperMode: authService.isDeveloperMode(),
    login,
    logout,
    refreshSession,
    setDeveloperMode,
    hasRole,
  }
}

// Session expiry hook
export function useSessionExpiry() {
  const [showWarning, setShowWarning] = useState(false)
  const [authService] = useState(() => getAuthService())

  useEffect(() => {
    const unsubscribe = authService.subscribeToSessionExpiry(() => {
      setShowWarning(true)
    })
    return unsubscribe
  }, [authService])

  const dismissWarning = useCallback(() => {
    setShowWarning(false)
  }, [])

  return { showWarning, dismissWarning }
}
