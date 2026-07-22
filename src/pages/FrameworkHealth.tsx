import { Heart, AlertTriangle, AlertCircle, Thermometer, Activity } from 'lucide-react'
import { useHealth } from '../store'
import HealthRing from '../components/HealthRing'

export default function FrameworkHealth() {
  const { 
    status, 
    stats, 
    getHealthColor, 
    getHealthLabel,
    hasWarnings,
    hasErrors,
    getHealthChartData
  } = useHealth()

  const healthCards = [
    { 
      title: 'Health Score', 
      value: `${status.health_score}%`, 
      icon: Heart,
      color: getHealthColor(),
      description: getHealthLabel()
    },
    { 
      title: 'Healthy Modules', 
      value: stats.healthy_modules.toString(), 
      icon: Activity,
      color: 'green',
      description: 'Modules running normally'
    },
    { 
      title: 'Warning Modules', 
      value: stats.warning_modules.toString(), 
      icon: AlertTriangle,
      color: 'yellow',
      description: 'Modules need attention'
    },
    { 
      title: 'Critical Modules', 
      value: stats.error_modules.toString(), 
      icon: AlertCircle,
      color: 'red',
      description: 'Modules with errors'
    },
  ]

  const colorMap: Record<string, string> = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Framework Health</h1>
          <p className="text-[var(--text-secondary)] mt-1">Real-time system health monitoring</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
          status.health_score >= 80 
            ? 'bg-green-500/20 border-green-500/30' 
            : status.health_score >= 50 
            ? 'bg-yellow-500/20 border-yellow-500/30'
            : 'bg-red-500/20 border-red-500/30'
        }`}>
          <span className={`status-dot ${
            status.health_score >= 80 
              ? 'status-healthy' 
              : status.health_score >= 50 
              ? 'status-warning'
              : 'status-error'
          }`} />
          <span className={`text-sm font-medium ${
            status.health_score >= 80 
              ? 'text-green-400' 
              : status.health_score >= 50 
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}>
            {getHealthLabel()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthCards.map((card) => {
          const Icon = card.icon
          const colorClass = colorMap[card.color] || colorMap.blue
          return (
            <div key={card.title} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-xl ${
                  card.color === 'green' ? 'bg-green-500/20' :
                  card.color === 'yellow' ? 'bg-yellow-500/20' :
                  card.color === 'red' ? 'bg-red-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{card.title}</p>
              <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{card.value}</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-2">{card.description}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Health Overview</h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <HealthRing score={status.health_score} size={200} strokeWidth={12} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${colorMap[getHealthColor()]}`}>
                  {status.health_score}%
                </span>
                <span className="text-xs text-[var(--text-secondary)]">Health Score</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{stats.healthy_modules}</p>
              <p className="text-xs text-[var(--text-secondary)]">Healthy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.warning_modules}</p>
              <p className="text-xs text-[var(--text-secondary)]">Warning</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{stats.error_modules}</p>
              <p className="text-xs text-[var(--text-secondary)]">Error</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">System Status</h3>
          <div className="space-y-4">
            {status.temperature_celsius && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-blue-400" />
                  <span className="text-[var(--text-secondary)]">Temperature</span>
                </div>
                <span className="text-[var(--text-primary)] font-mono">
                  {status.temperature_celsius}°C
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-[var(--text-secondary)]">Warnings</span>
              </div>
              <span className={`font-mono ${stats.warning_count > 0 ? 'text-yellow-400' : 'text-[var(--text-primary)]'}`}>
                {stats.warning_count}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-[var(--text-secondary)]">Errors</span>
              </div>
              <span className={`font-mono ${stats.error_count > 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                {stats.error_count}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-[var(--text-secondary)]">Crash Count</span>
              </div>
              <span className={`font-mono ${status.crash_count > 0 ? 'text-orange-400' : 'text-[var(--text-primary)]'}`}>
                {status.crash_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {status.warnings.length > 0 && (
        <div className="card bg-yellow-500/10 border-yellow-500/20">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">Warnings</h3>
          <div className="space-y-2">
            {status.warnings.map((warning, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-[var(--text-primary)]">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status.errors.length > 0 && (
        <div className="card bg-red-500/10 border-red-500/20">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Errors</h3>
          <div className="space-y-2">
            {status.errors.map((error, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-[var(--text-primary)]">{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(status.module_status).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Module Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(status.module_status).map(([module, moduleStatus]) => (
              <div 
                key={module} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  moduleStatus === 'healthy' ? 'bg-green-500/10' :
                  moduleStatus === 'warning' ? 'bg-yellow-500/10' :
                  'bg-red-500/10'
                }`}
              >
                <span className="text-sm text-[var(--text-primary)] font-medium">{module}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  moduleStatus === 'healthy' ? 'bg-green-500/20 text-green-400' :
                  moduleStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {moduleStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
