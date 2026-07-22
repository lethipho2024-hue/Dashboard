import { Activity, Cpu, HardDrive, MemoryStick, Bot, Clock, Zap, Gauge, TrendingUp } from 'lucide-react'
import StatCard from '../components/StatCard'

export default function HomeDashboard() {
  const sparklineData = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 85]

  const stats = [
    { 
      title: 'Framework Status', 
      value: 'Running', 
      icon: Activity, 
      color: 'green' as const,
      subtitle: 'All systems operational'
    },
    { 
      title: 'Kernel Status', 
      value: 'Active', 
      icon: Cpu, 
      color: 'blue' as const,
      subtitle: 'Tick 12,847'
    },
    { 
      title: 'Health Score', 
      value: '98%', 
      icon: TrendingUp, 
      color: 'green' as const,
      trend: { value: 2, isPositive: true }
    },
    { 
      title: 'Modules Loaded', 
      value: '24', 
      icon: MemoryStick, 
      color: 'purple' as const,
      subtitle: '12 active'
    },
    { 
      title: 'GPU Usage', 
      value: '82%', 
      icon: Zap, 
      color: 'purple' as const,
      sparklineData
    },
    { 
      title: 'VRAM', 
      value: '6.2GB', 
      icon: HardDrive, 
      color: 'blue' as const,
      sparklineData: [20, 25, 22, 28, 24, 30, 28, 35, 32, 38, 35, 40]
    },
    { 
      title: 'CPU', 
      value: '67%', 
      icon: Gauge, 
      color: 'yellow' as const,
      sparklineData
    },
    { 
      title: 'RAM', 
      value: '14.2GB', 
      icon: MemoryStick, 
      color: 'blue' as const,
      sparklineData: [40, 45, 42, 48, 44, 50, 48, 55, 52, 58, 55, 60]
    },
    { 
      title: 'AI Agents', 
      value: '8', 
      icon: Bot, 
      color: 'purple' as const,
      subtitle: '4 active'
    },
    { 
      title: 'Current Tick', 
      value: '12,847', 
      icon: Clock, 
      color: 'blue' as const,
      subtitle: 'Runtime 02:34:12'
    },
    { 
      title: 'TPS', 
      value: '60', 
      icon: Gauge, 
      color: 'green' as const,
      subtitle: 'Ticks per second'
    },
    { 
      title: 'FPS', 
      value: '144', 
      icon: Activity, 
      color: 'green' as const,
      subtitle: 'Frames per second'
    },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">Monitor your framework status in real-time</p>
        </div>
        <div className="px-3 sm:px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-2">
          <span className="status-dot status-healthy animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-green-400">System Online</span>
        </div>
      </div>

      {/* Stats Grid - Mobile optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat, index) => (
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
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">Recent Activity</h3>
          <div className="space-y-2 sm:space-y-3">
            {[
              { time: '2m ago', event: 'Framework initialized', status: 'success' },
              { time: '5m ago', event: 'AI Agent completed task', status: 'success' },
              { time: '10m ago', event: 'Memory optimization', status: 'info' },
              { time: '15m ago', event: 'Module loaded: Physics', status: 'info' },
              { time: '20m ago', event: 'High memory warning', status: 'warning' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  item.status === 'success' ? 'bg-green-500' :
                  item.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <span className="text-xs sm:text-sm text-text-secondary hidden xs:inline">{item.time}</span>
                <span className="flex-1 text-xs sm:text-sm text-text-primary truncate">{item.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">System Health</h3>
          <div className="space-y-3 sm:space-y-4">
            {[
              { label: 'Engine', health: 100 },
              { label: 'Physics', health: 98 },
              { label: 'Replay', health: 95 },
              { label: 'Trainer', health: 100 },
              { label: 'Dashboard', health: 100 },
            ].map((item) => (
              <div key={item.label} className="space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-text-primary">{item.label}</span>
                  <span className={`text-xs sm:text-sm font-medium ${
                    item.health === 100 ? 'text-green-400' : 
                    item.health >= 90 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {item.health}%
                  </span>
                </div>
                <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.health === 100 ? 'bg-green-500' :
                      item.health >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
