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
        soc: {
          darkest: '#030712',
          darker: '#090d16',
          card: '#0f172a',
          cardBorder: '#1e293b',
          accent: '#06b6d4',
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#10b981',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'glow-border': 'glowBorder 3s ease infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.2))' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowBorder: {
          '0%, 100%': { borderColor: 'rgba(6, 182, 212, 0.4)' },
          '50%': { borderColor: 'rgba(239, 68, 68, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
