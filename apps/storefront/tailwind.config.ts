import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        // Brand palette — ultra-minimalist warm neutral
        brand: {
          50:  '#faf8f5',
          100: '#f4ede6',
          200: '#e8d9cc',
          300: '#d6beac',
          400: '#c09a80',
          500: '#a87d60',
          600: '#8c6348',
          700: '#714f39',
          800: '#5d4032',
          900: '#4c352b',
        },
        // Gold accent for wire transfer tier
        gold: {
          400: '#d4a853',
          500: '#c49a3a',
          600: '#a67c2a',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      typography: {
        stone: {
          css: {
            '--tw-prose-body':    '#44403c',
            '--tw-prose-headings':'#1c1917',
            '--tw-prose-links':   '#1c1917',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
