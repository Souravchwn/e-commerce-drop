'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  // SSR renders dark=false (moon). After mount, useEffect reads the actual class.
  // This two-pass approach avoids hydration mismatches while staying in sync with
  // the inline <script> in layout.tsx that sets the dark class before React hydrates.
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setDark(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="h-11 w-10 flex items-center justify-center text-s-muted hover:text-s-fg transition-colors duration-100"
    >
      {dark ? (
        /* Sun */
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          {[0,45,90,135,180,225,270,315].map((deg) => {
            const r = Math.PI * deg / 180
            const x1 = 8 + 5.5 * Math.cos(r), y1 = 8 + 5.5 * Math.sin(r)
            const x2 = 8 + 7   * Math.cos(r), y2 = 8 + 7   * Math.sin(r)
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          })}
        </svg>
      ) : (
        /* Moon */
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
