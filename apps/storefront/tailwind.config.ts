import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* CSS-variable–backed tokens — flip between light/dark via .dark class */
        s: {
          bg:       'var(--bg)',
          'bg-sub': 'var(--bg-sub)',
          fg:       'var(--fg)',
          muted:    'var(--muted)',
          border:   'var(--border)',
          red:      'var(--red)',
          card:     'var(--card)',
        },
        /* Fixed brand tokens (never invert) */
        sup: {
          red:   '#E8112D',
          black: '#000000',
          white: '#FFFFFF',
        },
        /* Keep gallery-* for payment components */
        gallery: {
          black:       '#0A0A0A',
          surface:     '#111111',
          'surface-2': '#181614',
          border:      '#232320',
          'border-w':  '#2D2A26',
          gold:        '#C9A96E',
          'gold-lt':   '#E8D5A3',
          cream:       '#F5EFE0',
          ivory:       '#EDE8DC',
          muted:       '#7A7570',
          'muted-2':   '#3E3B38',
          red:         '#B84040',
        },
      },
      fontFamily: {
        sans:    ['var(--font-inter)', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['var(--font-inter)', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono:    ['"Courier New"', 'Courier', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
        xs:    ['11px', { lineHeight: '1.4' }],
        sm:    ['12px', { lineHeight: '1.5' }],
        base:  ['13px', { lineHeight: '1.5' }],
        md:    ['14px', { lineHeight: '1.5' }],
        lg:    ['16px', { lineHeight: '1.4' }],
        xl:    ['18px', { lineHeight: '1.3' }],
        '2xl': ['22px', { lineHeight: '1.2' }],
        '3xl': ['28px', { lineHeight: '1.1' }],
        '4xl': ['36px', { lineHeight: '1.05' }],
        '5xl': ['48px', { lineHeight: '1' }],
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        marquee:     'marquee 40s linear infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body':     'var(--muted)',
            '--tw-prose-headings': 'var(--fg)',
            '--tw-prose-links':    'var(--fg)',
            '--tw-prose-bold':     'var(--fg)',
            '--tw-prose-bullets':  'var(--border)',
            fontSize:   '13px',
            lineHeight: '1.6',
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
