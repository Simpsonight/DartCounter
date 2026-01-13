import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Dart board theme colors
        'dart-green': '#00a651',
        'dart-red': '#e21e25',
        'dart-black': '#1a1a1a',
        'dart-cream': '#f5f1e8',
        'dart-gold': '#d4af37',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49'
        }
      },
      spacing: {
        // Touch-friendly spacing (minimum 44px for touch targets)
        'touch': '44px',
        'touch-lg': '56px'
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'score': ['4rem', { lineHeight: '1', fontWeight: '700' }],
        'score-sm': ['2.5rem', { lineHeight: '1', fontWeight: '700' }]
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 1s ease-in-out infinite'
      },
      boxShadow: {
        'inner-lg': 'inset 0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.5)'
      }
    }
  },
  plugins: []
}
