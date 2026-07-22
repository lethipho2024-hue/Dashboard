import { useState } from 'react'
import { FileText, Search, Download, Pin, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { useLogs } from '../services/zbgym'
import type { LogEntry } from '../services/zbgym'

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [pinnedLogs, setPinnedLogs] = useState<number[]>([])
  const [limit, setLimit] = useState(100)

  const { data: logs, loading, error, refetch } = useLogs({ limit })

  const filteredLogs = (logs || []).filter((log: LogEntry) => {
    if (levelFilter !== 'all' && log.level?.toUpperCase() !== levelFilter) return false
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getLevelColor = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'INFO': return 'text-blue-400 bg-blue-500/20'
      case 'WARN':
      case 'WARNING': return 'text-yellow-400 bg-yellow-500/20'
      case 'ERROR': return 'text-red-400 bg-red-500/20'
      case 'DEBUG': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-[var(--text-secondary)] bg-white/10'
    }
  }

  const togglePin = (id?: number) => {
    if (id === undefined) return
    setPinnedLogs(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const getLogId = (log: LogEntry, index: number) => log.id ?? index

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[var(--text-primary)]" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Log Explorer</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="card bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">All Levels</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warning</option>
          <option value="ERROR">Error</option>
          <option value="DEBUG">Debug</option>
        </select>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50"
        >
          <option value={50}>50 logs</option>
          <option value={100}>100 logs</option>
          <option value={200}>200 logs</option>
          <option value={500}>500 logs</option>
        </select>
      </div>

      {loading && (
        <div className="card flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-3" />
          <span className="text-[var(--text-secondary)]">Loading logs...</span>
        </div>
      )}

      {!loading && (
        <div className="card">
          {filteredLogs.length > 0 ? (
            <div className="space-y-2">
              {filteredLogs.map((log, idx) => (
                <div key={getLogId(log, idx)} className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5">
                  <button onClick={() => togglePin(getLogId(log, idx))} className={`${pinnedLogs.includes(getLogId(log, idx)) ? 'text-yellow-400' : 'text-[var(--text-secondary)] hover:text-yellow-400'}`}>
                    <Pin className="w-4 h-4" />
                  </button>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                    {log.level?.toUpperCase() || 'INFO'}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono w-40">{log.timestamp || '-'}</span>
                  <span className="text-xs text-[var(--text-secondary)] w-24">{log.source || '-'}</span>
                  <span className="flex-1 text-sm text-[var(--text-primary)]">{log.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-secondary)] text-center py-12">
              {logs && logs.length > 0 ? 'No logs match your filters' : 'No logs available from framework'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
