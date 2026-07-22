import { useState, useRef, useEffect } from 'react'
import { Terminal, Search, Trash2, Play, Pause } from 'lucide-react'
import { useEvents } from '../store'

export default function EventConsole() {
  const { 
    filteredEvents, 
    levelFilter, 
    stats,
    setLevelFilter, 
    clearEvents,
    getEventColor
  } = useEvents()
  
  const eventsEndRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (autoScroll && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredEvents.length, autoScroll])

  const getEventColorClass = (level: string) => {
    const color = getEventColor(level)
    const classes: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      red: { bg: 'bg-red-500/20', text: 'text-red-400' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    }
    return classes[color] || classes.blue
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour12: false })
  }

  const filteredBySearch = filteredEvents.filter(event => 
    searchQuery === '' || 
    event.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.source.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const levelOptions = [
    { value: null, label: 'All' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'debug', label: 'Debug' },
  ]

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-[var(--text-primary)]" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Event Console</h1>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{stats.info} Info</span>
            <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">{stats.warning} Warn</span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400">{stats.error} Error</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`btn btn-secondary flex items-center gap-2 ${autoScroll ? 'bg-blue-500/20 border-blue-500/30' : ''}`}
          >
            {autoScroll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {autoScroll ? 'Auto-scroll On' : 'Auto-scroll Off'}
          </button>
          <button
            onClick={clearEvents}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        
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
      </div>

      <div className="flex-1 card overflow-hidden">
        <div className="h-full overflow-y-auto font-mono text-sm">
          {filteredBySearch.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredBySearch.map((event) => {
                const colors = getEventColorClass(event.level)
                return (
                  <div 
                    key={event.id} 
                    className="flex items-start gap-3 px-4 py-2 hover:bg-white/5 transition-colors group"
                  >
                    <span className="text-xs text-[var(--text-tertiary)] w-20 flex-shrink-0">
                      {formatTimestamp(event.timestamp)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${colors.bg} ${colors.text} w-16 flex-shrink-0`}>
                      {event.level}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] w-24 flex-shrink-0">
                      {event.type}
                    </span>
                    {event.source && (
                      <span className="text-xs text-[var(--text-tertiary)] w-20 flex-shrink-0">
                        [{event.source}]
                      </span>
                    )}
                    <span className={`flex-1 ${colors.text}`}>
                      {event.message}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
              <Terminal className="w-12 h-12 mb-4 opacity-50" />
              <p>No events available</p>
              <p className="text-xs mt-1">Events will appear here in real-time</p>
            </div>
          )}
          <div ref={eventsEndRef} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Total</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{stats.total}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Info</p>
          <p className="text-xl font-bold text-blue-400">{stats.info}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Warnings</p>
          <p className="text-xl font-bold text-yellow-400">{stats.warning}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Errors</p>
          <p className="text-xl font-bold text-red-400">{stats.error}</p>
        </div>
      </div>
    </div>
  )
}
