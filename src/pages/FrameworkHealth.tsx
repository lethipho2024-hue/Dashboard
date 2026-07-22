import HealthRing from '../components/HealthRing'
import { useHealth } from '../services/zbgym'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export default function FrameworkHealth() {
  const { data: health, loading, refetch } = useHealth()

  const isHealthy = health?.status === 'healthy'
  const healthPercentage = isHealthy ? 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Framework Health</h1>
          <p className="text-[var(--text-secondary)] mt-1">Monitor the health status of all framework components</p>
        </div>
        <button onClick={refetch} className="btn btn-secondary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-3" />
          <span className="text-[var(--text-secondary)]">Checking framework health...</span>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Ring */}
          <div className="card flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-8">Overall Health</h3>
            <HealthRing percentage={healthPercentage} status={isHealthy ? 'healthy' : 'error'} size={240} />
            <div className="mt-8 text-center">
              <p className={`text-2xl font-bold ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
                {isHealthy ? 'Healthy' : 'Unhealthy'}
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {isHealthy ? 'All systems operational' : 'Framework connection issue'}
              </p>
            </div>
          </div>

          {/* Backend Health Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Backend Connection</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <span className={`status-dot ${isHealthy ? 'status-healthy' : 'status-error'}`} />
                  <span className="text-[var(--text-primary)] font-medium">API Server</span>
                </div>
                <span className={`text-sm font-medium ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
                  {isHealthy ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <span className={`status-dot ${isHealthy ? 'status-healthy' : 'status-warning'}`} />
                  <span className="text-[var(--text-primary)] font-medium">Status Endpoint</span>
                </div>
                <span className={`text-sm font-medium ${isHealthy ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isHealthy ? 'Responding' : 'No Response'}
                </span>
              </div>
            </div>

            {/* No Module Health Endpoint */}
            <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Module Health Not Available</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Individual module health monitoring requires a dedicated endpoint in the ZBGym backend (e.g., /health/modules).
                Currently only the overall /health endpoint is available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backend Limitation */}
      <div className="card bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">Available Health Data</h3>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <p>• <strong>Available:</strong> Overall framework health status (healthy/unhealthy)</p>
          <p>• <strong>Not available:</strong> Individual module status, uptime, response time, error rate</p>
          <p className="text-xs mt-2 opacity-75">
            These metrics require additional endpoints in the ZBGym backend
          </p>
        </div>
      </div>

      {/* Placeholder Module List - Demo */}
      {!loading && (
        <div className="card opacity-60">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Module Status (Demo)</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Individual module status requires backend endpoint. Showing demo data:
          </p>
          <div className="space-y-3">
            {[
              { name: 'Training Engine', status: 'healthy' },
              { name: 'Model Registry', status: 'healthy' },
              { name: 'Environment Manager', status: 'healthy' },
              { name: 'Logger Service', status: 'healthy' },
              { name: 'Metrics Collector', status: 'warning' },
            ].map((module, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <span className={`status-dot ${module.status === 'healthy' ? 'status-healthy' : 'status-warning'}`} />
                  <span className="text-[var(--text-primary)] font-medium">{module.name}</span>
                </div>
                <span className={`text-sm font-medium ${module.status === 'healthy' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {module.status === 'healthy' ? 'Healthy' : 'Warning'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
