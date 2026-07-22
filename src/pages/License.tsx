import { Check, AlertTriangle, Monitor, Globe, RefreshCw } from 'lucide-react'

export default function License() {
  const licenseInfo = {
    status: 'Active',
    type: 'Pro',
    expireDate: '2025-12-31',
    devices: 3,
    maxDevices: 5,
  }

  const devices = [
    { name: 'MacBook Pro', type: 'Desktop', lastActive: '2 min ago', status: 'online' },
    { name: 'iMac', type: 'Desktop', lastActive: '1 hour ago', status: 'online' },
    { name: 'iPhone 15', type: 'Mobile', lastActive: '5 min ago', status: 'online' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">License Center</h1>
          <p className="text-text-secondary mt-1">Manage your ZBGym license</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Check for Updates
        </button>
      </div>

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
              <p className="text-text-secondary">Your license is valid and up to date</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-text-secondary">License Type</span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                Pro Edition
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-text-secondary">Expiration Date</span>
              <span className="text-text-primary font-medium">{licenseInfo.expireDate}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-text-secondary">License Key</span>
              <span className="font-mono text-sm text-text-primary">ZBGM-XXXX-XXXX-XXXX</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="btn btn-secondary flex-1">View Details</button>
            <button className="btn btn-secondary flex-1">Renew License</button>
          </div>
        </div>

        {/* Devices Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Active Devices</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary">{licenseInfo.devices} of {licenseInfo.maxDevices} devices</span>
              <span className="text-text-primary font-medium">{licenseInfo.devices}/{licenseInfo.maxDevices}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ width: `${(licenseInfo.devices / licenseInfo.maxDevices) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {devices.map((device, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-text-primary font-medium">{device.name}</p>
                    <p className="text-xs text-text-secondary">{device.type} · {device.lastActive}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-green-400 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Online
                </span>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-text-secondary text-sm transition-colors">
            Manage Devices
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Pro Features</h3>
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
                <AlertTriangle className="w-5 h-5 text-text-secondary" />
              )}
              <span className={`text-sm ${feature.included ? 'text-text-primary' : 'text-text-secondary'}`}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Activation History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Activation History</h3>
        <div className="space-y-3">
          {[
            { date: '2024-01-15', event: 'License renewed', device: 'MacBook Pro' },
            { date: '2024-01-10', event: 'Device activated', device: 'iMac' },
            { date: '2023-12-01', event: 'Initial activation', device: 'MacBook Pro' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-text-secondary" />
                <div>
                  <p className="text-text-primary text-sm">{item.event}</p>
                  <p className="text-xs text-text-secondary">{item.device}</p>
                </div>
              </div>
              <span className="text-xs text-text-secondary">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
