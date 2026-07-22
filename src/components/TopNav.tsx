import { useState, useEffect } from 'react'
import { Search, Bell, Sun, Moon, User } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface TopNavProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  showSearch: boolean
  setShowSearch: (show: boolean) => void
}

export default function TopNav({ setShowSearch }: TopNavProps) {
  const { theme, toggleTheme } = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notifications] = useState([
    { id: 1, type: 'info', message: 'Framework initialized successfully', time: '2m ago' },
    { id: 2, type: 'warning', message: 'High memory usage detected', time: '5m ago' },
    { id: 3, type: 'success', message: 'AI Agent completed task', time: '10m ago' },
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowNotifications(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setShowSearch])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-white/5 bg-bg-secondary/50 backdrop-blur-sm">
      {/* Left: Search - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-4">
        <button 
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group"
        >
          <Search className="w-4 h-4 text-text-secondary" />
          <span className="text-sm text-text-secondary">Search...</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs bg-white/5 rounded text-text-secondary">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-xs bg-white/5 rounded text-text-secondary">K</kbd>
          </div>
        </button>
      </div>

      {/* Mobile Title */}
      <div className="md:hidden flex items-center gap-2 pl-14">
        <span className="text-lg font-bold text-text-primary">ZBGym</span>
        <span className="status-dot status-healthy" />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 glass rounded-xl overflow-hidden z-50 animate-fade-in">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-text-primary">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-2 h-2 rounded-full mt-2
                        ${notif.type === 'info' ? 'bg-blue-500' : ''}
                        ${notif.type === 'warning' ? 'bg-yellow-500' : ''}
                        ${notif.type === 'success' ? 'bg-green-500' : ''}
                      `} />
                      <div className="flex-1">
                        <p className="text-sm text-text-primary">{notif.message}</p>
                        <p className="text-xs text-text-secondary mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* License Badge - Hidden on mobile */}
        <div className="hidden md:block px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
          <span className="text-xs font-medium text-green-400">Pro License</span>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] transition-all duration-200"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-[var(--text-secondary)]" />
          ) : (
            <Moon className="w-5 h-5 text-[var(--text-secondary)]" />
          )}
        </button>

        {/* User */}
        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary">Admin</p>
            <p className="text-xs text-text-secondary">admin@zbgym.io</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Time - Hidden on mobile */}
        <div className="hidden lg:block pl-4 border-l border-white/10 text-right">
          <p className="text-sm font-mono text-text-primary">{formatTime(currentTime)}</p>
          <p className="text-xs text-text-secondary">{formatDate(currentTime)}</p>
        </div>
      </div>
    </header>
  )
}
