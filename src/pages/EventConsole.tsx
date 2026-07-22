import { useState } from 'react'
import { Terminal, Search, Copy, Download, Trash2, Info, AlertTriangle, XCircle, Bug } from 'lucide-react'

export default function EventConsole() {
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const logs = [
    { id: 1, type: 'info', time: '12:34:56', module: 'Engine', message: 'Framework initialized successfully' },
    { id: 2, type: 'info', time: '12:34:57', module: 'Module', message: 'Loading module: Physics Engine v2.1.0' },
    { id: 3, type: 'debug', time: '12:34:58', module: 'AI', message: 'Initializing AI agents: 8 loaded' },
    { id: 4, type: 'info', time: '12:34:59', module: 'Trainer', message: 'Training session started - Episode 1247' },
    { id: 5, type: 'warn', time: '12:35:00', module: 'Memory', message: 'High memory usage detected: 85%' },
    { id: 6, type: 'info', time: '12:35:01', module: 'Metrics', message: 'Collecting performance metrics' },
    { id: 7, type: 'error', time: '12:35:02', module: 'Replay', message: 'Failed to save checkpoint: Disk full' },
    { id: 8, type: 'info', time: '12:35:03', module: 'Kernel', message: 'Tick 12847 processed in 12ms' },
    { id: 9, type: 'debug', time: '12:35:04', module: 'Physics', message: 'Collision detection: 245 objects' },
    { id: 10, type: 'info', time: '12:35:05', module: 'AI', message: 'Agent Planner: Strategy updated' },
  ]

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.type !== filter) return false
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-400" />
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />
      case 'debug': return <Bug className="w-4 h-4 text-purple-400" />
      default: return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-400'
      case 'warn': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      case 'debug': return 'text-purple-400'
      default: return 'text-[var(--text-secondary)]'
    }
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-[var(--text-primary)]" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Event Console</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <Download className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <Trash2 className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder-text-secondary focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
          />
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'info', label: 'Info' },
            { id: 'warn', label: 'Warn' },
            { id: 'error', label: 'Error' },
            { id: 'debug', label: 'Debug' },
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

      {/* Console */}
      <div className="flex-1 card overflow-hidden">
        <div className="h-full overflow-y-auto font-mono text-sm">
          {filteredLogs.map((log) => (
            <div 
              key={log.id}
              className="flex items-start gap-3 px-4 py-2 border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <span className="text-[var(--text-secondary)] text-xs w-20 flex-shrink-0">{log.time}</span>
              <span className="text-[var(--text-secondary)] text-xs w-16 flex-shrink-0">{log.module}</span>
              <span className="w-5 flex-shrink-0 flex justify-center">{getTypeIcon(log.type)}</span>
              <span className={`flex-1 ${getTypeColor(log.type)}`}>{log.message}</span>
              <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all">
                <Copy className="w-3 h-3 text-[var(--text-secondary)]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Total</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{logs.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Info</p>
          <p className="text-xl font-bold text-blue-400">{logs.filter(l => l.type === 'info').length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Warnings</p>
          <p className="text-xl font-bold text-yellow-400">{logs.filter(l => l.type === 'warn').length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Errors</p>
          <p className="text-xl font-bold text-red-400">{logs.filter(l => l.type === 'error').length}</p>
        </div>
      </div>
    </div>
  )
}
