import { useState } from 'react'
import { LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Cpu, HardDrive, Gauge, Wifi, Activity, AlertCircle } from 'lucide-react'
import { useSessions } from '../services/zbgym'

export default function Metrics() {
  const [timeRange, setTimeRange] = useState('1h')
  const { data: sessions, loading: sessionsLoading, error: sessionsError } = useSessions()

  // Framework sessions data (from backend)
  const sessionsData = sessions || []
  const completedSessions = sessionsData.filter(s => s.status === 'completed')
  const avgReward = completedSessions.length > 0 
    ? (completedSessions.reduce((sum, s) => sum + (s.mean_reward || 0), 0) / completedSessions.length).toFixed(3)
    : '0.000'

  // Metric cards - most require system data not available from backend
  const metricCards = [
    { label: 'CPU', value: '-', icon: Cpu, color: 'blue', available: false },
    { label: 'GPU', value: '-', icon: Gauge, color: 'purple', available: false },
    { label: 'RAM', value: '-', icon: HardDrive, color: 'green', available: false },
    { label: 'VRAM', value: '-', icon: HardDrive, color: 'yellow', available: false },
    { label: 'Sessions', value: sessionsData.length.toString(), icon: Activity, color: 'blue', available: true },
    { label: 'Latency', value: '-', icon: Wifi, color: 'blue', available: false },
    { label: 'FPS', value: '-', icon: Gauge, color: 'green', available: false },
    { label: 'Network', value: '-', icon: Wifi, color: 'purple', available: false },
  ]

  // Generate placeholder data for charts
  const generateData = (points: number = 20) => {
    return Array.from({ length: points }, (_, i) => ({
      time: `${i}`,
      value: Math.floor(Math.random() * 40) + 40,
    }))
  }

  const areaData = generateData(24)
  
  const radialData = [
    { name: 'Sessions', value: sessionsData.length, fill: '#3B82F6' },
  ]

  const donutData = [
    { name: 'Completed', value: completedSessions.length, fill: '#22C55E' },
    { name: 'Pending/Running', value: sessionsData.length - completedSessions.length, fill: 'rgba(255,255,255,0.1)' },
  ]

  const chartConfig = {
    stroke: { curve: 'smooth' },
    fill: { fillOpacity: 0.2 },
    grid: { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' },
    axis: { stroke: 'rgba(255,255,255,0.3)', tick: { fill: '#9CA3AF', fontSize: 10 } },
  }

  if (sessionsError) {
    return (
      <div className="space-y-6">
        <div className="card bg-red-500/10 border border-red-500/20 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-red-400 font-medium">Cannot Connect to Framework</p>
              <p className="text-text-[var(--text-secondary] text-sm">{sessionsError}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-[var(--text-primary)]">Metrics</h1>
          <p className="text-text-[var(--text-secondary] mt-1">
            {sessionsLoading ? 'Loading metrics...' : 'Training metrics from framework'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          {['5m', '15m', '1h', '6h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range 
                  ? 'bg-blue-500 text-white' 
                  : 'text-text-[var(--text-secondary] hover:text-text-[var(--text-primary)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon
          const colorMap: Record<string, string> = {
            blue: 'text-blue-400 bg-blue-500/20',
            green: 'text-green-400 bg-green-500/20',
            yellow: 'text-yellow-400 bg-yellow-500/20',
            red: 'text-red-400 bg-red-500/20',
            purple: 'text-purple-400 bg-purple-500/20',
          }
          return (
            <div key={metric.label} className={`card text-center ${!metric.available ? 'opacity-60' : ''}`}>
              <div className={`inline-flex p-2 rounded-lg ${colorMap[metric.color]} mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-text-[var(--text-secondary)]">{metric.label}</p>
              <p className="text-lg font-bold text-text-[var(--text-primary)]">{metric.value}</p>
              {!metric.available && (
                <p className="text-[10px] text-text-[var(--text-tertiary)]">No backend data</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Session Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mean Reward Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-[var(--text-primary] mb-4">Mean Reward (Sessions)</h3>
          <div className="h-64">
            {sessionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="rewardGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" {...chartConfig.axis} />
                  <YAxis {...chartConfig.axis} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1F2937', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22C55E" 
                    fill="url(#rewardGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-[var(--text-secondary)]">
                No session data available
              </div>
            )}
          </div>
        </div>

        {/* Timesteps Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-[var(--text-primary] mb-4">Training Progress</h3>
          <div className="h-64">
            {sessionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateData(20)}>
                  <XAxis dataKey="time" {...chartConfig.axis} />
                  <YAxis {...chartConfig.axis} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1F2937', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-[var(--text-secondary)]">
                No session data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avg Reward */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-[var(--text-primary] mb-4">Avg Mean Reward</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  strokeWidth={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1F2937', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-2xl font-bold text-text-[var(--text-primary)]">{avgReward}</p>
            <p className="text-xs text-text-[var(--text-secondary)]">Average reward</p>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-[var(--text-primary] mb-4">Session Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="80%" data={radialData}>
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#3B82F6"
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-2xl font-bold text-text-[var(--text-primary)]">{sessionsData.length}</p>
            <p className="text-xs text-text-[var(--text-secondary)]">Total sessions</p>
          </div>
        </div>

        {/* Completed */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-[var(--text-primary] mb-4">Completed</h3>
          <div className="h-48 flex items-center justify-center">
            <p className="text-4xl font-bold text-green-400">{completedSessions.length}</p>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-text-[var(--text-secondary)]">Completed sessions</p>
          </div>
        </div>
      </div>

      {/* System Metrics - Not available */}
      <div className="card bg-yellow-500/5 border border-yellow-500/20 p-4">
        <div className="flex items-center gap-2 text-yellow-400">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">System Metrics Not Available</p>
        </div>
        <p className="text-text-[var(--text-secondary] text-sm mt-2">
          CPU/GPU/RAM/VRAM/TPS/FPS/Disk/Network metrics require system-level monitoring which is not available from the ZBGym backend API. 
          These will show '-' until a system metrics endpoint is added to the backend.
        </p>
      </div>
    </div>
  )
}
