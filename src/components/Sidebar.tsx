import { useState } from 'react'
import { 
  LayoutDashboard, Cpu, Heart, Package, Bot, Dumbbell, 
  RotateCcw, BarChart3, Terminal, FileText, Puzzle, 
  Key, Settings, ChevronLeft, ChevronRight, Zap, Menu, X, 
  Activity, Layers, Code2
} from 'lucide-react'

type PageType = 'dashboard' | 'kernel' | 'health' | 'modules' | 'ai' | 'trainer' | 'replay' | 'metrics' | 'console' | 'logs' | 'plugins' | 'license' | 'settings'

interface SidebarProps {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const menuSections = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'kernel' as PageType, label: 'Kernel', icon: Cpu },
      { id: 'health' as PageType, label: 'Health', icon: Heart },
    ]
  },
  {
    title: 'Framework',
    items: [
      { id: 'modules' as PageType, label: 'Modules', icon: Package },
      { id: 'replay' as PageType, label: 'Replay', icon: RotateCcw },
      { id: 'trainer' as PageType, label: 'Trainer', icon: Dumbbell },
      { id: 'plugins' as PageType, label: 'Plugins', icon: Puzzle },
      { id: 'ai' as PageType, label: 'AI Center', icon: Bot },
    ]
  },
  {
    title: 'Developer',
    items: [
      { id: 'metrics' as PageType, label: 'Metrics', icon: BarChart3 },
      { id: 'console' as PageType, label: 'Events', icon: Terminal },
      { id: 'logs' as PageType, label: 'Logs', icon: FileText },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'license' as PageType, label: 'License', icon: Key },
      { id: 'settings' as PageType, label: 'Settings', icon: Settings },
    ]
  }
]

export default function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavClick = (page: PageType) => {
    setCurrentPage(page)
    setMobileOpen(false)
  }

  const renderSectionIcon = (title: string) => {
    switch (title) {
      case 'Overview': return <Activity className="w-3.5 h-3.5" />
      case 'Framework': return <Layers className="w-3.5 h-3.5" />
      case 'Developer': return <Code2 className="w-3.5 h-3.5" />
      case 'System': return <Settings className="w-3.5 h-3.5" />
      default: return null
    }
  }

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-white/10 md:hidden backdrop-blur-xl"
      >
        <Menu className="w-5 h-5 text-[var(--text-primary)]" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-80 z-50 flex flex-col
          bg-[var(--bg-secondary)] border-r border-white/5
          transform transition-transform duration-300 ease-out
          md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center glow-blue">
                <Zap className="w-5.5 h-5.5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full status-healthy" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">ZBGym</h1>
              <div className="flex items-center gap-1.5">
                <span className="status-dot status-healthy" />
                <span className="text-xs text-[var(--accent-green)] font-medium">ONLINE</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-4">
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-[var(--text-tertiary)]">{renderSectionIcon(section.title)}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  {section.title}
                </span>
              </div>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-500/20 to-transparent text-blue-400 border-l-2 border-blue-500' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-blue-400' : ''}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-blue-400' : ''}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Version */}
        <div className="p-4 border-t border-white/5">
          <div className="px-3 py-2 rounded-lg bg-white/5">
            <p className="text-xs text-[var(--text-tertiary)]">Version 1.0.0</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">ZBGym Control Center</p>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden md:flex relative flex-col h-full transition-all duration-300 ease-out
          bg-[var(--bg-secondary)] border-r border-white/5
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center glow-blue">
              <Zap className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full status-healthy" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold tracking-tight">ZBGym</h1>
              <div className="flex items-center gap-1.5">
                <span className="status-dot status-healthy" />
                <span className="text-[11px] text-[var(--accent-green)] font-semibold uppercase tracking-wider">Online</span>
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-5">
              {!collapsed && (
                <div className="flex items-center gap-2 px-3 mb-2">
                  <span className="text-[var(--text-tertiary)]">{renderSectionIcon(section.title)}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    {section.title}
                  </span>
                </div>
              )}
              {collapsed && (
                <div className="section-divider mb-3" />
              )}
              
              <div className="space-y-0.5">
                {section.items.map((item) => {
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
                            ? 'bg-gradient-to-r from-blue-500/20 to-transparent text-blue-400' 
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                          }
                        `}
                      >
                        <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                        
                        {!collapsed && (
                          <span className={`text-sm font-medium ${isActive ? 'text-blue-400' : ''}`}>
                            {item.label}
                          </span>
                        )}
                        
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
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
            </div>
          ))}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-7 h-7 bg-[var(--bg-secondary)] border border-white/10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all duration-200 z-10"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Version */}
        {!collapsed && (
          <div className="p-4 border-t border-white/5">
            <div className="px-3 py-2 rounded-lg bg-white/[0.03]">
              <p className="text-xs text-[var(--text-tertiary)]">Version 1.0.0</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
