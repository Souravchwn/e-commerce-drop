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
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['Menlo', 'Consolas', '"Courier New"', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body':     '#000000',
            '--tw-prose-headings': '#000000',
            '--tw-prose-links':    '#000000',
            fontSize:   '13px',
            lineHeight: '1.55',
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
