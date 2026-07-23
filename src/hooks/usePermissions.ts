// usePermissions Hook
// React hook for permission checking

import { useCallback } from 'react'
import {
  PermissionsService,
  getPermissionsService,
  Permission,
  UserRole,
} from '../services/auth'
import { useAuth } from './useAuth'

export interface UsePermissionsResult {
  // Check permissions
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean

  // Role checks
  hasRole: (minimumRole: UserRole) => boolean
  isViewer: () => boolean
  isOperator: () => boolean
  isDeveloper: () => boolean
  isAdministrator: () => boolean
  isOwner: () => boolean

  // Get info
  getRoleName: () => string
  getPermissions: () => Permission[]
}

export function usePermissions(): UsePermissionsResult {
  const { user, hasRole: authHasRole } = useAuth()
  const [permissionsService] = useState(() => getPermissionsService())

  // Check single permission
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return permissionsService.hasPermission(permission)
    },
    [permissionsService]
  )

  // Check any of permissions
  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      return permissionsService.hasAnyPermission(permissions)
    },
    [permissionsService]
  )

  // Check all permissions
  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      return permissionsService.hasAllPermissions(permissions)
    },
    [permissionsService]
  )

  // Role checks
  const hasRoleFn = useCallback(
    (minimumRole: UserRole): boolean => {
      return authHasRole(minimumRole)
    },
    [authHasRole]
  )

  const isViewer = useCallback((): boolean => {
    return authHasRole(UserRole.VIEWER)
  }, [authHasRole])

  const isOperator = useCallback((): boolean => {
    return authHasRole(UserRole.OPERATOR)
  }, [authHasRole])

  const isDeveloper = useCallback((): boolean => {
    return authHasRole(UserRole.DEVELOPER)
  }, [authHasRole])

  const isAdministrator = useCallback((): boolean => {
    return authHasRole(UserRole.ADMINISTRATOR)
  }, [authHasRole])

  const isOwner = useCallback((): boolean => {
    return authHasRole(UserRole.OWNER)
  }, [authHasRole])

  // Get role name
  const getRoleName = useCallback((): string => {
    if (!user) return 'Guest'
    return PermissionsService.getRoleDisplayName(user.role)
  }, [user])

  // Get permissions
  const getPermissions = useCallback((): Permission[] => {
    return permissionsService.getPermissions()
  }, [permissionsService])

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole: hasRoleFn,
    isViewer,
    isOperator,
    isDeveloper,
    isAdministrator,
    isOwner,
    getRoleName,
    getPermissions,
  }
}

// HOC for permission checks
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission
): React.FC<P> {
  return function WithPermissionComponent(props: P) {
    const { hasPermission } = usePermissions()

    if (!hasPermission(requiredPermission)) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

// Higher-order component for role checks
export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  minimumRole: UserRole
): React.FC<P> {
  return function WithRoleComponent(props: P) {
    const { hasRole } = usePermissions()

    if (!hasRole(minimumRole)) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
