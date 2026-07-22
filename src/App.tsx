import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { 
  ConnectionProvider, 
  FrameworkProvider, 
  KernelProvider, 
  MetricsProvider,
  HealthProvider,
  EventsProvider,
  LogsProvider,
  ReplayProvider,
  TrainerProvider,
  PluginsProvider,
  AIProvider,
  NotificationsProvider,
  ToastContainer
} from './store'
import { getDashboardWs } from './services/websocket'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import RightPanel from './components/RightPanel'
import ConnectionStatus from './components/ConnectionStatus'
import DevDebugPanel from './components/DevDebugPanel'
import HomeDashboard from './pages/HomeDashboard'
import FrameworkHealth from './pages/FrameworkHealth'
import Kernel from './pages/Kernel'
import ModuleManager from './pages/ModuleManager'
import AICenter from './pages/AICenter'
import Metrics from './pages/Metrics'
import Trainer from './pages/Trainer'
import Replay from './pages/Replay'
import EventConsole from './pages/EventConsole'
import Logs from './pages/Logs'
import Plugins from './pages/Plugins'
import License from './pages/License'
import Settings from './pages/Settings'

type PageType = 'dashboard' | 'kernel' | 'health' | 'modules' | 'ai' | 'trainer' | 'replay' | 'metrics' | 'console' | 'logs' | 'plugins' | 'license' | 'settings'

// Initialize WebSocket connection
const ws = getDashboardWs({ autoConnect: true })

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showDevPanel, setShowDevPanel] = useState(false)

  // Toggle dev panel with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setShowDevPanel(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <HomeDashboard />
      case 'kernel': return <Kernel />
      case 'health': return <FrameworkHealth />
      case 'modules': return <ModuleManager />
      case 'ai': return <AICenter />
      case 'metrics': return <Metrics />
      case 'trainer': return <Trainer />
      case 'replay': return <Replay />
      case 'console': return <EventConsole />
      case 'logs': return <Logs />
      case 'plugins': return <Plugins />
      case 'license': return <License />
      case 'settings': return <Settings />
      default: return <HomeDashboard />
    }
  }

  return (
    <ThemeProvider>
      <NotificationsProvider>
        <ConnectionProvider>
          <FrameworkProvider>
            <KernelProvider>
              <MetricsProvider>
                <HealthProvider>
                  <EventsProvider>
                    <LogsProvider>
                      <ReplayProvider>
                        <TrainerProvider>
                          <PluginsProvider>
                            <AIProvider>
                              <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden transition-colors duration-300">
                                {/* Left Sidebar */}
                                <Sidebar 
                                  currentPage={currentPage} 
                                  setCurrentPage={setCurrentPage}
                                  collapsed={sidebarCollapsed}
                                  setCollapsed={setSidebarCollapsed}
                                />
                                
                                {/* Main Content Area */}
                                <div className="flex-1 flex flex-col min-w-0">
                                  {/* Top Navigation */}
                                  <TopNav 
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    showSearch={showSearch}
                                    setShowSearch={setShowSearch}
                                  />
                                  
                                  {/* Main Workspace */}
                                  <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
                                    <div className="animate-fade-in">
                                      {renderPage()}
                                    </div>
                                  </main>
                                </div>
                                
                                {/* Right Panel */}
                                <RightPanel />
                                
                                {/* Search Modal */}
                                {showSearch && (
                                  <div 
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
                                    onClick={() => setShowSearch(false)}
                                  >
                                    <div 
                                      className="w-full max-w-2xl glass rounded-2xl p-4 animate-fade-in"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                        <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                          type="text"
                                          placeholder="Search modules, settings, logs..."
                                          className="flex-1 bg-transparent text-text-primary placeholder-text-secondary outline-none text-lg"
                                          autoFocus
                                        />
                                        <kbd className="px-2 py-1 text-xs text-text-secondary bg-white/5 rounded">ESC</kbd>
                                      </div>
                                      <div className="py-4 text-text-secondary text-center">
                                        Type to search across all modules, settings, and logs
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Toast Notifications */}
                                <ToastContainer />
                                
                                {/* Developer Debug Panel */}
                                <DevDebugPanel 
                                  isOpen={showDevPanel} 
                                  onClose={() => setShowDevPanel(false)} 
                                />
                              </div>
                            </AIProvider>
                          </PluginsProvider>
                        </TrainerProvider>
                      </ReplayProvider>
                    </LogsProvider>
                  </EventsProvider>
                </HealthProvider>
              </MetricsProvider>
            </KernelProvider>
          </FrameworkProvider>
        </ConnectionProvider>
      </NotificationsProvider>
    </ThemeProvider>
  )
}

export default App
