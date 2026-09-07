import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wind: {
          bg: 'rgb(var(--wind-bg) / <alpha-value>)',
          surface: 'rgb(var(--wind-surface) / <alpha-value>)',
          surface2: 'rgb(var(--wind-surface-2) / <alpha-value>)',
          border: 'rgb(var(--wind-border) / <alpha-value>)',
          text: 'rgb(var(--wind-text) / <alpha-value>)',
          muted: 'rgb(var(--wind-muted) / <alpha-value>)',
          accent: 'rgb(var(--wind-accent) / <alpha-value>)',
          accentHover: 'rgb(var(--wind-accent-hover) / <alpha-value>)',
          accentSoft: 'rgb(var(--wind-accent-soft) / <alpha-value>)',
          danger: 'rgb(var(--wind-danger) / <alpha-value>)'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%,80%,100%': { opacity: '0.3' }, '40%': { opacity: '1' } }
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        pulseDot: 'pulseDot 1.4s infinite ease-in-out'
      }
    }
  },
  plugins: []
};

export default config;
