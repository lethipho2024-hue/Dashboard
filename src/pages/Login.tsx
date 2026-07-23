// Login Page
// Authentication login screen

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLicense } from '../hooks/useLicense'
import {
  Zap,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Keyboard,
} from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, isDeveloperMode, setDeveloperMode } = useAuth()
  const { validation: licenseValidation, getEditionName } = useLicense()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await login({ username, password, remember_me: rememberMe })

    if (result.status === 'authenticated') {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">ZBGym</h1>
          <p className="text-[var(--text-secondary)]">Sign in to your account</p>
        </div>

        {/* Developer Mode Toggle */}
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isDeveloperMode}
              onChange={(e) => setDeveloperMode(e.target.checked)}
              className="w-4 h-4 rounded border-yellow-500/50 text-yellow-500 focus:ring-yellow-500/50"
            />
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium">
                Local Developer Mode
              </span>
            </div>
          </label>
          <p className="mt-2 text-xs text-yellow-400/70">
            Enable to bypass authentication in local development. Do not use in production.
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-blue-500 focus:ring-blue-500/50"
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* License Status */}
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            License Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {licenseValidation.valid ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span
                className={`text-sm ${
                  licenseValidation.valid
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {licenseValidation.valid
                  ? `Valid - ${getEditionName(licenseValidation.license?.edition)}`
                  : 'No valid license'}
              </span>
            </div>
            {licenseValidation.warnings.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-yellow-400">
                  {licenseValidation.warnings[0]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[var(--text-tertiary)]">
          ZBGym Dashboard v1.0.0
        </p>
      </div>
    </div>
  )
}
