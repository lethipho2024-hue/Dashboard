import { useState } from 'react'
import { 
  LayoutDashboard, Cpu, Heart, Package, Bot, Dumbbell, 
  RotateCcw, BarChart3, Terminal, FileText, Puzzle, 
  Key, Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'

type PageType = 'dashboard' | 'kernel' | 'health' | 'modules' | 'ai' | 'trainer' | 'replay' | 'metrics' | 'console' | 'logs' | 'plugins' | 'license' | 'settings'

interface SidebarProps {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const menuItems = [
  { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kernel' as PageType, label: 'Kernel', icon: Cpu },
  { id: 'health' as PageType, label: 'Framework Health', icon: Heart },
  { id: 'modules' as PageType, label: 'Module Manager', icon: Package },
  { id: 'ai' as PageType, label: 'AI Center', icon: Bot },
  { id: 'trainer' as PageType, label: 'Trainer', icon: Dumbbell },
  { id: 'replay' as PageType, label: 'Replay', icon: RotateCcw },
  { id: 'metrics' as PageType, label: 'Metrics', icon: BarChart3 },
  { id: 'console' as PageType, label: 'Event Console', icon: Terminal },
  { id: 'logs' as PageType, label: 'Logs', icon: FileText },
  { id: 'plugins' as PageType, label: 'Plugins', icon: Puzzle },
  { id: 'license' as PageType, label: 'License', icon: Key },
  { id: 'settings' as PageType, label: 'Settings', icon: Settings },
]

export default function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <aside 
      className={`
        relative flex flex-col h-full transition-all duration-300 ease-out
        bg-bg-secondary border-r border-white/5
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-text-primary">ZBGym</h1>
            <p className="text-xs text-text-secondary">Control Center</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setCurrentPage(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                  
                  {!collapsed && (
                    <span className={`text-sm font-medium ${isActive ? 'text-blue-400' : ''}`}>
                      {item.label}
                    </span>
                  )}
                  
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                  )}
                </button>
                
                {/* Tooltip */}
                {collapsed && hoveredItem === item.id && (
                  <div className="tooltip left-full ml-2 top-1/2 -translate-y-1/2">
                    {item.label}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-bg-secondary border border-white/10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all duration-200 z-10"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Version */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-text-secondary">Version 1.0.0</p>
        </div>
      )}
    </aside>
  )
}
