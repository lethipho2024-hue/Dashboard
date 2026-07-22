import { Activity, Cpu, HardDrive, MemoryStick, Bot, Clock, Zap, Gauge, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import StatCard from '../components/StatCard'
import { useStats, useSessions, useHealth } from '../services/zbgym'

export default function HomeDashboard() {
  const { data: stats, loading: statsLoading, error: statsError } = useStats()
  const { data: sessions } = useSessions()
  const { data: health } = useHealth()

  const isFrameworkConnected = !statsError && health?.status === 'healthy'
  const activeSessionsCount = sessions?.filter(s => s.status === 'running').length || 0

  const statsCards = [
    { 
      title: 'Framework Status', 
      value: isFrameworkConnected ? 'Running' : 'Disconnected', 
      icon: Activity, 
      color: (isFrameworkConnected ? 'green' : 'red') as 'green' | 'red',
      subtitle: isFrameworkConnected ? 'All systems operational' : 'Cannot connect to framework'
    },
    { 
      title: 'Kernel Status', 
      value: isFrameworkConnected ? 'Active' : 'Offline', 
      icon: Cpu, 
      color: (isFrameworkConnected ? 'blue' : 'red') as 'blue' | 'red',
      subtitle: stats ? `${stats.total_sessions} total sessions` : 'No data'
    },
    { 
      title: 'Sessions', 
      value: stats?.total_sessions?.toString() || '0', 
      icon: TrendingUp, 
      color: 'green' as const,
      subtitle: `${activeSessionsCount} active`
    },
    { 
      title: 'Models', 
      value: stats?.total_models?.toString() || '0', 
      icon: MemoryStick, 
      color: 'purple' as const,
      subtitle: 'Registered models'
    },
    // GPU/CPU/RAM/VRAM - No backend data available, show placeholder
    { 
      title: 'GPU Usage', 
      value: '-', 
      icon: Zap, 
      color: 'purple' as const,
      subtitle: 'No data from framework'
    },
    { 
      title: 'VRAM', 
      value: '-', 
      icon: HardDrive, 
      color: 'blue' as const,
      subtitle: 'No data from framework'
    },
    { 
      title: 'CPU', 
      value: '-', 
      icon: Gauge, 
      color: 'yellow' as const,
      subtitle: 'No data from framework'
    },
    { 
      title: 'RAM', 
      value: '-', 
      icon: MemoryStick, 
      color: 'blue' as const,
      subtitle: 'No data from framework'
    },
    { 
      title: 'AI Agents', 
      value: stats?.total_models?.toString() || '0', 
      icon: Bot, 
      color: 'purple' as const,
      subtitle: 'Available models'
    },
    { 
      title: 'Active Sessions', 
      value: activeSessionsCount.toString(), 
      icon: Clock, 
      color: 'blue' as const,
      subtitle: 'Currently running'
    },
    { 
      title: 'TPS', 
      value: '-', 
      icon: Gauge, 
      color: 'green' as const,
      subtitle: 'No data from framework'
    },
    { 
      title: 'FPS', 
      value: '-', 
      icon: Activity, 
      color: 'green' as const,
      subtitle: 'No data from framework'
    },
  ]

  if (statsLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-3 text-[var(--text-secondary)]">Connecting to framework...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Monitor your framework status in real-time</p>
        </div>
        <div className={`px-3 sm:px-4 py-2 rounded-xl border flex items-center gap-2 ${
          isFrameworkConnected 
            ? 'bg-green-500/20 border-green-500/30' 
            : 'bg-red-500/20 border-red-500/30'
        }`}>
          <span className={`status-dot ${isFrameworkConnected ? 'status-healthy' : 'status-error'} ${isFrameworkConnected ? 'animate-pulse' : ''}`} />
          <span className={`text-xs sm:text-sm font-medium ${isFrameworkConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isFrameworkConnected ? 'Framework Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Connection Error */}
      {statsError && (
        <div className="card bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-400 font-medium">Cannot Connect to Framework</p>
              <p className="text-[var(--text-secondary)] text-sm">{statsError}</p>
              <p className="text-[var(--text-tertiary)] text-xs mt-1">Make sure ZBGym server is running at http://localhost:8080</p>
            </div>
          </div>
        </div>
      )}

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
        {/* Recent Sessions */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-3 sm:mb-4">Recent Sessions</h3>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    session.status === 'running' ? 'bg-green-500 animate-pulse' :
                    session.status === 'completed' ? 'bg-blue-500' :
                    session.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="flex-1 text-xs sm:text-sm text-[var(--text-primary)] truncate">
                    {session.algorithm || 'Session'} #{session.id}
                  </span>
                  <span className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    {session.current_timestep.toLocaleString()} steps
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-secondary)] text-sm">No sessions available from framework</p>
          )}
        </div>

        {/* Framework Stats */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-3 sm:mb-4">Framework Statistics</h3>
          {stats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-[var(--text-secondary)]">Total Sessions</span>
                <span className="text-[var(--text-primary)] font-semibold">{stats.total_sessions}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-[var(--text-secondary)]">Active Sessions</span>
                <span className="text-green-400 font-semibold">{stats.active_sessions}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-[var(--text-secondary)]">Total Models</span>
                <span className="text-purple-400 font-semibold">{stats.total_models}</span>
              </div>
            </div>
          ) : (
            <p className="text-[var(--text-secondary)] text-sm">No statistics available</p>
          )}
        </div>
      </div>
    </div>
  )
}
