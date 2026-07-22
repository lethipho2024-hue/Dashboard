// Mock Data Service for ZBGym Dashboard

export const currentYear = new Date().getFullYear();
export const currentMonth = new Date().getMonth();
export const currentDay = new Date().getDate();

// System Stats
export const systemStats = {
  cpu: 67,
  gpu: 82,
  vram: 6.2,
  ram: 14.2,
  tick: 12847,
  runtime: '02:34:12',
  tps: 60,
  fps: 144,
}

// Framework Modules with Health Status
type ModuleStatus = 'healthy' | 'warning' | 'critical'

export const frameworkModules: Array<{ id: string; name: string; status: ModuleStatus; health: number; version: string; lastUpdate: string }> = [
  { id: 'engine', name: 'Engine', status: 'healthy', health: 100, version: '2.4.1', lastUpdate: '2026-07-20' },
  { id: 'physics', name: 'Physics', status: 'healthy', health: 98, version: '1.8.3', lastUpdate: '2026-07-19' },
  { id: 'replay', name: 'Replay', status: 'healthy', health: 95, version: '3.1.0', lastUpdate: '2026-07-18' },
  { id: 'trainer', name: 'Trainer', status: 'healthy', health: 100, version: '4.2.1', lastUpdate: '2026-07-21' },
  { id: 'dashboard', name: 'Dashboard', status: 'healthy', health: 100, version: '5.0.2', lastUpdate: '2026-07-22' },
  { id: 'ai-core', name: 'AI Core', status: 'warning', health: 87, version: '2.1.5', lastUpdate: '2026-07-15' },
  { id: 'metrics', name: 'Metrics', status: 'healthy', health: 92, version: '1.5.0', lastUpdate: '2026-07-17' },
  { id: 'plugins', name: 'Plugins', status: 'healthy', health: 99, version: '2.0.1', lastUpdate: '2026-07-22' },
];

// Calculate health counts from modules
export const healthCounts = {
  healthy: frameworkModules.filter(m => m.status === 'healthy').length,
  warning: frameworkModules.filter(m => m.status === 'warning').length,
  critical: frameworkModules.filter(m => m.status === 'critical').length,
};

// AI Agents
export const aiAgents = [
  { id: 1, name: 'Alpha Agent', status: 'active' as const, tasks: 24, model: 'GPT-4', uptime: '99.8%' },
  { id: 2, name: 'Beta Agent', status: 'active' as const, tasks: 18, model: 'Claude-3', uptime: '99.5%' },
  { id: 3, name: 'Gamma Agent', status: 'idle' as const, tasks: 0, model: 'GPT-3.5', uptime: '98.2%' },
  { id: 4, name: 'Delta Agent', status: 'active' as const, tasks: 12, model: 'PaLM-2', uptime: '99.9%' },
];

// Recent Activity
export const recentActivity = [
  { id: 1, action: 'Framework initialized', time: '2m ago', type: 'success' as const },
  { id: 2, action: 'AI Agent completed task', time: '5m ago', type: 'info' as const },
  { id: 3, action: 'Memory optimization', time: '10m ago', type: 'info' as const },
  { id: 4, action: 'Module loaded: Physics', time: '15m ago', type: 'success' as const },
  { id: 5, action: 'High memory warning', time: '20m ago', type: 'warning' as const },
];

// Notifications
export const notifications = [
  { id: 1, type: 'info' as const, message: 'Framework initialized successfully', time: '2m ago' },
  { id: 2, type: 'warning' as const, message: 'High memory usage detected', time: '5m ago' },
  { id: 3, type: 'success' as const, message: 'AI Agent completed task', time: '10m ago' },
];

// License Info
export const licenseInfo = {
  key: 'ZBGM-PRO-2026-XXXX-XXXX-XXXX',
  type: 'Pro',
  seats: 5,
  usedSeats: 3,
  expiryDate: `${currentYear + 1}-06-30`,
  activationDate: `${currentYear - 1}-07-15`,
  support: 'Premium',
  autoRenew: true,
}

// Activation History
export const activationHistory = [
  { date: `${currentYear}-06-15`, event: 'License renewed', device: 'MacBook Pro (Primary)', status: 'Active' },
  { date: `${currentYear}-03-20`, event: 'Device activated', device: 'Windows Desktop', status: 'Active' },
  { date: `${currentYear}-01-10`, event: 'Device revoked', device: 'iPad Pro (Secondary)', status: 'Revoked' },
];

// Plugin Categories
export const pluginCategories = [
  { id: 'visual', name: 'Visual', count: 12, active: 5 },
  { id: 'physics', name: 'Physics', count: 8, active: 3 },
  { id: 'ai', name: 'AI', count: 15, active: 7 },
  { id: 'network', name: 'Network', count: 6, active: 2 },
];

// Default Settings
export const defaultSettings = {
  dashboardRefreshRate: '10 seconds',
  autoSaveSettings: true,
  startMinimized: false,
  theme: 'dark',
  accentColor: '#3B82F6',
  animations: true,
  compactMode: false,
  hardwareAcceleration: true,
  frameLimit: '120 FPS',
  memoryLimit: 16,
  notifications: {
    systemAlerts: true,
    trainingUpdates: true,
    aiAgentEvents: true,
    errorNotifications: true,
  },
  language: 'English',
  timeZone: 'UTC+7 (Asia/Ho_Chi_Minh)',
  dateFormat: 'DD/MM/YYYY',
  developerMode: false,
  debugLogging: false,
  logLevel: 'INFO',
  apiEndpoint: 'http://localhost:8080',
};

// Load settings from localStorage or return defaults
export function loadSettings() {
  try {
    const saved = localStorage.getItem('zbgym-settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
}

// Save settings to localStorage
export function saveSettings(settings: typeof defaultSettings) {
  try {
    localStorage.setItem('zbgym-settings', JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
}

// Metrics Data
export const metricsData = {
  episodesCompleted: 1247,
  totalSteps: 5842930,
  avgReward: 0.847,
  successRate: 92.3,
  peakTPS: 120,
  avgLatency: 12.5,
}

// Training Sessions
export const trainingSessions = [
  { id: 1, name: 'AlphaGo v3', status: 'running' as const, progress: 67, episodes: 892, eta: '2h 15m' },
  { id: 2, name: 'BotArena Match', status: 'completed' as const, progress: 100, episodes: 1500, eta: '0m' },
  { id: 3, name: 'SelfPlay Training', status: 'queued' as const, progress: 0, episodes: 0, eta: 'Pending' },
];

// Replay Sessions
export const replaySessions = [
  { id: 1, name: 'Match vs Alpha', duration: '15:32', date: '2026-07-21', result: 'win' as const },
  { id: 2, name: 'Tournament Final', duration: '28:45', date: '2026-07-20', result: 'loss' as const },
  { id: 3, name: 'Practice Session', duration: '08:15', date: '2026-07-19', result: 'win' as const },
];
