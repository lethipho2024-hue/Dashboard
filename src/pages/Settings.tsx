import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Palette, Gauge, Bell, Globe, Code, Save, Check } from 'lucide-react'
import { loadSettings, saveSettings } from '../services/mock'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [showSaved, setShowSaved] = useState(false)
  
  // General Settings
  const [dashboardRefreshRate, setDashboardRefreshRate] = useState('10 seconds')
  const [autoSaveSettings, setAutoSaveSettings] = useState(true)
  const [startMinimized, setStartMinimized] = useState(false)
  
  // Appearance Settings
  const [theme, setTheme] = useState('dark')
  const [accentColor, setAccentColor] = useState('#3B82F6')
  const [animations, setAnimations] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  
  // Performance Settings
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true)
  const [frameLimit, setFrameLimit] = useState('120 FPS')
  const [memoryLimit, setMemoryLimit] = useState(16)
  
  // Notification Settings
  const [systemAlerts, setSystemAlerts] = useState(true)
  const [trainingUpdates, setTrainingUpdates] = useState(true)
  const [aiAgentEvents, setAiAgentEvents] = useState(true)
  const [errorNotifications, setErrorNotifications] = useState(true)
  
  // Language Settings
  const [language, setLanguage] = useState('English')
  const [timeZone, setTimeZone] = useState('UTC+7 (Asia/Ho_Chi_Minh)')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  
  // Developer Settings
  const [developerMode, setDeveloperMode] = useState(false)
  const [debugLogging, setDebugLogging] = useState(false)
  const [logLevel, setLogLevel] = useState('INFO')
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8080')
  const [showApiInput, setShowApiInput] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings()
    setDashboardRefreshRate(settings.dashboardRefreshRate)
    setAutoSaveSettings(settings.autoSaveSettings)
    setStartMinimized(settings.startMinimized)
    setTheme(settings.theme)
    setAccentColor(settings.accentColor)
    setAnimations(settings.animations)
    setCompactMode(settings.compactMode)
    setHardwareAcceleration(settings.hardwareAcceleration)
    setFrameLimit(settings.frameLimit)
    setMemoryLimit(settings.memoryLimit)
    setSystemAlerts(settings.notifications.systemAlerts)
    setTrainingUpdates(settings.notifications.trainingUpdates)
    setAiAgentEvents(settings.notifications.aiAgentEvents)
    setErrorNotifications(settings.notifications.errorNotifications)
    setLanguage(settings.language)
    setTimeZone(settings.timeZone)
    setDateFormat(settings.dateFormat)
    setDeveloperMode(settings.developerMode)
    setDebugLogging(settings.debugLogging)
    setLogLevel(settings.logLevel)
    setApiEndpoint(settings.apiEndpoint)
  }, [])

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'performance', label: 'Performance', icon: Gauge },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'developer', label: 'Developer', icon: Code },
  ]

  const handleSave = () => {
    const settings = {
      dashboardRefreshRate,
      autoSaveSettings,
      startMinimized,
      theme,
      accentColor,
      animations,
      compactMode,
      hardwareAcceleration,
      frameLimit,
      memoryLimit,
      notifications: {
        systemAlerts,
        trainingUpdates,
        aiAgentEvents,
        errorNotifications,
      },
      language,
      timeZone,
      dateFormat,
      developerMode,
      debugLogging,
      logLevel,
      apiEndpoint,
    }
    
    if (saveSettings(settings)) {
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    if (newTheme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-blue-500' : 'bg-white/20'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
          checked ? 'right-1' : 'left-1'
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1">Configure your ZBGym Control Center</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="card p-2">
            <div className="flex md:block gap-1 overflow-x-auto md:overflow-visible">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">General Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Dashboard Refresh Rate</p>
                    <p className="text-sm text-[var(--text-secondary)]">How often to update dashboard metrics</p>
                  </div>
                  <select
                    value={dashboardRefreshRate}
                    onChange={(e) => setDashboardRefreshRate(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-primary)]"
                  >
                    <option value="1 second">1 second</option>
                    <option value="5 seconds">5 seconds</option>
                    <option value="10 seconds">10 seconds</option>
                    <option value="30 seconds">30 seconds</option>
                    <option value="1 minute">1 minute</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Auto-save Settings</p>
                    <p className="text-sm text-[var(--text-secondary)]">Automatically save changes</p>
                  </div>
                  <Toggle checked={autoSaveSettings} onChange={() => setAutoSaveSettings(!autoSaveSettings)} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Start Minimized</p>
                    <p className="text-sm text-[var(--text-secondary)]">Start application minimized to tray</p>
                  </div>
                  <Toggle checked={startMinimized} onChange={() => setStartMinimized(!startMinimized)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[var(--text-primary)] font-medium mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-4">
                    {['dark', 'light', 'system'].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleThemeChange(t)}
                        className={`p-4 rounded-xl border transition-all ${
                          theme === t
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                          t === 'dark' ? 'bg-gray-800' : t === 'light' ? 'bg-gray-200' : 'bg-gradient-to-r from-gray-800 to-gray-200'
                        }`} />
                        <span className="text-sm text-[var(--text-primary)] capitalize">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[var(--text-primary)] font-medium mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                          accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-primary)]' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Animations</p>
                    <p className="text-sm text-[var(--text-secondary)]">Enable smooth animations</p>
                  </div>
                  <Toggle checked={animations} onChange={() => setAnimations(!animations)} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Compact Mode</p>
                    <p className="text-sm text-[var(--text-secondary)]">Reduce spacing and padding</p>
                  </div>
                  <Toggle checked={compactMode} onChange={() => setCompactMode(!compactMode)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Performance</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Hardware Acceleration</p>
                    <p className="text-sm text-[var(--text-secondary)]">Use GPU for rendering</p>
                  </div>
                  <Toggle checked={hardwareAcceleration} onChange={() => setHardwareAcceleration(!hardwareAcceleration)} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Frame Limit</p>
                    <p className="text-sm text-[var(--text-secondary)]">Maximum FPS for UI</p>
                  </div>
                  <select
                    value={frameLimit}
                    onChange={(e) => setFrameLimit(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-primary)]"
                  >
                    <option value="30 FPS">30 FPS</option>
                    <option value="60 FPS">60 FPS</option>
                    <option value="120 FPS">120 FPS</option>
                    <option value="Unlimited">Unlimited</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[var(--text-primary)] font-medium">Memory Limit</p>
                    <span className="text-[var(--text-secondary)]">{memoryLimit} GB</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">System Alerts</p>
                    <p className="text-sm text-[var(--text-secondary)]">Critical system notifications</p>
                  </div>
                  <Toggle checked={systemAlerts} onChange={() => setSystemAlerts(!systemAlerts)} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Training Updates</p>
                    <p className="text-sm text-[var(--text-secondary)]">Episode completion, checkpoints</p>
                  </div>
                  <Toggle checked={trainingUpdates} onChange={() => setTrainingUpdates(!trainingUpdates)} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">AI Agent Events</p>
                    <p className="text-sm text-[var(--text-secondary)]">Agent task updates</p>
                  </div>
                  <Toggle checked={aiAgentEvents} onChange={() => setAiAgentEvents(!aiAgentEvents)} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Error Notifications</p>
                    <p className="text-sm text-[var(--text-secondary)]">Error and warning alerts</p>
                  </div>
                  <Toggle checked={errorNotifications} onChange={() => setErrorNotifications(!errorNotifications)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Language & Region</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Language</p>
                    <p className="text-sm text-[var(--text-secondary)]">Interface display language</p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-primary)]"
                  >
                    <option value="English">English</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="中文">中文</option>
                    <option value="日本語">日本語</option>
                    <option value="한국어">한국어</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Time Zone</p>
                    <p className="text-sm text-[var(--text-secondary)]">Auto-detect from system</p>
                  </div>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-primary)]"
                  >
                    <option value="UTC+7 (Asia/Ho_Chi_Minh)">UTC+7 (Asia/Ho_Chi_Minh)</option>
                    <option value="UTC+8 (Asia/Shanghai)">UTC+8 (Asia/Shanghai)</option>
                    <option value="UTC (UTC)">UTC (UTC)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Date Format</p>
                    <p className="text-sm text-[var(--text-secondary)]">How dates are displayed</p>
                  </div>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-primary)]"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Developer Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Developer Mode</p>
                    <p className="text-sm text-[var(--text-secondary)]">Enable advanced debugging tools</p>
                  </div>
                  <Toggle checked={developerMode} onChange={() => setDeveloperMode(!developerMode)} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Debug Logging</p>
                    <p className="text-sm text-[var(--text-secondary)]">Verbose logging for troubleshooting</p>
                  </div>
                  <Toggle checked={debugLogging} onChange={() => setDebugLogging(!debugLogging)} />
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-[var(--text-primary)] font-medium mb-3">Log Level</p>
                  <div className="flex gap-2">
                    {['DEBUG', 'INFO', 'WARN', 'ERROR'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setLogLevel(level)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          logLevel === level
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-[var(--text-secondary)] hover:bg-white/20'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">API Endpoint</p>
                    {showApiInput ? (
                      <input
                        type="text"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-white/10 text-[var(--text-primary)] text-sm"
                        autoFocus
                        onBlur={() => setShowApiInput(false)}
                      />
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)] font-mono">{apiEndpoint}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowApiInput(true)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-colors text-sm"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 mb-20 lg:mb-0 flex justify-end relative">
            <button
              onClick={handleSave}
              className="btn btn-primary flex items-center gap-2 px-6 py-3"
            >
              {showSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Đã lưu!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
