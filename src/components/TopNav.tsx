import { useState, useEffect } from 'react'
import { Search, Bell, Sun, Moon, User, Zap } from 'lucide-react'
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
    <header className="sticky top-0 z-30 h-16 px-4 md:px-6 flex items-center justify-between 
      bg-[rgba(10,12,18,.85)] backdrop-blur-xl 
      border-b border-white/[0.08]
      shadow-[0_4px_30px_rgba(0,0,0,0.3)]
      rounded-b-lg">
      
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[var(--text-primary)] leading-tight">ZBGym</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-green-400 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>

        {/* Search - Desktop only */}
        <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-white/10">
          <button 
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl 
              bg-white/[0.03] border border-white/[0.08] 
              hover:bg-white/[0.06] hover:border-white/[0.12]
              transition-all duration-200 group"
          >
            <Search className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span className="text-sm text-[var(--text-tertiary)]">Search...</span>
            <div className="flex items-center gap-1 opacity-60">
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white/[0.05] rounded text-[var(--text-tertiary)]">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white/[0.05] rounded text-[var(--text-tertiary)]">K</kbd>
            </div>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Kernel Status - Desktop only */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">Kernel Running</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl 
              bg-white/[0.03] hover:bg-white/[0.08] 
              border border-transparent hover:border-white/[0.08]
              transition-all duration-200
              active:scale-95"
          >
            <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--bg-primary)]" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 
              glass rounded-xl overflow-hidden z-50 animate-fade-in">
              <div className="p-4 border-b border-white/[0.08]">
                <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="p-4 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-2 h-2 rounded-full mt-2 flex-shrink-0
                        ${notif.type === 'info' ? 'bg-blue-500' : ''}
                        ${notif.type === 'warning' ? 'bg-yellow-500' : ''}
                        ${notif.type === 'success' ? 'bg-green-500' : ''}
                      `} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)]">{notif.message}</p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* License Badge - Desktop only */}
        <div className="hidden md:block px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/20">
          <span className="text-xs font-semibold text-green-400">Pro</span>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl 
            bg-white/[0.03] hover:bg-white/[0.08] 
            border border-transparent hover:border-white/[0.08]
            transition-all duration-200
            active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-[var(--text-secondary)]" />
          ) : (
            <Moon className="w-5 h-5 text-[var(--text-secondary)]" />
          )}
        </button>

        {/* User Profile - Desktop only */}
        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/[0.08]">
          <div className="text-right">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Admin</p>
            <p className="text-xs text-[var(--text-tertiary)]">admin@zbgym.io</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Time - Desktop only */}
        <div className="hidden xl:block pl-3 border-l border-white/[0.08] text-right">
          <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">{formatTime(currentTime)}</p>
          <p className="text-xs text-[var(--text-tertiary)]">{formatDate(currentTime)}</p>
        </div>
      </div>
    </header>
  )
}
