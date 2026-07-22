import { Play, Pause, Download, HardDrive, Clock, FileArchive, Circle } from 'lucide-react'

export default function Replay() {
  const replayStats = [
    { label: 'Current Episode', value: '1,247', icon: Circle },
    { label: 'Replay Size', value: '2.4 GB', icon: FileArchive },
    { label: 'Compression', value: '85%', icon: FileArchive },
    { label: 'Storage Used', value: '24 GB', icon: HardDrive },
  ]

  const recordings = [
    { name: 'Episode_1247', duration: '00:15:30', size: '2.4 GB', date: '2 min ago', status: 'recording' },
    { name: 'Episode_1246', duration: '00:14:45', size: '2.1 GB', date: '15 min ago', status: 'saved' },
    { name: 'Episode_1245', duration: '00:16:20', size: '2.6 GB', date: '30 min ago', status: 'saved' },
    { name: 'Episode_1244', duration: '00:13:50', size: '1.9 GB', date: '45 min ago', status: 'saved' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Replay</h1>
          <p className="text-text-secondary mt-1">Episode recording and playback</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn btn-primary flex items-center gap-2 bg-red-500 hover:bg-red-600">
            <Circle className="w-4 h-4" />
            Start Recording
          </button>
        </div>
      </div>

      {/* Stats */}
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
              <p className="text-xs text-text-secondary">{stat.label}</p>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Recorder Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Recorder Status</h3>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <Pause className="w-6 h-6 text-text-primary" />
            </button>
            <div className="text-center">
              <p className="text-3xl font-mono font-bold text-text-primary">00:15:30</p>
              <p className="text-xs text-text-secondary mt-1">Recording Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recordings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Recordings</h3>
        <div className="space-y-3">
          {recordings.map((recording, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                  <Play className="w-5 h-5" />
                </button>
                <div>
                  <p className="text-text-primary font-medium">{recording.name}</p>
                  <p className="text-xs text-text-secondary">{recording.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-text-primary">{recording.size}</p>
                  <p className="text-xs text-text-secondary flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {recording.duration}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  recording.status === 'recording' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {recording.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Timeline</h3>
        <div className="relative h-24 bg-white/5 rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 border-r border-white/5 ${i % 5 === 0 ? 'border-r-white/20' : ''}`}
              />
            ))}
          </div>
          <div className="absolute inset-y-0 left-1/2 w-1 bg-blue-500 rounded-full animate-pulse">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full" />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-text-secondary">
          <span>00:00</span>
          <span>05:00</span>
          <span>10:00</span>
          <span>15:00</span>
        </div>
      </div>
    </div>
  )
}
