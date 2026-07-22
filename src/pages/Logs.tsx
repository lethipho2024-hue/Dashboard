import { useState } from 'react'
import { FileText, Search, Download, Pin, Trash2, Filter, Calendar } from 'lucide-react'

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [pinnedLogs, setPinnedLogs] = useState<number[]>([3, 7])

  const logs = [
    { id: 1, timestamp: '2024-01-15 12:34:56', level: 'INFO', module: 'Engine', message: 'Framework initialization completed', pinned: false },
    { id: 2, timestamp: '2024-01-15 12:34:57', level: 'INFO', module: 'Physics', message: 'Physics engine loaded successfully', pinned: false },
    { id: 3, timestamp: '2024-01-15 12:34:58', level: 'DEBUG', module: 'AI', message: 'AI agent initialized: Planner', pinned: true },
    { id: 4, timestamp: '2024-01-15 12:34:59', level: 'INFO', module: 'Trainer', message: 'Training session started', pinned: false },
    { id: 5, timestamp: '2024-01-15 12:35:00', level: 'WARN', module: 'Memory', message: 'Memory usage exceeds 80% threshold', pinned: false },
    { id: 6, timestamp: '2024-01-15 12:35:01', level: 'INFO', module: 'Metrics', message: 'Metrics collection started', pinned: false },
    { id: 7, timestamp: '2024-01-15 12:35:02', level: 'ERROR', module: 'Replay', message: 'Failed to save checkpoint: disk I/O error', pinned: true },
    { id: 8, timestamp: '2024-01-15 12:35:03', level: 'INFO', module: 'Kernel', message: 'Tick processing completed', pinned: false },
  ]

  const filteredLogs = logs.filter(log => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-400 bg-blue-500/20'
      case 'WARN': return 'text-yellow-400 bg-yellow-500/20'
      case 'ERROR': return 'text-red-400 bg-red-500/20'
      case 'DEBUG': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-text-secondary bg-white/10'
    }
  }

  const togglePin = (id: number) => {
    setPinnedLogs(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-text-primary" />
          <h1 className="text-xl font-bold text-text-primary">Log Explorer</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder-text-secondary focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">All Levels</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warning</option>
          <option value="ERROR">Error</option>
          <option value="DEBUG">Debug</option>
        </select>
      </div>

      {/* Pinned Logs */}
      {pinnedLogs.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Pin className="w-4 h-4" />
            Pinned Logs
          </h3>
          <div className="space-y-2">
            {logs.filter(log => pinnedLogs.includes(log.id)).map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <button onClick={() => togglePin(log.id)} className="text-yellow-400">
                  <Pin className="w-4 h-4" />
                </button>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                  {log.level}
                </span>
                <span className="text-xs text-text-secondary font-mono">{log.timestamp}</span>
                <span className="text-xs text-text-secondary">{log.module}</span>
                <span className="flex-1 text-sm text-text-primary">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs List */}
      <div className="card">
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div 
              key={log.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                log.pinned ? 'bg-white/5' : 'hover:bg-white/5'
              }`}
            >
              <button 
                onClick={() => togglePin(log.id)}
                className={`${log.pinned ? 'text-yellow-400' : 'text-text-secondary hover:text-yellow-400'}`}
              >
                <Pin className="w-4 h-4" />
              </button>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
              <span className="text-xs text-text-secondary font-mono w-40">{log.timestamp}</span>
              <span className="text-xs text-text-secondary w-24">{log.module}</span>
              <span className="flex-1 text-sm text-text-primary">{log.message}</span>
              <button className="p-1 rounded hover:bg-white/10 transition-colors">
                <Trash2 className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
