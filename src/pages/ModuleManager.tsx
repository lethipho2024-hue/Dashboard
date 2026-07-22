import { useState } from 'react'
import { Package, Search, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react'

export default function ModuleManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const modules = [
    { 
      id: '1', 
      name: 'Engine Core', 
      status: 'healthy', 
      version: '1.2.0',
      memory: '2.4 GB',
      runtime: '02:34:12',
      health: 100,
      description: 'Core engine module handling main loop execution'
    },
    { 
      id: '2', 
      name: 'Physics Engine', 
      status: 'healthy', 
      version: '2.1.0',
      memory: '1.8 GB',
      runtime: '02:34:10',
      health: 98,
      description: 'Physics simulation and collision detection'
    },
    { 
      id: '3', 
      name: 'Replay System', 
      status: 'warning', 
      version: '1.0.5',
      memory: '856 MB',
      runtime: '02:30:00',
      health: 85,
      description: 'Episode recording and playback system'
    },
    { 
      id: '4', 
      name: 'AI Trainer', 
      status: 'healthy', 
      version: '3.0.0',
      memory: '3.2 GB',
      runtime: '02:34:00',
      health: 100,
      description: 'Training orchestration and optimization'
    },
    { 
      id: '5', 
      name: 'Metrics Collector', 
      status: 'healthy', 
      version: '1.1.0',
      memory: '245 MB',
      runtime: '02:34:12',
      health: 100,
      description: 'Performance metrics collection'
    },
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
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Module Manager</h1>
          <p className="text-text-secondary mt-1">Manage and monitor framework modules</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-text-secondary">Total: {modules.length} modules</span>
          <button className="btn btn-primary">Load Module</button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search modules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder-text-secondary focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Module Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Module</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Version</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Memory</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Runtime</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Health</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
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
                          <ChevronDown className="w-4 h-4 text-text-secondary" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-text-secondary" />
                        )}
                        <Package className="w-5 h-5 text-blue-400" />
                        <span className="font-medium text-text-primary">{module.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(module.status)}</td>
                    <td className="px-4 py-4 text-text-secondary font-mono">v{module.version}</td>
                    <td className="px-4 py-4 text-text-secondary">{module.memory}</td>
                    <td className="px-4 py-4 text-text-secondary font-mono">{module.runtime}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              module.health === 100 ? 'bg-green-500' :
                              module.health >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${module.health}%` }}
                          />
                        </div>
                        <span className="text-sm text-text-secondary">{module.health}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <MoreVertical className="w-4 h-4 text-text-secondary" />
                      </button>
                    </td>
                  </tr>
                  {expandedRow === module.id && (
                    <tr key={`${module.id}-expanded`}>
                      <td colSpan={7} className="px-4 py-4 bg-white/5">
                        <p className="text-text-secondary">{module.description}</p>
                        <div className="flex gap-4 mt-4">
                          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors">Reload</button>
                          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors">Configure</button>
                          <button className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors">Unload</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
