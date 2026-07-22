import { Puzzle, Plus, Settings, Trash2, ExternalLink } from 'lucide-react'

export default function Plugins() {
  const plugins = [
    { 
      name: 'Advanced Analytics', 
      version: '2.1.0', 
      author: 'ZBGym Team',
      status: 'enabled',
      health: 100,
      description: 'Enhanced analytics and reporting capabilities'
    },
    { 
      name: 'Custom Scheduler', 
      version: '1.5.0', 
      author: 'Community',
      status: 'enabled',
      health: 98,
      description: 'Advanced task scheduling and automation'
    },
    { 
      name: 'Performance Profiler', 
      version: '1.0.0', 
      author: 'ZBGym Team',
      status: 'enabled',
      health: 95,
      description: 'Detailed performance profiling tools'
    },
    { 
      name: 'Data Exporter', 
      version: '0.9.0', 
      author: 'Community',
      status: 'disabled',
      health: 0,
      description: 'Export data to various formats'
    },
    { 
      name: 'Cloud Sync', 
      version: '1.2.0', 
      author: 'ZBGym Team',
      status: 'enabled',
      health: 100,
      description: 'Sync data across multiple instances'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Plugins</h1>
          <p className="text-text-secondary mt-1">Extend framework functionality</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Install Plugin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-text-secondary">Total Plugins</p>
          <p className="text-2xl font-bold text-text-primary">{plugins.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-text-secondary">Enabled</p>
          <p className="text-2xl font-bold text-green-400">{plugins.filter(p => p.status === 'enabled').length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-text-secondary">Disabled</p>
          <p className="text-2xl font-bold text-text-secondary">{plugins.filter(p => p.status === 'disabled').length}</p>
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.map((plugin) => (
          <div key={plugin.name} className="card group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  plugin.status === 'enabled' ? 'bg-purple-500/20' : 'bg-white/10'
                }`}>
                  <Puzzle className={`w-6 h-6 ${plugin.status === 'enabled' ? 'text-purple-400' : 'text-text-secondary'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{plugin.name}</h3>
                  <p className="text-xs text-text-secondary">v{plugin.version} by {plugin.author}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                plugin.status === 'enabled' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-white/10 text-text-secondary'
              }`}>
                {plugin.status}
              </span>
            </div>

            <p className="text-sm text-text-secondary mb-4">{plugin.description}</p>

            {plugin.status === 'enabled' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">Health</span>
                  <span className={`text-xs font-medium ${
                    plugin.health === 100 ? 'text-green-400' : 
                    plugin.health >= 90 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {plugin.health}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      plugin.health === 100 ? 'bg-green-500' : 
                      plugin.health >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${plugin.health}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <button className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors flex items-center justify-center gap-1">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                plugin.status === 'enabled' 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}>
                {plugin.status === 'enabled' ? 'Disable' : 'Enable'}
              </button>
              <button className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Trash2 className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Marketplace Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recommended Plugins</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Visual Debugger', downloads: '1.2k' },
            { name: 'ML Model Zoo', downloads: '850' },
            { name: 'REST API Bridge', downloads: '2.1k' },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Puzzle className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-text-primary font-medium">{item.name}</p>
                  <p className="text-xs text-text-secondary">{item.downloads} downloads</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-text-secondary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
