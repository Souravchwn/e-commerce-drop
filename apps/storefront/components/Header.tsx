'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

const NAV = [
  { href: '/',         label: 'Shop'     },
  { href: '/previews', label: 'Previews' },
  { href: '/cart',     label: 'Cart'     },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Main header: 44px, white/dark bg ─────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-11 bg-s-bg border-b border-s-border flex items-center">

        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 px-4 h-full flex items-center"
          aria-label="Galeriaxolo — home"
        >
          <span className="text-s-red font-black text-[15px] tracking-tight uppercase leading-none select-none">
            Galeriaxolo
          </span>
        </Link>

        {/* Desktop nav — centered */}
        <nav className="hidden md:flex items-center gap-0 ml-6" aria-label="Main navigation">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="h-11 flex items-center px-4 text-xs text-s-muted hover:text-s-fg transition-colors duration-100 whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center">
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            className="md:hidden h-11 w-11 flex flex-col items-center justify-center gap-[5px]"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-[18px] h-px bg-s-fg" />
            <span className="block w-[18px] h-px bg-s-fg" />
            <span className="block w-[12px] h-px bg-s-fg self-start ml-[3px]" />
          </button>
        </div>
      </header>

      {/* ── Mobile menu overlay ───────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-s-bg flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Top bar */}
          <div className="h-11 flex items-center justify-between px-4 border-b border-s-border flex-shrink-0">
            <Link
              href="/"
              className="text-s-red font-black text-[15px] tracking-tight uppercase"
              onClick={() => setOpen(false)}
            >
              Galeriaxolo
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-s-muted hover:text-s-fg transition-colors"
              aria-label="Close menu"
            >
              Close
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col divide-y divide-s-border">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-5 text-2xl font-bold uppercase tracking-wide text-s-fg hover:text-s-red transition-colors"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
