import { buildLegacyTheme } from 'sanity'

/** Dark luxury theme — matches the Galeriaxolo storefront dark mode.
 *  Using `as Parameters<...>[0]` because the LegacyThemeProps type varies
 *  across minor Sanity v3 releases while the runtime tokens are stable. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThemeTokens = Record<string, string>

export const studioTheme = buildLegacyTheme({
  '--base-bg':       '#0D0D0D',
  '--base-fg':       '#FFFFFF',
  '--base-border':   '#2C2C2C',
  '--base-shadow-sm': '0 1px 3px rgba(0,0,0,0.6)',
  '--base-shadow-md': '0 4px 20px rgba(0,0,0,0.8)',
  '--brand-primary': '#E8112D',
  '--component-bg':         '#141414',
  '--component-text-color': '#FFFFFF',
  '--default-button-color':         '#2C2C2C',
  '--default-button-primary-color': '#E8112D',
  '--default-button-success-color': '#22c55e',
  '--default-button-warning-color': '#f59e0b',
  '--default-button-danger-color':  '#E8112D',
  '--state-info-color':    '#60a5fa',
  '--state-success-color': '#22c55e',
  '--state-warning-color': '#f59e0b',
  '--state-danger-color':  '#E8112D',
  '--main-navigation-color':           '#0D0D0D',
  '--main-navigation-color--inverted': '#FFFFFF',
  '--focus-ring-color': '#E8112D',
} as ThemeTokens as Parameters<typeof buildLegacyTheme>[0])
