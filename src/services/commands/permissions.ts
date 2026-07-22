// Command Permissions
// Permission level helpers for commands

import { PermissionLevel } from './types'

const PERMISSION_LEVELS: Record<PermissionLevel, number> = {
  [PermissionLevel.VIEWER]: 0,
  [PermissionLevel.OPERATOR]: 1,
  [PermissionLevel.DEVELOPER]: 2,
  [PermissionLevel.ADMINISTRATOR]: 3,
}

export function hasPermission(
  userLevel: PermissionLevel,
  requiredLevel: PermissionLevel
): boolean {
  return PERMISSION_LEVELS[userLevel] >= PERMISSION_LEVELS[requiredLevel]
}

export function getPermissionLabel(level: PermissionLevel): string {
  const labels: Record<PermissionLevel, string> = {
    [PermissionLevel.VIEWER]: 'Viewer',
    [PermissionLevel.OPERATOR]: 'Operator',
    [PermissionLevel.DEVELOPER]: 'Developer',
    [PermissionLevel.ADMINISTRATOR]: 'Administrator',
  }
  return labels[level]
}

export function getPermissionColor(level: PermissionLevel): string {
  const colors: Record<PermissionLevel, string> = {
    [PermissionLevel.VIEWER]: 'gray',
    [PermissionLevel.OPERATOR]: 'blue',
    [PermissionLevel.DEVELOPER]: 'yellow',
    [PermissionLevel.ADMINISTRATOR]: 'red',
  }
  return colors[level]
}

export function canExecute(
  userLevel: PermissionLevel,
  commandLevel: PermissionLevel
): boolean {
  return hasPermission(userLevel, commandLevel)
}

export function isAdminCommand(commandName: string): boolean {
  const adminCommands = [
    'framework_shutdown',
    'framework_restart',
  ]
  return adminCommands.includes(commandName)
}

export function isDestructiveCommand(commandName: string): boolean {
  const destructiveCommands = [
    'stop_kernel',
    'restart_kernel',
    'stop_training',
    'clear_replay_queue',
    'clear_logs',
    'reset_metrics',
    'unload_plugin',
    'disable_plugin',
    'framework_shutdown',
    'framework_restart',
    'reset_runtime',
  ]
  return destructiveCommands.includes(commandName)
}

export function requiresDeveloperLevel(commandName: string): boolean {
  const developerCommands = [
    'restart_kernel',
    'reset_runtime',
    'clear_replay_queue',
    'clear_logs',
    'reset_metrics',
    'load_plugin',
    'unload_plugin',
    'reload_plugin',
  ]
  return developerCommands.includes(commandName)
}

export function getMinimumPermissionLevel(commandName: string): PermissionLevel {
  if (isAdminCommand(commandName)) return PermissionLevel.ADMINISTRATOR
  if (requiresDeveloperLevel(commandName)) return PermissionLevel.DEVELOPER
  return PermissionLevel.OPERATOR
}

// Get user permission from localStorage or default
export function getCurrentUserPermission(): PermissionLevel {
  const stored = localStorage.getItem('command_user_level')
  if (stored && Object.values(PermissionLevel).includes(stored as PermissionLevel)) {
    return stored as PermissionLevel
  }
  return PermissionLevel.OPERATOR
}

// Set user permission
export function setCurrentUserPermission(level: PermissionLevel): void {
  localStorage.setItem('command_user_level', level)
}

// User ID for command tracking
export function getCurrentUserId(): string {
  let userId = localStorage.getItem('command_user_id')
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('command_user_id', userId)
  }
  return userId
}
