import { useState, useRef, useEffect } from 'react'
import { FileText, Search, Trash2, Play, Pause, Filter } from 'lucide-react'
import { useLogs } from '../store'

export default function Logs() {
  const { 
    filteredLogs, 
    levelFilter, 
    searchQuery,
    isAutoScrollEnabled,
    setLevelFilter, 
    setSearchQuery,
    toggleAutoScroll,
    clearLogs,
    getLogColor
  } = useLogs()
  
  const logsEndRef = useRef<HTMLDivElement>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (isAutoScrollEnabled && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs.length, isAutoScrollEnabled])

  const getLevelColorClass = (level: string) => {
    const color = getLogColor(level)
    const classes: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      red: { bg: 'bg-red-500/20', text: 'text-red-400' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
      gray: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    }
    return classes[color] || classes.gray
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour12: false })
  }

  const levelOptions = [
    { value: null, label: 'All Levels' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'debug', label: 'Debug' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[var(--text-primary)]" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Logs</h1>
          <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-[var(--text-secondary)]">
            {filteredLogs.length} logs
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAutoScroll}
            className={`btn btn-secondary flex items-center gap-2 ${isAutoScrollEnabled ? 'bg-blue-500/20 border-blue-500/30' : ''}`}
          >
            {isAutoScrollEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAutoScrollEnabled ? 'Auto-scroll On' : 'Auto-scroll Off'}
          </button>
          <button
            onClick={clearLogs}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-secondary flex items-center gap-2 ${showFilters ? 'bg-blue-500/20 border-blue-500/30' : ''}`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        
        {showFilters && (
          <div className="flex items-center gap-2">
            {levelOptions.map((option) => (
              <button
                key={option.value || 'all'}
                onClick={() => setLevelFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  levelFilter === option.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logs List */}
      <div className="card overflow-hidden">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredLogs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredLogs.map((log) => {
                const colors = getLevelColorClass(log.level)
                return (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-3 p-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xs text-[var(--text-tertiary)] font-mono whitespace-nowrap mt-0.5">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${colors.bg} ${colors.text}`}>
                      {log.level}
                    </span>
                    {log.source && (
                      <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                        [{log.source}]
                      </span>
                    )}
                    <span className="flex-1 text-sm text-[var(--text-primary)]">
                      {log.message}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--text-secondary)]">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p>No logs available</p>
              <p className="text-xs mt-1">Logs will appear here in real-time</p>
            </div>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  )
}
