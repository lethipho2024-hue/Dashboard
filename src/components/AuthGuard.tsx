// AuthGuard Component
// Protects routes that require authentication

import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, useSessionExpiry } from '../hooks/useAuth'
import { AuthStatus } from '../services/auth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { status, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Show loading state
  if (isLoading || status === AuthStatus.UNKNOWN) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Show fallback if provided and not authenticated
  if (!isAuthenticated && fallback) {
    return <>{fallback}</>
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}

// Session expiry warning component
export function SessionExpiryWarning() {
  const { showWarning, dismissWarning } = useSessionExpiry()
  const { refreshSession, logout } = useAuth()

  if (!showWarning) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm text-black p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
          <span className="font-medium">Your session will expire soon!</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await refreshSession()
              dismissWarning()
            }}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Extend Session
          </button>
          <button
            onClick={() => {
              dismissWarning()
              logout()
            }}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

// Permission Guard Component
interface PermissionGuardProps {
  children: ReactNode
  permission: import('../services/auth').Permission
  fallback?: ReactNode
}

export function PermissionGuard({
  children,
  permission,
  fallback = null
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Role Guard Component
interface RoleGuardProps {
  children: ReactNode
  minimumRole: import('../services/auth').UserRole
  fallback?: ReactNode
}

export function RoleGuard({
  children,
  minimumRole,
  fallback = null
}: RoleGuardProps) {
  const { hasRole } = usePermissions()

  if (!hasRole(minimumRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// License Guard Component
interface LicenseGuardProps {
  children: ReactNode
  feature?: string
  edition?: import('../services/auth').LicenseEdition
  fallback?: ReactNode
}

export function LicenseGuard({
  children,
  feature,
  edition,
  fallback = null
}: LicenseGuardProps) {
  const { hasFeature, hasMinimumEdition, isValid } = useLicense()

  if (!isValid) {
    return <>{fallback}</>
  }

  if (feature && !hasFeature(feature)) {
    return <>{fallback}</>
  }

  if (edition && !hasMinimumEdition(edition)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
