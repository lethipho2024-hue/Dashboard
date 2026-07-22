import { useState } from 'react'
import { Terminal, Search, Copy, Download, Trash2, Loader2, RefreshCw } from 'lucide-react'
import { useLogs } from '../services/zbgym'

export default function EventConsole() {
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [limit, setLimit] = useState(100)
  const { data: logs, loading, error, refetch } = useLogs({ limit })

  const filteredLogs = (logs || []).filter(log => {
    if (filter !== 'all' && log.level?.toUpperCase() !== filter) return false
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getTypeColor = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'INFO': return 'text-blue-400'
      case 'WARN':
      case 'WARNING': return 'text-yellow-400'
      case 'ERROR': return 'text-red-400'
      case 'DEBUG': return 'text-purple-400'
      default: return 'text-[var(--text-secondary)]'
    }
  }

  const getTypeBadgeColor = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'INFO': return 'bg-blue-500/20 text-blue-400'
      case 'WARN':
      case 'WARNING': return 'bg-yellow-500/20 text-yellow-400'
      case 'ERROR': return 'bg-red-500/20 text-red-400'
      case 'DEBUG': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-white/10 text-[var(--text-secondary)]'
    }
  }

  const infoCount = (logs || []).filter(l => l.level?.toUpperCase() === 'INFO').length
  const warnCount = (logs || []).filter(l => l.level?.toUpperCase() === 'WARN' || l.level?.toUpperCase() === 'WARNING').length
  const errorCount = (logs || []).filter(l => l.level?.toUpperCase() === 'ERROR').length

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-[var(--text-primary)]" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Event Console</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" disabled>
            <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" disabled>
            <Download className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" disabled>
            <Trash2 className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] text-sm"
        >
          <option value={50}>50 events</option>
          <option value={100}>100 events</option>
          <option value={200}>200 events</option>
        </select>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'INFO', label: 'Info' },
            { id: 'WARN', label: 'Warn' },
            { id: 'ERROR', label: 'Error' },
            { id: 'DEBUG', label: 'Debug' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filter === item.id 
                  ? 'bg-blue-500 text-white' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-3" />
          <span className="text-[var(--text-secondary)]">Loading events...</span>
        </div>
      )}

      {/* Console */}
      {!loading && (
        <div className="flex-1 card overflow-hidden">
          {/* Backend Notice */}
          {(logs || []).length > 0 && (
            <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 text-xs text-blue-400">
              Showing {logs?.length} events from /logs endpoint
            </div>
          )}
          <div className="h-full overflow-y-auto font-mono text-sm">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => (
                <div 
                  key={log.id ?? idx}
                  className="flex items-start gap-3 px-4 py-2 border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <span className="text-[var(--text-secondary)] text-xs w-24 flex-shrink-0">{log.timestamp || '-'}</span>
                  <span className="w-16 flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTypeBadgeColor(log.level)}`}>
                      {log.level?.toUpperCase() || 'INFO'}
                    </span>
                  </span>
                  <span className="text-[var(--text-secondary)] text-xs w-20 flex-shrink-0">{log.source || '-'}</span>
                  <span className={`flex-1 ${getTypeColor(log.level)}`}>{log.message}</span>
                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all">
                    <Copy className="w-3 h-3 text-[var(--text-secondary)]" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                {logs && logs.length > 0 ? 'No events match your filters' : 'No events available from backend'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-xs text-[var(--text-secondary)]">Total</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{(logs || []).length}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-[var(--text-secondary)]">Info</p>
            <p className="text-xl font-bold text-blue-400">{infoCount}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-[var(--text-secondary)]">Warnings</p>
            <p className="text-xl font-bold text-yellow-400">{warnCount}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-[var(--text-secondary)]">Errors</p>
            <p className="text-xl font-bold text-red-400">{errorCount}</p>
          </div>
        </div>
      )}
    </div>
  )
}
