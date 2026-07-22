import { Puzzle, Settings, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useModels } from '../services/zbgym'

export default function Plugins() {
  const { data: models, loading, refetch } = useModels()

  // Show models as "plugins" since there's no plugin endpoint
  const plugins: { name: string; version: string; author: string; status: 'enabled' | 'disabled'; health: number; description: string }[] = 
    (models || []).map(m => ({
      name: m.name,
      version: m.algorithm,
      author: 'ZBGym',
      status: 'enabled' as const,
      health: 100,
      description: `Model trained with ${m.algorithm} for ${m.env_id} environment`
    }))

  const enabledCount = plugins.filter(p => p.status === 'enabled').length
  const disabledCount = plugins.filter(p => p.status === 'disabled').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plugins</h1>
          <p className="text-[var(--text-secondary)] mt-1">Models and extensions</p>
        </div>
        <button onClick={refetch} className="btn btn-secondary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400 mr-3" />
          <span className="text-[var(--text-secondary)]">Loading plugins...</span>
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-xs text-[var(--text-secondary)]">Total Models</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{plugins.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-[var(--text-secondary)]">Active</p>
            <p className="text-2xl font-bold text-green-400">{enabledCount}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-[var(--text-secondary)]">Inactive</p>
            <p className="text-2xl font-bold text-[var(--text-secondary)]">{disabledCount}</p>
          </div>
        </div>
      )}

      {/* Models from Backend */}
      {!loading && plugins.length > 0 && (
        <div className="card">
          <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Models from /models endpoint</span>
            </div>
          </div>
        </div>
      )}

      {/* Plugin Grid */}
      {!loading && plugins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plugins.map((plugin) => (
            <div key={plugin.name} className="card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    plugin.status === 'enabled' ? 'bg-purple-500/20' : 'bg-white/10'
                  }`}>
                    <Puzzle className={`w-6 h-6 ${plugin.status === 'enabled' ? 'text-purple-400' : 'text-[var(--text-secondary)]'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{plugin.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">v{plugin.version} by {plugin.author}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plugin.status === 'enabled' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-white/10 text-[var(--text-secondary)]'
                }`}>
                  {plugin.status}
                </span>
              </div>

              <p className="text-sm text-[var(--text-secondary)] mb-4">{plugin.description}</p>

              {plugin.status === 'enabled' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-secondary)]">Health</span>
                    <span className="text-xs font-medium text-green-400">
                      {plugin.health}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${plugin.health}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <button className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors flex items-center justify-center gap-1" disabled>
                  <Settings className="w-4 h-4" />
                  Details
                </button>
                <button className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  plugin.status === 'enabled' 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`} disabled>
                  {plugin.status === 'enabled' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="card">
            <p className="text-[var(--text-secondary)] text-center py-12">
              No trained models available. Train a model from the Trainer page.
            </p>
          </div>
        )
      )}

      {/* Backend Limitation */}
      <div className="card bg-yellow-500/10 border border-yellow-500/20">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Plugins Data</h3>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <p>• <strong>Available:</strong> Models from /models endpoint</p>
          <p>• <strong>Not available:</strong> Plugin marketplace, plugin install/enable/disable, plugin health monitoring</p>
          <p className="text-xs mt-2 opacity-75">
            Full plugin system requires additional endpoints in the ZBGym backend
          </p>
        </div>
      </div>

      {/* Demo Marketplace */}
      <div className="card opacity-60">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Plugin Marketplace (Demo)</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Plugin marketplace requires a plugin catalog endpoint.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Visual Debugger', downloads: '1.2k' },
            { name: 'ML Model Zoo', downloads: '850' },
            { name: 'REST API Bridge', downloads: '2.1k' },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Puzzle className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-[var(--text-primary)] font-medium">{item.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{item.downloads} downloads</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
