import { useState } from 'react'
import { Check, AlertTriangle, Monitor, Globe, RefreshCw, Loader2 } from 'lucide-react'
import { licenseInfo, activationHistory } from '../services/mock'

export default function License() {
  const [checking, setChecking] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)

  const handleCheckUpdates = () => {
    setChecking(true)
    setUpdateStatus(null)
    setTimeout(() => {
      setChecking(false)
      setUpdateStatus('You are running the latest version (v5.0.2)')
    }, 2000)
  }

  const handleRenew = () => {
    setUpdateStatus('Redirecting to license renewal page...')
  }

  const handleViewDetails = () => {
    setUpdateStatus('License details: Pro Edition, 5 seats, Premium Support')
  }

  const handleManageDevices = () => {
    setUpdateStatus('Device management panel opened')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">License Center</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your ZBGym license</p>
        </div>
        <button
          onClick={handleCheckUpdates}
          disabled={checking}
          className="btn btn-primary flex items-center gap-2"
        >
          {checking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Check for Updates
        </button>
      </div>

      {updateStatus && (
        <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm">
          {updateStatus}
        </div>
      )}

      {/* License Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-green-500/20">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-400">License Active</h3>
              <p className="text-[var(--text-secondary)]">Your license is valid and up to date</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-[var(--text-secondary)]">License Type</span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                Pro Edition
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-[var(--text-secondary)]">Expiration Date</span>
              <span className="text-[var(--text-primary)] font-medium">{licenseInfo.expiryDate}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-[var(--text-secondary)]">License Key</span>
              <span className="font-mono text-sm text-[var(--text-primary)]">{licenseInfo.key}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleViewDetails} className="btn btn-secondary flex-1">View Details</button>
            <button onClick={handleRenew} className="btn btn-secondary flex-1">Renew License</button>
          </div>
        </div>

        {/* Devices Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Active Devices</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-secondary)]">{licenseInfo.usedSeats} of {licenseInfo.seats} devices</span>
              <span className="text-[var(--text-primary)] font-medium">{licenseInfo.usedSeats}/{licenseInfo.seats}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${(licenseInfo.usedSeats / licenseInfo.seats) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {[
              { name: 'MacBook Pro (Primary)', type: 'Desktop', lastActive: '2 min ago', status: 'online' },
              { name: 'Windows Desktop', type: 'Desktop', lastActive: '1 hour ago', status: 'online' },
              { name: 'iPad Pro (Secondary)', type: 'Mobile', lastActive: '5 min ago', status: 'online' },
            ].map((device, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-[var(--text-secondary)]" />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">{device.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{device.type} · {device.lastActive}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-green-400 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Online
                </span>
              </div>
            ))}
          </div>

          <button onClick={handleManageDevices} className="w-full mt-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-[var(--text-secondary)] text-sm transition-colors">
            Manage Devices
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Pro Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Unlimited AI Agents', included: true },
            { name: 'Advanced Analytics', included: true },
            { name: 'Priority Support', included: true },
            { name: 'Cloud Sync', included: true },
            { name: 'Custom Plugins', included: true },
            { name: 'Multi-Device', included: true },
            { name: 'API Access', included: true },
            { name: 'Team Collaboration', included: false },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[var(--text-secondary)]" />
              )}
              <span className={`text-sm ${feature.included ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Activation History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Activation History</h3>
        <div className="space-y-3">
          {activationHistory.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[var(--text-secondary)]" />
                <div>
                  <p className="text-[var(--text-primary)] text-sm">{item.event}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{item.device}</p>
                </div>
              </div>
              <span className="text-xs text-[var(--text-secondary)]">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
