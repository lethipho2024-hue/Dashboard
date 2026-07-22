import { Clock, Activity, Package, Heart, Gauge, Zap, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { useHealth, useStats, useSessions } from '../services/zbgym'

export default function Kernel() {
  const { data: health, loading: healthLoading } = useHealth()
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useStats()
  const { data: sessions, loading: sessionsLoading } = useSessions()

  const isLoading = healthLoading || statsLoading || sessionsLoading

  // Calculate kernel metrics from available data
  const activeSessions = sessions?.filter(s => s.status === 'running') || []
  const completedSessions = sessions?.filter(s => s.status === 'completed') || []
  const totalSteps = sessions?.reduce((acc, s) => acc + (s.current_timestep || 0), 0) || 0

  const kernelCards = [
    { 
      title: 'Health Status', 
      value: health?.status === 'healthy' ? 'Healthy' : 'Unhealthy', 
      icon: Heart,
      color: health?.status === 'healthy' ? 'green' : 'red',
      description: 'Framework connection status'
    },
    { 
      title: 'Total Sessions', 
      value: stats?.total_sessions?.toString() || '0', 
      icon: Activity,
      color: 'blue',
      description: 'All training sessions'
    },
    { 
      title: 'Active Sessions', 
      value: stats?.active_sessions?.toString() || '0', 
      icon: Zap,
      color: 'purple',
      description: 'Currently running'
    },
    { 
      title: 'Total Models', 
      value: stats?.total_models?.toString() || '0', 
      icon: Package,
      color: 'green',
      description: 'Trained models'
    },
    { 
      title: 'Completed', 
      value: completedSessions.length.toString(), 
      icon: Activity,
      color: 'green',
      description: 'Finished sessions'
    },
    { 
      title: 'Total Steps', 
      value: totalSteps.toLocaleString(), 
      icon: Gauge,
      color: 'blue',
      description: 'Timesteps processed'
    },
    { 
      title: 'Latest Reward', 
      value: sessions?.[0]?.mean_reward?.toFixed(2) || '-', 
      icon: Heart,
      color: 'purple',
      description: 'Last session reward'
    },
    { 
      title: 'Framework Status', 
      value: health?.status === 'healthy' ? 'Online' : 'Offline', 
      icon: Clock,
      color: health?.status === 'healthy' ? 'green' : 'yellow',
      description: 'Backend connection'
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
          <button onClick={refetchStats} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className={`status-dot ${health?.status === 'healthy' ? 'status-healthy' : 'status-warning'}`} />
          <span className={`text-sm font-medium ${health?.status === 'healthy' ? 'text-green-400' : 'text-yellow-400'}`}>
            {health?.status === 'healthy' ? 'Framework Online' : 'Framework Offline'}
          </span>
        </div>
      </div>

      {/* Error/Loading State */}
      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-3" />
          <span className="text-[var(--text-secondary)]">Loading kernel metrics...</span>
        </div>
      )}

      {/* No Data Message */}
      {!isLoading && health?.status !== 'healthy' && (
        <div className="card bg-yellow-500/10 border border-yellow-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-400">Cannot connect to ZBGym backend. Make sure the backend is running on port 8080.</p>
          </div>
        </div>
      )}

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

      {/* Backend Limitation Notice */}
      <div className="card bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">Kernel Data from Backend</h3>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <p>• <strong>Available:</strong> Health status, session counts, model counts, latest reward</p>
          <p>• <strong>Not available:</strong> Runtime, tick count, TPS (ticks per second), event dispatcher, module manager</p>
          <p className="text-xs mt-2 opacity-75">
            These metrics require additional endpoints in the ZBGym backend (e.g., /kernel/status, /kernel/metrics)
          </p>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Active Training Sessions</h3>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Session #{session.id}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{session.algorithm} - {session.env_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-primary)] font-mono">{session.current_timestep.toLocaleString()} steps</p>
                  <p className="text-xs text-[var(--text-secondary)]">Reward: {session.mean_reward.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Information - Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card opacity-60">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">System Information</h3>
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <p className="text-sm text-[var(--text-secondary)]">
              System info (version, architecture) requires additional backend endpoint.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Version', value: 'N/A' },
              { label: 'Build', value: 'N/A' },
              { label: 'Architecture', value: 'N/A' },
              { label: 'Python Version', value: 'N/A' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-[var(--text-secondary)]">{item.label}</span>
                <span className="text-[var(--text-primary)] font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card opacity-60">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Performance</h3>
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Performance metrics (CPU, memory, GPU) require additional backend endpoint.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">CPU Time</span>
                <span className="text-[var(--text-primary)]">N/A</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-blue-500 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Memory Usage</span>
                <span className="text-[var(--text-primary)]">N/A</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-purple-500 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">GPU Utilization</span>
                <span className="text-[var(--text-primary)]">N/A</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
