import { Clock, Activity, Package, Heart, Gauge, Zap, Cpu, Loader2 } from 'lucide-react'
import { useKernel, useFramework, useMetrics, useHealth, useConnection } from '../store'

export default function Kernel() {
  const { status: kernel, getTickFormatted, getStageLabel } = useKernel()
  const { status: framework } = useFramework()
  const { current: metrics } = useMetrics()
  const { status: health, getHealthLabel } = useHealth()
  const { latency } = useConnection()

  const colorMap = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  }

  const kernelCards = [
    { 
      title: 'Kernel Status', 
      value: kernel.running ? 'Running' : 'Stopped', 
      icon: Cpu,
      color: kernel.running ? 'green' : 'red',
      description: kernel.running ? `Stage: ${getStageLabel()}` : 'Kernel is not running'
    },
    { 
      title: 'Current Tick', 
      value: getTickFormatted(), 
      icon: Activity,
      color: 'blue',
      description: `${kernel.tick_rate.toFixed(2)} ticks/sec`
    },
    { 
      title: 'Scheduler Queue', 
      value: kernel.scheduler_queue_size.toString(), 
      icon: Package,
      color: 'purple',
      description: 'Pending operations'
    },
    { 
      title: 'Tick Duration', 
      value: `${kernel.tick_duration_ms.toFixed(2)}ms`, 
      icon: Clock,
      color: 'green',
      description: 'Average tick time'
    },
    { 
      title: 'Runtime Status', 
      value: kernel.runtime_status, 
      icon: Zap,
      color: 'blue',
      description: 'Current runtime state'
    },
    { 
      title: 'Health Score', 
      value: `${health.health_score}%`, 
      icon: Heart,
      color: getHealthLabel() === 'Healthy' ? 'green' : getHealthLabel() === 'Degraded' ? 'yellow' : 'red',
      description: getHealthLabel()
    },
    { 
      title: 'Framework Version', 
      value: framework.version, 
      icon: Package,
      color: 'blue',
      description: 'Framework version'
    },
    { 
      title: 'Latency', 
      value: `${latency}ms`, 
      icon: Gauge,
      color: latency < 100 ? 'green' : latency < 500 ? 'yellow' : 'red',
      description: 'Gateway connection'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Kernel</h1>
          <p className="text-[var(--text-secondary)] mt-1">Real-time kernel status and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${kernel.running ? 'status-healthy' : 'status-warning'}`} />
          <span className={`text-sm font-medium ${kernel.running ? 'text-green-400' : 'text-yellow-400'}`}>
            {kernel.running ? 'Kernel Active' : 'Kernel Inactive'}
          </span>
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

      {/* Detailed Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kernel Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Kernel Details</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Running</span>
                <span className={`font-medium ${kernel.running ? 'text-green-400' : 'text-gray-400'}`}>
                  {kernel.running ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${kernel.running ? 'bg-green-500' : 'bg-gray-500'} rounded-full transition-all`} style={{ width: kernel.running ? '100%' : '0%' }} />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Current Stage</span>
              <span className="text-[var(--text-primary)] font-medium">{getStageLabel()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Tick Rate</span>
              <span className="text-[var(--text-primary)] font-mono">{kernel.tick_rate.toFixed(2)} tps</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Tick Duration</span>
              <span className="text-[var(--text-primary)] font-mono">{kernel.tick_duration_ms.toFixed(2)} ms</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Scheduler Queue</span>
              <span className="text-[var(--text-primary)] font-mono">{kernel.scheduler_queue_size}</span>
            </div>
          </div>
        </div>

        {/* Framework Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Framework Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Framework</span>
              <span className={`font-medium ${framework.running ? 'text-green-400' : 'text-gray-400'}`}>
                {framework.running ? 'Running' : 'Stopped'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Version</span>
              <span className="text-[var(--text-primary)] font-mono">{framework.version}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Type</span>
              <span className="text-[var(--text-primary)]">{framework.framework_type}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">PID</span>
              <span className="text-[var(--text-primary)] font-mono">{framework.pid || 'N/A'}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Total Sessions</span>
              <span className="text-[var(--text-primary)]">{framework.total_sessions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">FPS</span>
              <span className="text-[var(--text-primary)] font-mono">{metrics.fps.toFixed(0)}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(metrics.fps, 100)}%` }} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">CPU</span>
              <span className="text-[var(--text-primary)] font-mono">{metrics.cpu_usage_percent.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${metrics.cpu_usage_percent}%` }} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Memory</span>
              <span className="text-[var(--text-primary)] font-mono">{metrics.memory_usage_mb.toFixed(0)} MB</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(metrics.memory_usage_mb / 10, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
