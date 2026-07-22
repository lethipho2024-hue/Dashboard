// Toast Notifications Context and Provider

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { getDashboardWs } from '../services/websocket'

export interface Toast {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration: number
  timestamp: Date
}

interface NotificationsContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const NotificationsContext = createContext<NotificationsContextType | null>(null)

interface NotificationsProviderProps {
  children: ReactNode
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      ...toast,
      id,
      timestamp: new Date(),
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Listen for WebSocket notifications
  useEffect(() => {
    const ws = getDashboardWs()
    const unsubscribe = ws.onNotification((title, message, type) => {
      addToast({ title, message, type, duration: 5000 })
    })

    return unsubscribe
  }, [addToast])

  return (
    <NotificationsContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsContextType {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}

// Toast Container Component
export function ToastContainer() {
  const { toasts, removeToast } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            glass rounded-xl p-4 shadow-lg animate-slide-in
            ${toast.type === 'success' ? 'border-green-500/30' : ''}
            ${toast.type === 'error' ? 'border-red-500/30' : ''}
            ${toast.type === 'warning' ? 'border-yellow-500/30' : ''}
            ${toast.type === 'info' ? 'border-blue-500/30' : ''}
          `}
        >
          <div className="flex items-start gap-3">
            <div className={`
              w-2 h-2 rounded-full mt-2 flex-shrink-0
              ${toast.type === 'success' ? 'bg-green-500' : ''}
              ${toast.type === 'error' ? 'bg-red-500' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-500' : ''}
              ${toast.type === 'info' ? 'bg-blue-500' : ''}
            `} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{toast.title}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
