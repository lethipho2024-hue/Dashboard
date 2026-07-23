// UserMenu Component
// User dropdown menu

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'
import { useLicense } from '../hooks/useLicense'
import {
  User,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  Key,
  Clock,
} from 'lucide-react'
import { PermissionsService } from '../services/auth'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const { getRoleName } = usePermissions()
  const { license, getEditionName } = useLicense()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const roleColors: Record<string, string> = {
    viewer: 'bg-gray-500/20 text-gray-400',
    operator: 'bg-blue-500/20 text-blue-400',
    developer: 'bg-yellow-500/20 text-yellow-400',
    administrator: 'bg-orange-500/20 text-orange-400',
    owner: 'bg-red-500/20 text-red-400',
  }

  const roleColor = roleColors[user.role] || roleColors.viewer

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {user.username}
          </p>
          <p className={`text-xs ${roleColor} capitalize`}>
            {getRoleName()}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-[var(--bg-secondary)] border border-white/10 shadow-xl overflow-hidden animate-fade-in">
          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  {user.username}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {user.email || 'No email'}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${roleColor}`}>
                {getRoleName()}
              </span>
              {license && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400">
                  {getEditionName(license.edition)}
                </span>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
              <User className="w-4 h-4 text-[var(--text-secondary)]" />
              <div>
                <p className="text-sm text-[var(--text-primary)]">Profile</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Manage your account
                </p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
              <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
              <div>
                <p className="text-sm text-[var(--text-primary)]">Permissions</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  View your access rights
                </p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
              <Key className="w-4 h-4 text-[var(--text-secondary)]" />
              <div>
                <p className="text-sm text-[var(--text-primary)]">License</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {license ? license.organization || 'Active' : 'No license'}
                </p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
              <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
              <div>
                <p className="text-sm text-[var(--text-primary)]">Settings</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Configure dashboard
                </p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left text-red-400"
            >
              <LogOut className="w-4 h-4" />
              <p className="text-sm">Logout</p>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
