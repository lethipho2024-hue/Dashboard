import { Activity, Cpu, HardDrive, Zap, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { useState } from 'react'

export default function RightPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const stats = [
    { label: 'CPU', value: '67%', icon: Cpu, color: 'blue' },
    { label: 'GPU', value: '82%', icon: Zap, color: 'purple' },
    { label: 'VRAM', value: '6.2GB', icon: HardDrive, color: 'green' },
  ]

  const warnings = [
    { type: 'success', message: 'All systems operational', time: 'now' },
    { type: 'warning', message: 'High memory usage', time: '5m' },
  ]

  // Mobile version - collapsible
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-blue-500 shadow-lg lg:hidden"
      >
        {isExpanded ? (
          <XCircle className="w-6 h-6 text-white" />
        ) : (
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-white" />
            <span className="status-dot status-healthy" />
          </div>
        )}
      </button>

      {/* Mobile Panel */}
      <aside 
        className={`
          fixed bottom-20 right-4 z-40 w-[calc(100%-2rem)] max-w-sm
          lg:hidden transform transition-all duration-300 ease-out
          ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <div className="glass rounded-2xl p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Framework Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-text-primary">Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="status-dot status-healthy" />
                <span className="text-green-400 text-sm font-medium">Running</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="glass rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${
                        stat.color === 'blue' ? 'text-blue-400' :
                        stat.color === 'purple' ? 'text-purple-400' : 'text-green-400'
                      }`} />
                      <span className="text-xs text-text-secondary">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                  </div>
                )
              })}
            </div>

            {/* Quick Alerts */}
            <div className="space-y-2">
              {warnings.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  {item.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                  {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Panel */}
      <aside className="hidden lg:block w-72 bg-bg-secondary border-l border-white/5 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Framework Status */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-text-primary">Framework Status</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-dot status-healthy" />
              <span className="text-green-400 text-sm font-medium">Running</span>
            </div>
            <p className="text-xs text-text-secondary mt-2">Tick: 12,847</p>
          </div>

          {/* Health Score */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Health Score</h3>
              <span className="text-2xl font-bold text-green-400">98%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: '98%' }}
              />
            </div>
          </div>

          {/* System Stats */}
          <div className="space-y-3">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="card flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                    <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-text-secondary">{stat.label}</p>
                    <p className="text-sm font-semibold text-text-primary">{stat.value}</p>
                  </div>
                  <div className="w-16 h-8 bg-white/5 rounded overflow-hidden">
                    <div 
                      className={`h-full bg-${stat.color}-500/60 rounded transition-all duration-300`}
                      style={{ width: stat.value.replace('%', '').replace('GB', '50') + '%' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current Tick */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-text-primary">Current Tick</h3>
            </div>
            <p className="text-2xl font-mono font-bold text-text-primary">12,847</p>
            <p className="text-xs text-text-secondary mt-1">Runtime: 02:34:12</p>
          </div>

          {/* Notifications & Warnings */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Alerts</h3>
            {warnings.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                {item.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                {item.type === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{item.message}</p>
                  <p className="text-xs text-text-secondary">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <p className="text-2xl font-bold text-text-primary">24</p>
              <p className="text-xs text-text-secondary">Modules</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-text-primary">8</p>
              <p className="text-xs text-text-secondary">AI Agents</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
