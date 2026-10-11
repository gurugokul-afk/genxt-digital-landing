/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070709',
        card: {
          DEFAULT: '#0e0e13',
          hover: '#13131a',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        genxt: {
          purple: '#6452f6',
          purpleHover: '#5240eb',
          purpleLight: '#8c7dff',
          neon: '#7862ff',
          accent: '#9d8eff',
          darkBg: '#050508',
          subtle: '#9496a1'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 20px -5px rgba(100, 82, 246, 0.3)',
        'glow': '0 0 35px -5px rgba(100, 82, 246, 0.45)',
        'glow-lg': '0 0 50px -5px rgba(100, 82, 246, 0.6)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
