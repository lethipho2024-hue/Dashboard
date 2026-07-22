interface HealthRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  status: 'healthy' | 'warning' | 'error'
}

export default function HealthRing({ 
  percentage, 
  size = 200, 
  strokeWidth = 12,
  status 
}: HealthRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const colors = {
    healthy: { stroke: '#22C55E', glow: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' },
    warning: { stroke: '#F59E0B', glow: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' },
    error: { stroke: '#EF4444', glow: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' },
  }

  const color = colors[status]

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        width={size} 
        height={size} 
        className="progress-ring"
        style={{ filter: color.glow }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-text-primary">{percentage}%</span>
        <span className={`text-sm font-medium ${
          status === 'healthy' ? 'text-green-400' : 
          status === 'warning' ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {status === 'healthy' ? 'Healthy' : status === 'warning' ? 'Warning' : 'Critical'}
        </span>
      </div>
    </div>
  )
}
