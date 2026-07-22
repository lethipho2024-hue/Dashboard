import { useState } from 'react'
import { LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Cpu, HardDrive, Gauge, Wifi, Activity } from 'lucide-react'

export default function Metrics() {
  const [timeRange, setTimeRange] = useState('1h')

  // Generate mock data
  const generateData = (points: number = 20) => {
    return Array.from({ length: points }, (_, i) => ({
      time: `${i}`,
      value: Math.floor(Math.random() * 40) + 40,
    }))
  }

  const lineData = generateData(20)
  const areaData = generateData(24)
  
  const radialData = [
    { name: 'CPU', value: 67, fill: '#3B82F6' },
    { name: 'GPU', value: 82, fill: '#8B5CF6' },
    { name: 'RAM', value: 45, fill: '#22C55E' },
  ]

  const donutData = [
    { name: 'Used', value: 67, fill: '#3B82F6' },
    { name: 'Free', value: 33, fill: 'rgba(255,255,255,0.1)' },
  ]

  const metricCards = [
    { label: 'CPU', value: '67%', icon: Cpu, color: 'blue' },
    { label: 'GPU', value: '82%', icon: Gauge, color: 'purple' },
    { label: 'RAM', value: '14.2 GB', icon: HardDrive, color: 'green' },
    { label: 'VRAM', value: '6.2 GB', icon: HardDrive, color: 'yellow' },
    { label: 'TPS', value: '60', icon: Activity, color: 'green' },
    { label: 'Latency', value: '12ms', icon: Wifi, color: 'blue' },
    { label: 'FPS', value: '144', icon: Gauge, color: 'green' },
    { label: 'Network', value: '125 MB/s', icon: Wifi, color: 'purple' },
  ]

  const chartConfig = {
    stroke: { curve: 'smooth' },
    fill: { fillOpacity: 0.2 },
    grid: { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' },
    axis: { stroke: 'rgba(255,255,255,0.3)', tick: { fill: '#9CA3AF', fontSize: 10 } },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Metrics</h1>
          <p className="text-[var(--text-secondary)] mt-1">Real-time performance monitoring</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          {['5m', '15m', '1h', '6h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range 
                  ? 'bg-blue-500 text-white' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
            <div key={metric.label} className="card text-center">
              <div className={`inline-flex p-2 rounded-lg ${colorMap[metric.color]} mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{metric.label}</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{metric.value}</p>
            </div>
          )
        })}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">CPU Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
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
                  stroke="#3B82F6" 
                  fill="url(#cpuGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GPU Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">GPU Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
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
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RAM Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">RAM</h3>
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
            <p className="text-2xl font-bold text-[var(--text-primary)]">14.2 GB</p>
            <p className="text-xs text-[var(--text-secondary)]">of 32 GB</p>
          </div>
        </div>

        {/* VRAM Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">VRAM</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="80%" data={radialData.slice(0, 1)}>
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#22C55E"
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-2xl font-bold text-[var(--text-primary)]">6.2 GB</p>
            <p className="text-xs text-[var(--text-secondary)]">of 8 GB</p>
          </div>
        </div>

        {/* TPS Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">TPS</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22C55E" 
                  fill="url(#tpsGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-2xl font-bold text-green-400">60</p>
            <p className="text-xs text-[var(--text-secondary)]">ticks/second</p>
          </div>
        </div>
      </div>

      {/* Disk & Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Disk I/O</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-[var(--text-secondary)]">Read</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">245 MB/s</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-[var(--text-secondary)]">Write</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">180 MB/s</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Network</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-[var(--text-secondary)]">Upload</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">45 MB/s</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-[var(--text-secondary)]">Download</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">125 MB/s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
