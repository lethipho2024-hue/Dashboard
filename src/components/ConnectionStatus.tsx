// Connection Status Component

import { useConnection } from '../store'
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  AlertTriangle, 
  RefreshCw,
  Server,
  Activity
} from 'lucide-react'

export default function ConnectionStatus() {
  const { 
    status, 
    latency, 
    isHealthy,
    reconnectAttempts,
    heartbeat
  } = useConnection()

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-400" />
      case 'connecting':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case 'reconnecting':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
      case 'disconnected':
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-400" />
      case 'gateway_unavailable':
        return <Server className="w-4 h-4 text-red-400" />
      case 'framework_offline':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'reconnecting':
        return `Reconnecting (${reconnectAttempts})...`
      case 'disconnected':
        return 'Disconnected'
      case 'offline':
        return 'Offline'
      case 'gateway_unavailable':
        return 'Gateway Unavailable'
      case 'framework_offline':
        return 'Framework Offline'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 border-green-500/30 text-green-400'
      case 'connecting':
      case 'reconnecting':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
      case 'disconnected':
      case 'offline':
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
      case 'gateway_unavailable':
      case 'framework_offline':
        return 'bg-red-500/20 border-red-500/30 text-red-400'
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
    }
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-xs font-medium">{getStatusText()}</span>
      
      {status === 'connected' && latency > 0 && (
        <span className="text-xs opacity-70">
          {latency}ms
        </span>
      )}
      
      {status === 'connected' && heartbeat.missed > 0 && (
        <span className="text-xs text-yellow-400">
          ({heartbeat.missed} missed)
        </span>
      )}
    </div>
  )
}

// Compact version for sidebar or header
export function ConnectionStatusCompact() {
  const { status, isHealthy } = useConnection()

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${
        status === 'connected' && isHealthy
          ? 'bg-green-500 animate-pulse'
          : status === 'reconnecting' || status === 'connecting'
          ? 'bg-yellow-500 animate-pulse'
          : 'bg-red-500'
      }`} />
    </div>
  )
}
