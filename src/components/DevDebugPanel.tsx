// Developer Debug Panel Component

import { useState } from 'react'
import { useConnection } from '../store'
import { X, ChevronDown, ChevronUp, Activity, Zap, MessageSquare, AlertCircle } from 'lucide-react'

interface DevDebugPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function DevDebugPanel({ isOpen, onClose }: DevDebugPanelProps) {
  const [expanded, setExpanded] = useState(true)
  
  const {
    status,
    latency,
    messageRate,
    droppedMessages,
    reconnectAttempts,
    lastConnected,
    lastDisconnected,
    lastReceivedPacket,
    heartbeat,
    subscribedChannels,
  } = useConnection()

  if (!isOpen) return null

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleTimeString()
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 glass rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-white/5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Developer Mode</span>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-1 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4 text-[var(--text-tertiary)]" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Connection Status */}
          <section>
            <h4 className="text-xs font-semibold uppercase text-[var(--text-tertiary)] mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Connection
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Status</span>
                <span className={`font-medium ${
                  status === 'connected' ? 'text-green-400' : 
                  status === 'reconnecting' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Latency</span>
                <span className="font-mono text-[var(--text-primary)]">{latency}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Message Rate</span>
                <span className="font-mono text-[var(--text-primary)]">{messageRate.toFixed(1)}/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Dropped Messages</span>
                <span className="font-mono text-[var(--text-primary)]">{droppedMessages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Reconnect Attempts</span>
                <span className="font-mono text-[var(--text-primary)]">{reconnectAttempts}</span>
              </div>
            </div>
          </section>

          {/* Heartbeat */}
          <section>
            <h4 className="text-xs font-semibold uppercase text-[var(--text-tertiary)] mb-2">
              Heartbeat
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Last Heartbeat</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatTime(heartbeat.lastHeartbeat)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Last ACK</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatTime(heartbeat.lastAck)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Delay</span>
                <span className="font-mono text-[var(--text-primary)]">{heartbeat.delay}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Missed</span>
                <span className={`font-mono ${
                  heartbeat.missed > 0 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {heartbeat.missed}
                </span>
              </div>
            </div>
          </section>

          {/* Timestamps */}
          <section>
            <h4 className="text-xs font-semibold uppercase text-[var(--text-tertiary)] mb-2">
              Timestamps
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Last Connected</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatTime(lastConnected)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Last Disconnected</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatTime(lastDisconnected)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Last Packet</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatTime(lastReceivedPacket)}
                </span>
              </div>
            </div>
          </section>

          {/* Subscribed Channels */}
          <section>
            <h4 className="text-xs font-semibold uppercase text-[var(--text-tertiary)] mb-2 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Channels ({subscribedChannels.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {subscribedChannels.length > 0 ? (
                subscribedChannels.map(channel => (
                  <span
                    key={channel}
                    className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/20 text-blue-400 rounded"
                  >
                    {channel}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--text-tertiary)]">No channels subscribed</span>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
