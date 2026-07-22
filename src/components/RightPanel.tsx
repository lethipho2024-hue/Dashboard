import { Activity, Cpu, HardDrive, Zap, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { useState } from 'react'

export default function RightPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const stats = [
    { label: 'CPU', value: '67%', icon: Cpu, color: 'blue', width: 67 },
    { label: 'GPU', value: '82%', icon: Zap, color: 'purple', width: 82 },
    { label: 'VRAM', value: '6.2GB', icon: HardDrive, color: 'green', width: 62 },
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
        className="fixed bottom-4 right-4 z-40 p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 lg:hidden"
      >
        {isExpanded ? (
          <XCircle className="w-5 h-5 text-white" />
        ) : (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-white" />
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
                <span className="text-sm font-semibold text-[var(--text-primary)]">Status</span>
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
                      <span className="text-xs text-[var(--text-secondary)]">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
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
                    <p className="text-sm text-[var(--text-primary)] truncate">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Panel - Premium Floating Panel */}
      <aside className="hidden lg:flex flex-col w-80 bg-[var(--bg-secondary)] border-l border-white/5 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center glow-blue">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">System Status</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="status-dot status-healthy" />
                  <span className="text-xs text-[var(--accent-green)] font-medium">All Systems Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Health Score */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Health Score</span>
              <span className="text-2xl font-bold text-[var(--accent-green)]">98%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
                <div key={stat.label} className="card p-4 flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${
                    stat.color === 'blue' ? 'bg-blue-500/15 border border-blue-500/20' :
                    stat.color === 'purple' ? 'bg-purple-500/15 border border-purple-500/20' :
                    'bg-green-500/15 border border-green-500/20'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      stat.color === 'blue' ? 'text-blue-400' :
                      stat.color === 'purple' ? 'text-purple-400' : 'text-green-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{stat.value}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stat.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                          stat.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-400' :
                          'bg-gradient-to-r from-green-500 to-green-400'
                        }`}
                        style={{ width: `${stat.width}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current Tick */}
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Current Tick</span>
            </div>
            <p className="text-3xl font-mono font-bold text-[var(--text-primary)] tracking-tight">12,847</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1.5 font-medium">Runtime: 02:34:12</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">24</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">Modules</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">8</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">AI Agents</p>
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-1">Recent Alerts</h4>
            {warnings.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                {item.type === 'success' && (
                  <div className="p-1.5 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                )}
                {item.type === 'warning' && (
                  <div className="p-1.5 rounded-lg bg-yellow-500/10">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] truncate font-medium">{item.message}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
