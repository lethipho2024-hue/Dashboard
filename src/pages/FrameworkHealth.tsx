import HealthRing from '../components/HealthRing'

export default function FrameworkHealth() {
  const modules = [
    { name: 'Engine', status: 'healthy' as const },
    { name: 'Physics', status: 'healthy' as const },
    { name: 'Replay', status: 'warning' as const },
    { name: 'Trainer', status: 'healthy' as const },
    { name: 'Dashboard', status: 'healthy' as const },
    { name: 'AI Center', status: 'healthy' as const },
    { name: 'Metrics', status: 'healthy' as const },
    { name: 'Module Manager', status: 'healthy' as const },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-text-secondary'
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'healthy': return 'status-healthy'
      case 'warning': return 'status-warning'
      case 'error': return 'status-error'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Framework Health</h1>
        <p className="text-text-secondary mt-1">Monitor the health status of all framework components</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Ring */}
        <div className="card flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold text-text-primary mb-8">Overall Health</h3>
          <HealthRing percentage={98} status="healthy" size={240} />
          <div className="mt-8 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">22</p>
              <p className="text-xs text-text-secondary">Healthy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">1</p>
              <p className="text-xs text-text-secondary">Warning</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">0</p>
              <p className="text-xs text-text-secondary">Critical</p>
            </div>
          </div>
        </div>

        {/* Module List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Module Status</h3>
          <div className="space-y-4">
            {modules.map((module) => (
              <div 
                key={module.name}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`status-dot ${getStatusDot(module.status)}`} />
                  <span className="text-text-primary font-medium">{module.name}</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(module.status)}`}>
                  {module.status === 'healthy' ? 'Healthy' : 
                   module.status === 'warning' ? 'Warning' : 'Error'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Uptime', value: '99.9%', color: 'green' },
          { label: 'Response Time', value: '12ms', color: 'blue' },
          { label: 'Error Rate', value: '0.01%', color: 'green' },
        ].map((metric) => (
          <div key={metric.label} className="card text-center">
            <p className="text-xs text-text-secondary uppercase tracking-wider">{metric.label}</p>
            <p className={`text-3xl font-bold mt-2 ${
              metric.color === 'green' ? 'text-green-400' :
              metric.color === 'blue' ? 'text-blue-400' : 'text-red-400'
            }`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
