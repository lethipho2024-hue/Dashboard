// Command Center Page
// Remote control center for framework commands

import { useState, useCallback } from 'react'
import { 
  Terminal, 
  Search, 
  Play, 
  Pause, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Code,
  Zap,
  Shield,
  History
} from 'lucide-react'
import { useCommands, useQuickActions } from '../hooks/useCommands'
import { 
  CommandInfo, 
  CommandStatus,
  CommandCategory,
  PermissionLevel 
} from '../services/commands/types'
import { 
  getPermissionLabel, 
  getPermissionColor,
  isDestructiveCommand,
  isAdminCommand,
} from '../services/commands/permissions'

export default function CommandCenter() {
  const {
    commands,
    commandsByCategory,
    isLoadingCommands,
    queue,
    executing,
    history,
    isLoadingHistory,
    execute,
    isExecuting,
    lastResponse,
    error,
    stats,
    cancelCommand,
    refreshQueue,
    refreshHistory,
  } = useCommands()

  const { quickActions, executeQuickAction } = useQuickActions()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCommand, setSelectedCommand] = useState<CommandInfo | null>(null)
  const [commandArgs, setCommandArgs] = useState<Record<string, string>>({})
  const [showDevMode, setShowDevMode] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const filteredCommands = commands.filter((cmd) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        cmd.name.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.aliases.some((a) => a.toLowerCase().includes(query))
      )
    }
    if (selectedCategory) {
      return cmd.category === selectedCategory
    }
    return true
  })

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleExecute = useCallback(async () => {
    if (!selectedCommand) return

    const args: Record<string, unknown> = {}
    Object.entries(commandArgs).forEach(([key, value]) => {
      if (value) {
        try {
          args[key] = JSON.parse(value)
        } catch {
          args[key] = value
        }
      }
    })

    await execute(selectedCommand.name, args, showDevMode)
    setCommandArgs({})
  }, [selectedCommand, commandArgs, execute, showDevMode])

  const handleQuickAction = useCallback(async (action: typeof quickActions[0]) => {
    await executeQuickAction(action)
  }, [executeQuickAction])

  const getStatusIcon = (status: CommandStatus) => {
    switch (status) {
      case CommandStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case CommandStatus.FAILED:
        return <XCircle className="w-4 h-4 text-red-400" />
      case CommandStatus.EXECUTING:
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case CommandStatus.QUEUED:
        return <Clock className="w-4 h-4 text-yellow-400" />
      case CommandStatus.DENIED:
        return <Shield className="w-4 h-4 text-orange-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryIcon = (category: CommandCategory) => {
    switch (category) {
      case CommandCategory.KERNEL:
        return <Zap className="w-4 h-4" />
      case CommandCategory.TRAINER:
        return <Terminal className="w-4 h-4" />
      case CommandCategory.REPLAY:
        return <Play className="w-4 h-4" />
      case CommandCategory.PLUGINS:
        return <Code className="w-4 h-4" />
      case CommandCategory.FRAMEWORK:
        return <Shield className="w-4 h-4" />
      default:
        return <Terminal className="w-4 h-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false })
  }

  const categories = Object.keys(commandsByCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-[var(--text-primary)]" />
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Command Center</h1>
            <p className="text-xs text-[var(--text-secondary)]">Remote framework control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={showDevMode}
              onChange={(e) => setShowDevMode(e.target.checked)}
              className="rounded"
            />
            Dev Mode
          </label>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              disabled={isExecuting}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                action.isDestructive
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-white/5 text-[var(--text-primary)] hover:bg-white/10'
              } ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{action.icon}</span>
              <span>{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Queue</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.queueSize}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Executing</p>
          <p className="text-2xl font-bold text-blue-400">{stats.executingCount}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">History</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.historyTotal}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)]">Success Rate</p>
          <p className="text-2xl font-bold text-green-400">{stats.successRate.toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commands Panel */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Commands</h3>
            <button
              onClick={() => {
                refreshQueue()
                refreshHistory()
              }}
              className="btn btn-secondary text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                !selectedCategory
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                  selectedCategory === cat
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Commands List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {isLoadingCommands ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : filteredCommands.length > 0 ? (
              filteredCommands.map((cmd) => (
                <div
                  key={cmd.name}
                  onClick={() => setSelectedCommand(cmd)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCommand?.name === cmd.name
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(cmd.category)}
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {cmd.name}
                      </span>
                      {cmd.is_destructive && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">
                          destructive
                        </span>
                      )}
                      {isAdminCommand(cmd.name) && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400">
                          admin
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      getPermissionColor(cmd.permission_level) === 'green' ? 'bg-green-500/20 text-green-400' :
                      getPermissionColor(cmd.permission_level) === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                      getPermissionColor(cmd.permission_level) === 'red' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {getPermissionLabel(cmd.permission_level)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {cmd.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-secondary)] text-center py-8">
                No commands found
              </p>
            )}
          </div>
        </div>

        {/* Execution Panel */}
        <div className="space-y-6">
          {/* Execute Panel */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Execute Command
            </h3>

            {selectedCommand ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="font-mono text-sm text-[var(--text-primary)]">
                      {selectedCommand.name}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {selectedCommand.description}
                  </p>
                </div>

                {selectedCommand.arguments_schema && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
                      Arguments
                    </h4>
                    {Object.entries(
                      (selectedCommand.arguments_schema as Record<string, { type?: string }>)?.properties || {}
                    ).map(([key, schema]) => (
                      <div key={key}>
                        <label className="block text-xs text-[var(--text-secondary)] mb-1">
                          {key}
                          {(schema as { required?: boolean })?.required && (
                            <span className="text-red-400 ml-1">*</span>
                          )}
                        </label>
                        <input
                          type="text"
                          placeholder={`Enter ${key}...`}
                          value={commandArgs[key] || ''}
                          onChange={(e) =>
                            setCommandArgs((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    selectedCommand.is_destructive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Execute {selectedCommand.name}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a command to execute</p>
              </div>
            )}
          </div>

          {/* Last Response */}
          {lastResponse && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Last Response
                </h3>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  lastResponse.success
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {lastResponse.success ? 'Success' : 'Failed'}
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-white/5">
                  <span className="text-[var(--text-secondary)]">Request ID</span>
                  <span className="text-[var(--text-primary)]">{lastResponse.request_id}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/5">
                  <span className="text-[var(--text-secondary)]">Execution Time</span>
                  <span className="text-[var(--text-primary)]">{lastResponse.execution_time.toFixed(4)}s</span>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[var(--text-secondary)]">Message</span>
                  <p className="text-[var(--text-primary)] mt-1">{lastResponse.message}</p>
                </div>
                {lastResponse.error_code && (
                  <div className="p-2 rounded bg-red-500/10">
                    <span className="text-red-400">Error: {lastResponse.error_code}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Execution History */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Commands
              </h3>
            </div>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.request_id}
                    className="flex items-center justify-between p-2 rounded bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm text-[var(--text-primary)] font-mono">
                        {item.command}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span>{formatTime(item.queued_at)}</span>
                      <span>{item.execution_time.toFixed(3)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)] text-center py-8">
                No command history
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
