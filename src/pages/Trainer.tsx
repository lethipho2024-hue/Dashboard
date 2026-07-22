import { Save, Loader2, AlertCircle, Plus } from 'lucide-react'
import { useSessions, useCreateSession } from '../services/zbgym'

export default function Trainer() {
  const { data: sessions, loading, error, refetch } = useSessions()
  const { createSession, loading: creating } = useCreateSession()

  const runningSessions = sessions?.filter(s => s.status === 'running') || []
  const currentSession = runningSessions[0]

  const handleCreateSession = async () => {
    const session = await createSession({
      env_id: 'CartPole-v1',
      algorithm: 'PPO',
      total_timesteps: 1000000,
    })
    if (session) {
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Trainer</h1>
          <p className="text-[var(--text-secondary)] mt-1">Training session management</p>
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="px-4 py-2 flex items-center gap-2 text-[var(--text-secondary)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : runningSessions.length > 0 ? (
            <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-2">
              <span className="status-dot status-healthy animate-pulse" />
              <span className="text-sm font-medium text-green-400">{runningSessions.length} Training</span>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">No active sessions</span>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCreateSession}
              disabled={creating}
              className="p-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-secondary flex items-center gap-2" disabled>
              <Save className="w-4 h-4" />
              Save Checkpoint
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Sessions</p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{sessions?.length || 0}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Running</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{runningSessions.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {sessions?.filter(s => s.status === 'completed').length || 0}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Mean Reward</p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">
            {currentSession?.mean_reward.toFixed(3) || '-'}
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Training Sessions</h3>
        {sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    session.status === 'running' ? 'bg-green-500 animate-pulse' :
                    session.status === 'completed' ? 'bg-blue-500' :
                    session.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      {session.algorithm || 'Session'} - {session.env_id || 'Unknown Env'}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      ID: {session.id} • {session.current_timestep.toLocaleString()} timesteps
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    session.status === 'running' ? 'text-green-400' :
                    session.status === 'completed' ? 'text-blue-400' : 'text-[var(--text-secondary)]'
                  }`}>
                    {session.status}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Reward: {session.mean_reward.toFixed(3)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-secondary)] text-center py-8">
            No training sessions. Click + to create one.
          </p>
        )}
      </div>

      {/* Progress - Not available from backend */}
      <div className="card opacity-60">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Training Progress</h3>
        <p className="text-[var(--text-secondary)] text-center py-8">
          Progress metrics (Loss, Accuracy, Win Rate) require detailed session data not available from the current backend API.
        </p>
      </div>
    </div>
  )
}
