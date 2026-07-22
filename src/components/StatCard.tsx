import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

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
    blue: { 
      bg: 'bg-blue-500/15', 
      text: 'text-blue-400', 
      glow: 'hover:shadow-blue-500/20',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500/10',
      sparkline: '#3B82F6'
    },
    green: { 
      bg: 'bg-green-500/15', 
      text: 'text-green-400', 
      glow: 'hover:shadow-green-500/20',
      border: 'border-green-500/20',
      gradient: 'from-green-500/10',
      sparkline: '#22C55E'
    },
    yellow: { 
      bg: 'bg-yellow-500/15', 
      text: 'text-yellow-400', 
      glow: 'hover:shadow-yellow-500/20',
      border: 'border-yellow-500/20',
      gradient: 'from-yellow-500/10',
      sparkline: '#F59E0B'
    },
    red: { 
      bg: 'bg-red-500/15', 
      text: 'text-red-400', 
      glow: 'hover:shadow-red-500/20',
      border: 'border-red-500/20',
      gradient: 'from-red-500/10',
      sparkline: '#EF4444'
    },
    purple: { 
      bg: 'bg-purple-500/15', 
      text: 'text-purple-400', 
      glow: 'hover:shadow-purple-500/20',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500/10',
      sparkline: '#8B5CF6'
    },
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
    <div className={`card group cursor-pointer p-5 ${colors.glow} relative overflow-hidden`}>
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${colors.text.replace('text-', 'bg-')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border} backdrop-blur-sm transition-all duration-300 group-hover:scale-105`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${
              trend.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-[12px] text-[var(--text-secondary)] uppercase tracking-wider font-medium">{title}</p>
          <p className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
          {subtitle && (
            <p className="text-[13px] text-[var(--text-tertiary)] font-medium">{subtitle}</p>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4 h-12">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.sparkline} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={colors.sparkline} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${generateSparkline(sparklineData, 100, 30)} L 100 30 L 0 30 Z`}
                fill={`url(#gradient-${title})`}
              />
              <path
                d={generateSparkline(sparklineData, 100, 30)}
                fill="none"
                stroke={colors.sparkline}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
