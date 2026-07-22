import { Play, Pause, Download, HardDrive, Clock, FileArchive, Circle, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useSessions } from '../services/zbgym'

export default function Replay() {
  const { data: sessions, loading, refetch } = useSessions()

  // Get completed sessions as "recordings"
  const recordings = (sessions || [])
    .filter(s => s.status === 'completed' || s.status === 'running')
    .map(s => ({
      id: s.id,
      name: `Session #${s.id}`,
      env: s.env_id,
      algorithm: s.algorithm,
      steps: s.current_timestep,
      reward: s.mean_reward,
      status: s.status === 'running' ? 'recording' : 'saved',
      duration: s.status === 'running' ? 'In Progress' : 'Completed'
    }))

  const replayStats = [
    { label: 'Total Sessions', value: sessions?.length?.toString() || '0', icon: Circle },
    { label: 'Completed', value: recordings.filter(r => r.status === 'saved').length.toString(), icon: FileArchive },
    { label: 'Running', value: recordings.filter(r => r.status === 'recording').length.toString(), icon: HardDrive },
    { label: 'Total Steps', value: sessions?.reduce((acc, s) => acc + s.current_timestep, 0).toLocaleString() || '0', icon: Clock },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Replay</h1>
          <p className="text-[var(--text-secondary)] mt-1">Session recordings and playback</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refetch} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="btn btn-secondary flex items-center gap-2" disabled>
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-3" />
          <span className="text-[var(--text-secondary)]">Loading sessions...</span>
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {replayStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Sessions from Backend */}
      {!loading && recordings.length > 0 && (
        <div className="card">
          <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Sessions from backend API</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] p-4 pb-2">Sessions</h3>
          <div className="space-y-3 p-4 pt-2">
            {recordings.map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <button className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                    <Play className="w-5 h-5" />
                  </button>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">{recording.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{recording.algorithm} • {recording.env}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[var(--text-primary)]">{recording.steps.toLocaleString()} steps</p>
                    <p className="text-xs text-[var(--text-secondary)]">Reward: {recording.reward.toFixed(2)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recording.status === 'recording' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {recording.status === 'recording' ? 'Running' : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data */}
      {!loading && recordings.length === 0 && (
        <div className="card">
          <p className="text-[var(--text-secondary)] text-center py-12">
            No sessions available. Start training from the Trainer page.
          </p>
        </div>
      )}

      {/* Backend Limitation */}
      <div className="card bg-yellow-500/10 border border-yellow-500/20">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Replay Data</h3>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <p>• <strong>Available:</strong> Session list from /sessions endpoint</p>
          <p>• <strong>Not available:</strong> Episode recording, playback controls, compression, storage info</p>
          <p className="text-xs mt-2 opacity-75">
            Full replay system requires additional endpoints in the ZBGym backend
          </p>
        </div>
      </div>

      {/* Demo Placeholder */}
      <div className="card opacity-60">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Playback Controls (Demo)</h3>
        <div className="flex items-center justify-center gap-6 p-8">
          <div className="flex items-center gap-3">
            <button className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <Pause className="w-6 h-6 text-[var(--text-primary)]" />
            </button>
            <div className="text-center">
              <p className="text-3xl font-mono font-bold text-[var(--text-primary)]">00:00:00</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Demo Duration</p>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-[var(--text-tertiary)]">
          Playback controls require a replay endpoint in the backend
        </p>
      </div>
    </div>
  )
}
