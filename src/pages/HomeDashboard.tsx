import { Activity, Cpu, HardDrive, MemoryStick, Bot, Clock, Zap, Gauge, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import StatCard from '../components/StatCard'
import ConnectionStatus from '../components/ConnectionStatus'
import { 
  useConnection, 
  useFramework, 
  useKernel, 
  useMetrics, 
  useHealth 
} from '../store'

export default function HomeDashboard() {
  const { status: connectionStatus, latency, isHealthy } = useConnection()
  const { status: framework, getUptimeFormatted } = useFramework()
  const { status: kernel, getTickFormatted, getStageLabel } = useKernel()
  const { current: metrics } = useMetrics()
  const { status: health, getHealthColor } = useHealth()

  const isConnected = connectionStatus === 'connected' && isHealthy
  const isFrameworkRunning = framework.running

  const statsCards = [
    { 
      title: 'Framework Status', 
      value: isFrameworkRunning ? 'Running' : 'Stopped', 
      icon: Activity, 
      color: (isFrameworkRunning ? 'green' : 'red') as 'green' | 'red',
      subtitle: `${framework.version} • Uptime: ${getUptimeFormatted()}`
    },
    { 
      title: 'Kernel Status', 
      value: kernel.running ? getStageLabel() : 'Offline', 
      icon: Cpu, 
      color: (kernel.running ? 'blue' : 'red') as 'blue' | 'red',
      subtitle: `Tick: ${getTickFormatted()} • ${kernel.tick_rate.toFixed(1)} tps`
    },
    { 
      title: 'Sessions', 
      value: framework.total_sessions.toString(), 
      icon: TrendingUp, 
      color: 'green' as const,
      subtitle: `${framework.active_sessions} active`
    },
    { 
      title: 'Health Score', 
      value: `${health.health_score}%`, 
      icon: Activity, 
      color: (getHealthColor() as 'green' | 'yellow' | 'red') as 'green' | 'yellow' | 'red',
      subtitle: health.warnings.length + health.errors.length > 0 
        ? `${health.errors.length} errors, ${health.warnings.length} warnings` 
        : 'All systems healthy'
    },
    { 
      title: 'GPU Usage', 
      value: `${metrics.gpu_usage_percent.toFixed(0)}%`, 
      icon: Zap, 
      color: 'purple' as const,
      subtitle: 'VRAM: ' + (metrics.vram_usage_mb > 1000 
        ? `${(metrics.vram_usage_mb/1000).toFixed(1)}GB` 
        : `${metrics.vram_usage_mb.toFixed(0)}MB`)
    },
    { 
      title: 'CPU', 
      value: `${metrics.cpu_usage_percent.toFixed(0)}%`, 
      icon: Gauge, 
      color: 'yellow' as const,
      subtitle: `${metrics.tick_time_ms.toFixed(2)}ms tick`
    },
    { 
      title: 'RAM', 
      value: metrics.memory_usage_mb > 1000 
        ? `${(metrics.memory_usage_mb/1000).toFixed(1)}GB` 
        : `${metrics.memory_usage_mb.toFixed(0)}MB`, 
      icon: MemoryStick, 
      color: 'blue' as const,
      subtitle: 'System memory'
    },
    { 
      title: 'FPS', 
      value: metrics.fps.toFixed(0), 
      icon: Activity, 
      color: 'green' as const,
      subtitle: 'Framework FPS'
    },
    { 
      title: 'Episodes', 
      value: metrics.episode_count.toLocaleString(), 
      icon: Bot, 
      color: 'purple' as const,
      subtitle: 'Total completed'
    },
    { 
      title: 'Reward Rate', 
      value: metrics.reward_rate.toFixed(2), 
      icon: TrendingUp, 
      color: 'green' as const,
      subtitle: 'Current reward/s'
    },
    { 
      title: 'Inference', 
      value: `${metrics.inference_time_ms.toFixed(0)}ms`, 
      icon: Zap, 
      color: 'blue' as const,
      subtitle: 'Avg inference time'
    },
    { 
      title: 'Connection', 
      value: connectionStatus === 'connected' ? `${latency}ms` : connectionStatus, 
      icon: Activity, 
      color: (connectionStatus === 'connected' ? 'green' : 'red') as 'green' | 'red',
      subtitle: 'Gateway latency'
    },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Monitor your framework status in real-time</p>
        </div>
        <ConnectionStatus />
      </div>

      {/* Stats Grid - Mobile optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-4">
        {statsCards.map((stat, index) => (
          <div 
            key={stat.title}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Quick Overview - Mobile optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Kernel Status */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-3 sm:mb-4">Kernel Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Status</span>
              <span className={`font-medium ${kernel.running ? 'text-green-400' : 'text-gray-400'}`}>
                {kernel.running ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Current Tick</span>
              <span className="font-mono text-[var(--text-primary)]">{getTickFormatted()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Stage</span>
              <span className="text-[var(--text-primary)]">{getStageLabel()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Tick Rate</span>
              <span className="font-mono text-[var(--text-primary)]">{kernel.tick_rate.toFixed(2)} tps</span>
            </div>
          </div>
        </div>

        {/* Framework Stats */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-3 sm:mb-4">Framework Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Version</span>
              <span className="text-[var(--text-primary)] font-semibold">{framework.version}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Total Sessions</span>
              <span className="text-[var(--text-primary)] font-semibold">{framework.total_sessions}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Active Sessions</span>
              <span className="text-green-400 font-semibold">{framework.active_sessions}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-[var(--text-secondary)]">Uptime</span>
              <span className="font-mono text-[var(--text-primary)]">{getUptimeFormatted()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
