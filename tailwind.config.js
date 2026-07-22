/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': '#090C12',
        'bg-secondary': '#121722',
        'panel': 'rgba(255,255,255,0.04)',
        'border-custom': 'rgba(255,255,255,0.08)',
        'accent': '#3B82F6',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'purple': '#8B5CF6',
        'text-primary': '#F3F4F6',
        'text-secondary': '#9CA3AF',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
