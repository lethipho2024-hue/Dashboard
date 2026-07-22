import { useState } from 'react'
import { Package, Search, ChevronDown, ChevronRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useSessions, useModels } from '../services/zbgym'

export default function ModuleManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const { data: sessions, loading: sessionsLoading, refetch: refetchSessions } = useSessions()
  const { data: models, loading: modelsLoading, refetch: refetchModels } = useModels()

  const isLoading = sessionsLoading || modelsLoading

  // Combine sessions and models as "modules"
  const modules = [
    ...(sessions || []).map(s => ({
      id: `session-${s.id}`,
      name: `Training Session #${s.id}`,
      type: 'Session',
      status: s.status === 'running' ? 'healthy' : s.status === 'failed' ? 'error' : 'warning',
      version: s.algorithm,
      info: `${s.env_id} • ${s.current_timestep.toLocaleString()} steps`,
      reward: s.mean_reward,
      description: `Training session using ${s.algorithm} on ${s.env_id} environment`
    })),
    ...(models || []).map(m => ({
      id: `model-${m.id}`,
      name: `Model: ${m.name}`,
      type: 'Model',
      status: 'healthy' as const,
      version: m.algorithm,
      info: `${m.env_id} • Created ${new Date(m.created_at).toLocaleDateString()}`,
      reward: 0,
      description: `Trained ${m.algorithm} model for ${m.env_id} environment`
    }))
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Healthy</span>
      case 'warning':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">Warning</span>
      case 'error':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Error</span>
      default:
        return null
    }
  }

  const filteredModules = modules.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Module Manager</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage and monitor sessions & models</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { refetchSessions(); refetchModels(); }} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className="text-[var(--text-secondary)]">{modules.length} items</span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-3" />
          <span className="text-[var(--text-secondary)]">Loading modules...</span>
        </div>
      )}

      {/* Search */}
      {!isLoading && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search sessions & models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      )}

      {/* Data from Backend */}
      {!isLoading && modules.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Showing data from backend API</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Algorithm</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Info</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Reward</th>
                </tr>
              </thead>
              <tbody>
                {filteredModules.map((module) => (
                  <>
                    <tr 
                      key={module.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === module.id ? null : module.id)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {expandedRow === module.id ? (
                            <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                          )}
                          <Package className="w-5 h-5 text-blue-400" />
                          <span className="font-medium text-[var(--text-primary)]">{module.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          module.type === 'Session' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {module.type}
                        </span>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(module.status)}</td>
                      <td className="px-4 py-4 text-[var(--text-secondary)] font-mono">{module.version}</td>
                      <td className="px-4 py-4 text-[var(--text-secondary)]">{module.info}</td>
                      <td className="px-4 py-4 text-[var(--text-secondary)] font-mono">
                        {module.type === 'Session' ? module.reward.toFixed(2) : '-'}
                      </td>
                    </tr>
                    {expandedRow === module.id && (
                      <tr key={`${module.id}-expanded`}>
                        <td colSpan={6} className="px-4 py-4 bg-white/5">
                          <p className="text-[var(--text-secondary)]">{module.description}</p>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data */}
      {!isLoading && modules.length === 0 && (
        <div className="card">
          <p className="text-[var(--text-secondary)] text-center py-12">
            No sessions or models available. Start a training session from the Trainer page.
          </p>
        </div>
      )}

      {/* Backend Limitation */}
      <div className="card bg-yellow-500/10 border border-yellow-500/20">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Module Manager Data</h3>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <p>• <strong>Available:</strong> Training sessions (from /sessions), Models (from /models)</p>
          <p>• <strong>Not available:</strong> Framework modules, memory usage, runtime, individual module health</p>
          <p className="text-xs mt-2 opacity-75">
            These require additional endpoints in the ZBGym backend
          </p>
        </div>
      </div>
    </div>
  )
}
