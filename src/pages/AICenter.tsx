import { Bot, Brain, Code, TestTube, Search } from 'lucide-react'

export default function AICenter() {
  const agents = [
    { 
      name: 'Planner', 
      role: 'Strategic planning agent',
      status: 'active',
      avatar: '🧠',
      currentTask: 'Analyzing next episode strategy',
      runtime: '02:34:12',
      progress: 75,
      memory: '1.2 GB'
    },
    { 
      name: 'Builder', 
      role: 'Architecture builder agent',
      status: 'active',
      avatar: '🏗️',
      currentTask: 'Building neural network layers',
      runtime: '01:45:30',
      progress: 45,
      memory: '2.4 GB'
    },
    { 
      name: 'Coder', 
      role: 'Code generation agent',
      status: 'active',
      avatar: '💻',
      currentTask: 'Implementing reward functions',
      runtime: '02:10:00',
      progress: 60,
      memory: '1.8 GB'
    },
    { 
      name: 'Reviewer', 
      role: 'Code review agent',
      status: 'idle',
      avatar: '👀',
      currentTask: 'Waiting for tasks',
      runtime: '00:30:00',
      progress: 0,
      memory: '856 MB'
    },
    { 
      name: 'Tester', 
      role: 'Testing and validation agent',
      status: 'active',
      avatar: '🧪',
      currentTask: 'Running simulation tests',
      runtime: '01:20:45',
      progress: 90,
      memory: '1.5 GB'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Center</h1>
          <p className="text-[var(--text-secondary)] mt-1">Monitor and manage AI agents</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">{agents.filter(a => a.status === 'active').length} Active</span>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.name} className="card group hover:scale-[1.02] transition-transform">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-2xl">
                  {agent.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{agent.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{agent.role}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                agent.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-white/10 text-[var(--text-secondary)]'
              }`}>
                {agent.status}
              </span>
            </div>

            {/* Current Task */}
            <div className="mb-4">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Current Task</p>
              <p className="text-sm text-[var(--text-primary)]">{agent.currentTask}</p>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-secondary)]">Progress</span>
                <span className="text-xs font-medium text-[var(--text-primary)]">{agent.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Runtime</p>
                <p className="text-sm font-mono text-[var(--text-primary)]">{agent.runtime}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Memory</p>
                <p className="text-sm font-mono text-[var(--text-primary)]">{agent.memory}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Add Agent
          </button>
          <button className="px-4 py-2 rounded-xl bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-colors flex items-center gap-2">
            <Code className="w-4 h-4" />
            Deploy All
          </button>
          <button className="px-4 py-2 rounded-xl bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-colors flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Run Tests
          </button>
          <button className="px-4 py-2 rounded-xl bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            Analyze
          </button>
        </div>
      </div>
    </div>
  )
}
