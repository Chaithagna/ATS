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
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        glow: {
          cyan: 'var(--glow-cyan)',
          indigo: 'var(--glow-indigo)',
          violet: 'var(--glow-violet)'
        },
        cyber: {
          cyan: 'var(--color-cyber-cyan)',
          indigo: 'var(--color-cyber-indigo)',
          violet: 'var(--color-cyber-violet)',
          rose: 'var(--color-cyber-rose)'
        }
      },
      boxShadow: {
        'glass-sm': '0 4px 12px 0 rgba(0, 0, 0, 0.25)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-cyan': '0 0 15px var(--glow-cyan-shadow)',
        'glow-indigo': '0 0 15px var(--glow-indigo-shadow)'
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
