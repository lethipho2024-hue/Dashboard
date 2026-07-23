// Permissions Service
// Role-based access control

import type { UserRole } from './types'
import { AuthService, getAuthService } from './auth'

export type Permission =
  | 'dashboard:read'
  | 'kernel:read'
  | 'kernel:write'
  | 'kernel:execute'
  | 'kernel:restart'
  | 'trainer:read'
  | 'trainer:write'
  | 'trainer:execute'
  | 'trainer:pause'
  | 'trainer:resume'
  | 'replay:read'
  | 'replay:write'
  | 'replay:execute'
  | 'plugins:read'
  | 'plugins:write'
  | 'plugins:execute'
  | 'plugins:manage'
  | 'ai:read'
  | 'ai:write'
  | 'ai:execute'
  | 'metrics:read'
  | 'metrics:write'
  | 'metrics:export'
  | 'metrics:reset'
  | 'logs:read'
  | 'logs:export'
  | 'logs:clear'
  | 'commands:read'
  | 'commands:execute'
  | 'commands:queue'
  | 'commands:cancel'
  | 'framework:read'
  | 'framework:shutdown'
  | 'framework:restart'
  | 'license:read'
  | 'license:write'
  | 'license:manage'
  | 'settings:read'
  | 'settings:write'
  | 'users:read'
  | 'users:write'
  | 'users:manage'
  | 'audit:read'

// Permission matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.VIEWER]: [
    'dashboard:read',
    'kernel:read',
    'trainer:read',
    'replay:read',
    'plugins:read',
    'ai:read',
    'metrics:read',
    'logs:read',
    'commands:read',
    'framework:read',
    'license:read',
    'settings:read',
  ],
  [UserRole.OPERATOR]: [
    // All viewer permissions
    'dashboard:read',
    'kernel:read',
    'trainer:read',
    'replay:read',
    'plugins:read',
    'ai:read',
    'metrics:read',
    'logs:read',
    'commands:read',
    'framework:read',
    'license:read',
    'settings:read',
    // Operator permissions
    'kernel:execute',
    'trainer:execute',
    'trainer:pause',
    'trainer:resume',
    'replay:execute',
    'commands:execute',
    'commands:queue',
  ],
  [UserRole.DEVELOPER]: [
    // All operator permissions
    'dashboard:read',
    'kernel:read',
    'kernel:execute',
    'trainer:read',
    'trainer:execute',
    'trainer:pause',
    'trainer:resume',
    'replay:read',
    'replay:execute',
    'plugins:read',
    'ai:read',
    'metrics:read',
    'logs:read',
    'commands:read',
    'commands:execute',
    'commands:queue',
    'framework:read',
    'license:read',
    'settings:read',
    // Developer permissions
    'kernel:write',
    'kernel:restart',
    'trainer:write',
    'replay:write',
    'plugins:write',
    'plugins:execute',
    'plugins:manage',
    'ai:write',
    'ai:execute',
    'metrics:write',
    'metrics:export',
    'metrics:reset',
    'logs:export',
    'commands:cancel',
  ],
  [UserRole.ADMINISTRATOR]: [
    // All developer permissions
    'dashboard:read',
    'kernel:read',
    'kernel:write',
    'kernel:execute',
    'kernel:restart',
    'trainer:read',
    'trainer:write',
    'trainer:execute',
    'trainer:pause',
    'trainer:resume',
    'replay:read',
    'replay:write',
    'replay:execute',
    'plugins:read',
    'plugins:write',
    'plugins:execute',
    'plugins:manage',
    'ai:read',
    'ai:write',
    'ai:execute',
    'metrics:read',
    'metrics:write',
    'metrics:export',
    'metrics:reset',
    'logs:read',
    'logs:export',
    'logs:clear',
    'commands:read',
    'commands:execute',
    'commands:queue',
    'commands:cancel',
    'framework:read',
    'license:read',
    'license:write',
    'license:manage',
    'settings:read',
    'settings:write',
    'users:read',
    'users:write',
    'audit:read',
    // Administrator permissions
    'framework:shutdown',
    'framework:restart',
  ],
  [UserRole.OWNER]: [
    // All permissions
    'dashboard:read',
    'kernel:read',
    'kernel:write',
    'kernel:execute',
    'kernel:restart',
    'trainer:read',
    'trainer:write',
    'trainer:execute',
    'trainer:pause',
    'trainer:resume',
    'replay:read',
    'replay:write',
    'replay:execute',
    'plugins:read',
    'plugins:write',
    'plugins:execute',
    'plugins:manage',
    'ai:read',
    'ai:write',
    'ai:execute',
    'metrics:read',
    'metrics:write',
    'metrics:export',
    'metrics:reset',
    'logs:read',
    'logs:export',
    'logs:clear',
    'commands:read',
    'commands:execute',
    'commands:queue',
    'commands:cancel',
    'framework:read',
    'framework:shutdown',
    'framework:restart',
    'license:read',
    'license:write',
    'license:manage',
    'settings:read',
    'settings:write',
    'users:read',
    'users:write',
    'users:manage',
    'audit:read',
  ],
}

export class PermissionsService {
  private authService: AuthService

  constructor(authService?: AuthService) {
    this.authService = authService || getAuthService()
  }

  // Check if current user has permission
  hasPermission(permission: Permission): boolean {
    const state = this.authService.getState()
    if (!state.user) return false

    const permissions = ROLE_PERMISSIONS[state.user.role]
    return permissions.includes(permission)
  }

  // Check if user has any of the permissions
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some((p) => this.hasPermission(p))
  }

  // Check if user has all of the permissions
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every((p) => this.hasPermission(p))
  }

  // Get all permissions for current user
  getPermissions(): Permission[] {
    const state = this.authService.getState()
    if (!state.user) return []

    return [...ROLE_PERMISSIONS[state.user.role]]
  }

  // Get minimum role for permission
  getMinimumRoleForPermission(permission: Permission): UserRole | null {
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      if (permissions.includes(permission)) {
        return role as UserRole
      }
    }
    return null
  }

  // Check if role can access resource
  canAccessResource(role: UserRole, resource: string): boolean {
    const permissions = ROLE_PERMISSIONS[role]
    return permissions.some((p) => p.startsWith(resource.split(':')[0]))
  }

  // Get role display name
  static getRoleDisplayName(role: UserRole): string {
    const names: Record<UserRole, string> = {
      [UserRole.VIEWER]: 'Viewer',
      [UserRole.OPERATOR]: 'Operator',
      [UserRole.DEVELOPER]: 'Developer',
      [UserRole.ADMINISTRATOR]: 'Administrator',
      [UserRole.OWNER]: 'Owner',
    }
    return names[role] || 'Unknown'
  }

  // Get role description
  static getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      [UserRole.VIEWER]: 'Read-only access to dashboard',
      [UserRole.OPERATOR]: 'Can control training and replay',
      [UserRole.DEVELOPER]: 'Can manage plugins and export data',
      [UserRole.ADMINISTRATOR]: 'Full system control except user management',
      [UserRole.OWNER]: 'Full access to all features',
    }
    return descriptions[role] || ''
  }

  // Get all roles
  static getAllRoles(): UserRole[] {
    return [
      UserRole.VIEWER,
      UserRole.OPERATOR,
      UserRole.DEVELOPER,
      UserRole.ADMINISTRATOR,
      UserRole.OWNER,
    ]
  }
}

// Singleton instance
let permissionsInstance: PermissionsService | null = null

export function getPermissionsService(): PermissionsService {
  if (!permissionsInstance) {
    permissionsInstance = new PermissionsService()
  }
  return permissionsInstance
}
