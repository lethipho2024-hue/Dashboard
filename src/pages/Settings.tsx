import { useState } from 'react'
import { Settings as SettingsIcon, Palette, Gauge, Bell, Globe, Code, Save } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'performance', label: 'Performance', icon: Gauge },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'developer', label: 'Developer', icon: Code },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Configure your ZBGym Control Center</p>
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap flex-shrink-0 md:flex-shrink ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
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
              <h3 className="text-lg font-semibold text-text-primary">General Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Dashboard Refresh Rate</p>
                    <p className="text-sm text-text-secondary">How often to update dashboard metrics</p>
                  </div>
                  <select className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-text-primary">
                    <option>1 second</option>
                    <option>5 seconds</option>
                    <option selected>10 seconds</option>
                    <option>30 seconds</option>
                    <option>1 minute</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Auto-save Settings</p>
                    <p className="text-sm text-text-secondary">Automatically save changes</p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-blue-500">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-all" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Start Minimized</p>
                    <p className="text-sm text-text-secondary">Start application minimized to tray</p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-white/20">
                    <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Appearance</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-text-primary font-medium mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-4">
                    {['Dark', 'Light', 'System'].map((theme) => (
                      <button
                        key={theme}
                        className={`p-4 rounded-xl border transition-all ${
                          theme === 'Dark'
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                          theme === 'Dark' ? 'bg-gray-800' : theme === 'Light' ? 'bg-gray-200' : 'bg-gradient-to-r from-gray-800 to-gray-200'
                        }`} />
                        <span className="text-sm text-text-primary">{theme}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-text-primary font-medium mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444'].map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                          color === '#3B82F6' ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-primary' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Animations</p>
                    <p className="text-sm text-text-secondary">Enable smooth animations</p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-blue-500">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-all" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Compact Mode</p>
                    <p className="text-sm text-text-secondary">Reduce spacing and padding</p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-white/20">
                    <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Performance</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Hardware Acceleration</p>
                    <p className="text-sm text-text-secondary">Use GPU for rendering</p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-blue-500">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-all" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Frame Limit</p>
                    <p className="text-sm text-text-secondary">Maximum FPS for UI</p>
                  </div>
                  <select className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-text-primary">
                    <option>30 FPS</option>
                    <option>60 FPS</option>
                    <option selected>120 FPS</option>
                    <option>Unlimited</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-text-primary font-medium">Memory Limit</p>
                    <span className="text-text-secondary">16 GB</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value="16"
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
              
              <div className="space-y-4">
                {[
                  { name: 'System Alerts', desc: 'Critical system notifications' },
                  { name: 'Training Updates', desc: 'Episode completion, checkpoints' },
                  { name: 'AI Agent Events', desc: 'Agent task updates' },
                  { name: 'Error Notifications', desc: 'Error and warning alerts' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="text-text-primary font-medium">{item.name}</p>
                      <p className="text-sm text-text-secondary">{item.desc}</p>
                    </div>
                    <button className="relative w-12 h-6 rounded-full bg-blue-500">
                      <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-all" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Language & Region</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Language</p>
                    <p className="text-sm text-text-secondary">Interface display language</p>
                  </div>
                  <select className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-text-primary">
                    <option selected>English</option>
                    <option>Tiếng Việt</option>
                    <option>中文</option>
                    <option>日本語</option>
                    <option>한국어</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Time Zone</p>
                    <p className="text-sm text-text-secondary">Auto-detect from system</p>
                  </div>
                  <select className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-text-primary">
                    <option selected>UTC+7 (Asia/Ho_Chi_Minh)</option>
                    <option>UTC+8 (Asia/Shanghai)</option>
                    <option>UTC (UTC)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Date Format</p>
                    <p className="text-sm text-text-secondary">How dates are displayed</p>
                  </div>
                  <select className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-text-primary">
                    <option selected>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Developer Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Developer Mode</p>
                    <p className="text-sm text-text-secondary">Enable advanced debugging tools</p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-white/20">
                    <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">Debug Logging</p>
                    <p className="text-sm text-text-secondary">Verbose logging for troubleshooting</p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-white/20">
                    <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-all" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-text-primary font-medium mb-3">Log Level</p>
                  <div className="flex gap-2">
                    {['DEBUG', 'INFO', 'WARN', 'ERROR'].map((level) => (
                      <button
                        key={level}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          level === 'INFO'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-text-secondary hover:bg-white/20'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-text-primary font-medium">API Endpoint</p>
                    <p className="text-sm text-text-secondary font-mono">http://localhost:8080</p>
                  </div>
                  <button className="btn btn-secondary">Change</button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button className="btn btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
