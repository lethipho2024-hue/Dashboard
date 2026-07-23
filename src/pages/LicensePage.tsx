// License Page
// License management page

import { useState } from 'react'
import { useLicense } from '../hooks/useLicense'
import { useAuth } from '../hooks/useAuth'
import {
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
  Zap,
  Crown,
  Building,
} from 'lucide-react'
import { LicenseEdition, LicenseStatus } from '../services/auth'

export default function LicensePage() {
  const { license, isValid, errors, warnings, activate, deactivate, refresh } =
    useLicense()
  const { hasRole } = useAuth()
  const [licenseKey, setLicenseKey] = useState('')
  const [isActivating, setIsActivating] = useState(false)
  const [activationError, setActivationError] = useState<string | null>(null)

  const canManage = hasRole('administrator' as any)

  const handleActivate = async () => {
    if (!licenseKey.trim()) return

    setIsActivating(true)
    setActivationError(null)

    try {
      const result = await activate(licenseKey)
      if (!result.valid) {
        setActivationError(result.errors.join(', '))
      } else {
        setLicenseKey('')
      }
    } catch (error) {
      setActivationError(error instanceof Error ? error.message : 'Activation failed')
    } finally {
      setIsActivating(false)
    }
  }

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate this license?')) {
      await deactivate()
    }
  }

  const getEditionIcon = (edition: LicenseEdition) => {
    switch (edition) {
      case LicenseEdition.TRIAL:
        return <Zap className="w-6 h-6" />
      case LicenseEdition.DEVELOPER:
        return <Shield className="w-6 h-6" />
      case LicenseEdition.PROFESSIONAL:
        return <Crown className="w-6 h-6" />
      case LicenseEdition.ENTERPRISE:
        return <Building className="w-6 h-6" />
      case LicenseEdition.UNLIMITED:
        return <Crown className="w-6 h-6" />
      default:
        return <Key className="w-6 h-6" />
    }
  }

  const getStatusIcon = (status: LicenseStatus) => {
    switch (status) {
      case LicenseStatus.VALID:
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case LicenseStatus.EXPIRED:
      case LicenseStatus.REVOKED:
      case LicenseStatus.INVALID:
        return <XCircle className="w-5 h-5 text-red-400" />
      case LicenseStatus.PENDING:
        return <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const editionColors: Record<LicenseEdition, string> = {
    [LicenseEdition.TRIAL]: 'bg-blue-500/20 text-blue-400',
    [LicenseEdition.DEVELOPER]: 'bg-green-500/20 text-green-400',
    [LicenseEdition.PROFESSIONAL]: 'bg-purple-500/20 text-purple-400',
    [LicenseEdition.ENTERPRISE]: 'bg-orange-500/20 text-orange-400',
    [LicenseEdition.UNLIMITED]: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            License Management
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage your ZBGym license
          </p>
        </div>
        {isValid && (
          <button
            onClick={refresh}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>

      {/* Current License */}
      {isValid && license ? (
        <div className="card">
          <div className="flex items-start gap-4">
            <div
              className={`p-4 rounded-xl ${
                editionColors[license.edition] || editionColors.developer
              }`}
            >
              {getEditionIcon(license.edition)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {license.organization || 'ZBGym License'}
                </h2>
                {getStatusIcon(license.status)}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    editionColors[license.edition] || editionColors.developer
                  }`}
                >
                  {license.edition}
                </span>
                <span className="px-3 py-1 rounded-lg text-sm bg-white/10 text-[var(--text-secondary)]">
                  ID: {license.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {license.owner && (
                  <div>
                    <p className="text-[var(--text-tertiary)]">Owner</p>
                    <p className="text-[var(--text-primary)]">{license.owner}</p>
                  </div>
                )}
                {license.expires_at && (
                  <div>
                    <p className="text-[var(--text-tertiary)]">Expires</p>
                    <p className="text-[var(--text-primary)]">
                      {new Date(license.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[var(--text-tertiary)]">Max Clients</p>
                  <p className="text-[var(--text-primary)]">
                    {license.max_clients}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)]">Max Sessions</p>
                  <p className="text-[var(--text-primary)]">
                    {license.max_sessions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
              Enabled Features
            </h3>
            <div className="flex flex-wrap gap-2">
              {license.features.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 rounded-lg text-xs bg-white/10 text-[var(--text-primary)]"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          {canManage && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleDeactivate}
                className="btn bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              >
                Deactivate License
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Activate License */
        <div className="card">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
              <Key className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              No Active License
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Enter your license key to activate ZBGym Dashboard and unlock all
              features.
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-blue-500/50 font-mono text-center uppercase tracking-wider"
              />

              {activationError && (
                <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {activationError}
                </div>
              )}

              <button
                onClick={handleActivate}
                disabled={isActivating || !licenseKey.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate License'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Errors & Warnings */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="card">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            Status Messages
          </h3>
          <div className="space-y-2">
            {errors.map((error, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            ))}
            {warnings.map((warning, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
              >
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-yellow-400">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* License Editions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Available Editions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.values(LicenseEdition).map((edition) => (
            <div
              key={edition}
              className={`p-4 rounded-xl border ${
                license?.edition === edition
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                editionColors[edition] || editionColors.developer
              }`}>
                {getEditionIcon(edition)}
              </div>
              <h4 className="font-medium text-[var(--text-primary)] capitalize">
                {edition}
              </h4>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {edition === LicenseEdition.TRIAL && '14-day trial'}
                {edition === LicenseEdition.DEVELOPER && 'For development'}
                {edition === LicenseEdition.PROFESSIONAL && 'For teams'}
                {edition === LicenseEdition.ENTERPRISE && 'For organizations'}
                {edition === LicenseEdition.UNLIMITED && 'Maximum features'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
