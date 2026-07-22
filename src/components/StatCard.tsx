import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; isPositive: boolean }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  sparklineData?: number[]
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = 'blue',
  sparklineData
}: StatCardProps) {
  const colorMap = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', glow: 'glow-blue' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'glow-green' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', glow: 'glow-yellow' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'glow-red' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', glow: 'glow-purple' },
  }

  const colors = colorMap[color]

  // Generate sparkline path
  const generateSparkline = (data: number[], width: number, height: number) => {
    if (!data.length) return ''
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const step = width / (data.length - 1)
    
    return data.map((val, i) => {
      const x = i * step
      const y = height - ((val - min) / range) * height
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  return (
    <div className={`card group cursor-pointer ${colors.glow}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.bg} transition-transform group-hover:scale-110`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-text-secondary uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-text-primary">{value}</p>
        {subtitle && (
          <p className="text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-12">
          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.text.replace('text-', '').replace('-400', '')} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.text.replace('text-', '').replace('-400', '')} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${generateSparkline(sparklineData, 100, 30)} L 100 30 L 0 30 Z`}
              fill={`url(#gradient-${title})`}
              className={colors.text}
            />
            <path
              d={generateSparkline(sparklineData, 100, 30)}
              fill="none"
              stroke={colors.text.replace('text-', '')}
              strokeWidth="2"
              className={colors.text}
            />
          </svg>
        </div>
      )}
    </div>
  )
}
