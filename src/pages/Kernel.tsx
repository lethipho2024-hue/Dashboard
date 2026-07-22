import { Clock, Activity, Package, Heart, Gauge, Zap } from 'lucide-react'

export default function Kernel() {
  const kernelCards = [
    { 
      title: 'Runtime', 
      value: '02:34:12', 
      icon: Clock,
      color: 'blue',
      description: 'Total execution time'
    },
    { 
      title: 'Current Tick', 
      value: '12,847', 
      icon: Activity,
      color: 'green',
      description: 'Current tick count'
    },
    { 
      title: 'Current Stage', 
      value: 'Training', 
      icon: Zap,
      color: 'purple',
      description: 'Active execution stage'
    },
    { 
      title: 'TPS', 
      value: '60', 
      icon: Gauge,
      color: 'blue',
      description: 'Ticks per second'
    },
    { 
      title: 'Event Dispatcher', 
      value: 'Active', 
      icon: Activity,
      color: 'green',
      description: 'Events processed: 1,247'
    },
    { 
      title: 'Module Manager', 
      value: '24', 
      icon: Package,
      color: 'purple',
      description: 'Modules loaded'
    },
    { 
      title: 'Health Monitor', 
      value: '98%', 
      icon: Heart,
      color: 'green',
      description: 'System health'
    },
    { 
      title: 'Metrics Collector', 
      value: 'Active', 
      icon: Activity,
      color: 'blue',
      description: 'Collecting 24 metrics'
    },
  ]

  const colorMap = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Kernel</h1>
          <p className="text-[var(--text-secondary)] mt-1">Core kernel status and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot status-healthy" />
          <span className="text-sm font-medium text-green-400">Kernel Active</span>
        </div>
      </div>

      {/* Kernel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kernelCards.map((card) => {
          const Icon = card.icon
          const colors = colorMap[card.color as keyof typeof colorMap]
          return (
            <div key={card.title} className="card group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg} transition-transform group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{card.title}</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{card.value}</p>
              <p className="text-sm text-[var(--text-secondary)] mt-2">{card.description}</p>
            </div>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Execution Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
          <div className="space-y-6">
            {[
              { time: '00:00:00', event: 'Kernel initialized', status: 'success' },
              { time: '00:00:01', event: 'Loading modules...', status: 'info' },
              { time: '00:00:05', event: '24 modules loaded', status: 'success' },
              { time: '00:00:10', event: 'Starting execution loop', status: 'info' },
              { time: '00:00:15', event: 'Training stage started', status: 'info' },
              { time: '02:34:12', event: 'Current: Tick 12,847', status: 'success' },
            ].map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-10">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full ${
                  item.status === 'success' ? 'bg-green-500' :
                  item.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-mono text-[var(--text-secondary)]">{item.time}</p>
                  <p className="text-[var(--text-primary)]">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kernel Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">System Information</h3>
          <div className="space-y-3">
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Build', value: 'Release' },
              { label: 'Architecture', value: 'x86_64' },
              { label: 'Python Version', value: '3.11.0' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-[var(--text-secondary)]">{item.label}</span>
                <span className="text-[var(--text-primary)] font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">CPU Time</span>
                <span className="text-[var(--text-primary)]">1,247s</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-blue-500 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Memory Usage</span>
                <span className="text-[var(--text-primary)]">14.2 GB</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-purple-500 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">GPU Utilization</span>
                <span className="text-[var(--text-primary)]">82%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[82%] bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
