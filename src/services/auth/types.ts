// Auth Types
// Type definitions for authentication system

export enum AuthStatus {
  UNKNOWN = 'unknown',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  SESSION_EXPIRED = 'session_expired',
  TOKEN_INVALID = 'token_invalid',
}

export enum UserRole {
  VIEWER = 'viewer',
  OPERATOR = 'operator',
  DEVELOPER = 'developer',
  ADMINISTRATOR = 'administrator',
  OWNER = 'owner',
}

export interface User {
  id: string
  username: string
  email?: string
  role: UserRole
  created_at: string
  last_login?: string
  avatar_url?: string
}

export interface LoginCredentials {
  username: string
  password: string
  remember_me?: boolean
}

export interface LoginResponse {
  success: boolean
  user?: User
  access_token: string
  refresh_token: string
  expires_in: number
  message?: string
}

export interface TokenPayload {
  sub: string
  role: UserRole
  exp: number
  iat: number
  session_id: string
}

export interface Session {
  id: string
  user_id: string
  username: string
  role: UserRole
  access_token: string
  refresh_token: string
  expires_at: string
  last_activity: string
  created_at: string
  remember_me: boolean
}

export interface AuthState {
  status: AuthStatus
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
}

export interface Permission {
  resource: string
  actions: ('read' | 'write' | 'delete' | 'execute')[]
}

export interface RolePermissions {
  [UserRole.VIEWER]: Permission[]
  [UserRole.OPERATOR]: Permission[]
  [UserRole.DEVELOPER]: Permission[]
  [UserRole.ADMINISTRATOR]: Permission[]
  [UserRole.OWNER]: Permission[]
}

// License Types
export enum LicenseEdition {
  TRIAL = 'trial',
  DEVELOPER = 'developer',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  UNLIMITED = 'unlimited',
}

export enum LicenseStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  INVALID = 'invalid',
  NOT_FOUND = 'not_found',
  PENDING = 'pending',
}

export interface License {
  id: string
  key: string
  edition: LicenseEdition
  status: LicenseStatus
  owner?: string
  organization?: string
  max_clients: number
  max_sessions: number
  features: string[]
  activated_at?: string
  expires_at?: string
  device_id?: string
  hardware_id?: string
  signature?: string
}

export interface LicenseValidation {
  valid: boolean
  license: License | null
  errors: string[]
  warnings: string[]
  offline_cache_valid: boolean
  offline_cache_expires?: string
}

export interface HardwareInfo {
  cpu_id: string
  motherboard_id: string
  mac_address: string
  machine_uuid: string
  os_identifier: string
  hostname: string
  fingerprint: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Audit Types
export interface AuditEntry {
  id: string
  timestamp: string
  event: string
  user_id?: string
  username?: string
  role?: UserRole
  resource?: string
  action?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}

export interface AuditFilter {
  start_date?: string
  end_date?: string
  event?: string
  user_id?: string
  resource?: string
  limit?: number
}
