import { Play, Pause, SkipForward, Save, Trophy } from 'lucide-react'

export default function Trainer() {
  const trainingStats = [
    { label: 'Episode', value: '1,247' },
    { label: 'Step', value: '500,000' },
    { label: 'Reward', value: '+2,450' },
    { label: 'FPS', value: '144' },
  ]

  const progressData = [
    { label: 'Loss', current: 0.023, target: 0.01 },
    { label: 'Accuracy', current: 87, target: 95 },
    { label: 'Win Rate', current: 72, target: 90 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Trainer</h1>
          <p className="text-[var(--text-secondary)] mt-1">Training session monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-2">
            <span className="status-dot status-healthy animate-pulse" />
            <span className="text-sm font-medium text-green-400">Training</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
              <Play className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-xl bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-colors">
              <Pause className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-xl bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-colors">
              <SkipForward className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-secondary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Checkpoint
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trainingStats.map((stat) => (
          <div key={stat.label} className="card text-center">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Training Progress</h3>
        <div className="space-y-6">
          {progressData.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-primary)]">{item.label}</span>
                <span className="text-sm text-[var(--text-secondary)]">Target: {item.target}</span>
              </div>
              <div className="relative">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.current / item.target) * 100}%` }}
                  />
                </div>
                <div 
                  className="absolute top-0 h-3 w-0.5 bg-white/50"
                  style={{ left: '100%' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Current</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{item.current}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkpoints */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Checkpoints</h3>
        <div className="space-y-3">
          {[
            { name: 'checkpoint_1200', time: '2 min ago', reward: '+2,340' },
            { name: 'checkpoint_1150', time: '5 min ago', reward: '+2,280' },
            { name: 'checkpoint_1100', time: '8 min ago', reward: '+2,210' },
            { name: 'checkpoint_1050', time: '11 min ago', reward: '+2,150' },
          ].map((checkpoint, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-[var(--text-primary)] font-medium">{checkpoint.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{checkpoint.time}</p>
                </div>
              </div>
              <span className="text-green-400 font-medium">{checkpoint.reward}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
