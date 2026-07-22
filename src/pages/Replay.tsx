import { Play, Pause, Download, HardDrive, Clock, Circle } from 'lucide-react'
import { useReplay } from '../store'

export default function Replay() {
  const { status, isRecording, getSizeFormatted, getRecordingDuration } = useReplay()

  const replayStats = [
    { label: 'Recording Status', value: isRecording() ? 'Active' : 'Inactive', icon: Circle },
    { label: 'Replay Size', value: getSizeFormatted(), icon: HardDrive },
    { label: 'Queue Size', value: status.replay_queue_size.toString(), icon: Clock },
    { label: 'Disk Usage', value: `${status.disk_usage_percent.toFixed(1)}%`, icon: Circle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Replay</h1>
          <p className="text-[var(--text-secondary)] mt-1">Session recordings and playback</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`status-dot ${isRecording() ? 'status-error animate-pulse' : 'status-healthy'}`} />
          <span className={`text-sm font-medium ${isRecording() ? 'text-red-400' : 'text-green-400'}`}>
            {isRecording() ? 'Recording' : 'Not Recording'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {replayStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isRecording() ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                  <Icon className={`w-5 h-5 ${isRecording() ? 'text-red-400' : 'text-blue-400'}`} />
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Replay Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className="text-[var(--text-secondary)]">Current Replay</span>
            <span className="text-[var(--text-primary)] font-mono">
              {status.current_replay || 'None'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className="text-[var(--text-secondary)]">Recording Duration</span>
            <span className="text-[var(--text-primary)] font-mono">
              {isRecording() ? `${getRecordingDuration()}s` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className="text-[var(--text-secondary)]">Replay Size</span>
            <span className="text-[var(--text-primary)] font-mono">{getSizeFormatted()}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className="text-[var(--text-secondary)]">Queue Size</span>
            <span className="text-[var(--text-primary)] font-mono">{status.replay_queue_size}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Playback Controls</h3>
        <div className="flex items-center justify-center gap-6 p-8">
          <div className="flex items-center gap-3">
            <button className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <Pause className="w-6 h-6 text-[var(--text-primary)]" />
            </button>
            <div className="text-center">
              <p className="text-3xl font-mono font-bold text-[var(--text-primary)]">00:00:00</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Playback Time</p>
            </div>
            <button className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <Play className="w-6 h-6 text-[var(--text-primary)]" />
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-blue-500 rounded-full transition-all" />
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>00:00</span>
            <span>01:00:00</span>
          </div>
        </div>
      </div>
    </div>
  )
}
