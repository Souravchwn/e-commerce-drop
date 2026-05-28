'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-[#d4d4d4] flex items-center px-4">
        <Link
          href="/"
          className="text-[13px] font-bold uppercase tracking-[0.04em] text-black"
        >
          Galeriaxolo.com
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-0 ml-auto">
          <Link
            href="/"
            className="h-12 flex items-center px-5 text-[11px] uppercase tracking-[0.1em] text-black border-l border-[#d4d4d4] hover:bg-[#f5f5f5] transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/cart"
            className="h-12 flex items-center px-5 text-[11px] uppercase tracking-[0.1em] text-black border-l border-[#d4d4d4] hover:bg-[#f5f5f5] transition-colors"
          >
            Cart
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden ml-auto flex flex-col justify-center gap-[5px] p-2 -mr-2"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <span className="block w-[22px] h-px bg-black" />
          <span className="block w-[22px] h-px bg-black" />
          <span className="block w-[22px] h-px bg-black" />
        </button>
      </header>

      {/* Mobile full-screen overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Overlay header row */}
          <div className="h-12 flex items-center justify-between px-4 border-b border-[#d4d4d4]">
            <Link
              href="/"
              className="text-[13px] font-bold uppercase tracking-[0.04em]"
              onClick={() => setOpen(false)}
            >
              Galeriaxolo.com
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="text-[11px] uppercase tracking-[0.1em] py-2 pl-4"
              aria-label="Close navigation"
            >
              Close
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col border-b border-[#d4d4d4]">
            <Link
              href="/"
              className="px-4 py-5 text-[20px] uppercase tracking-[0.04em] border-b border-[#d4d4d4] hover:bg-[#f5f5f5] transition-colors"
              onClick={() => setOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/cart"
              className="px-4 py-5 text-[20px] uppercase tracking-[0.04em] hover:bg-[#f5f5f5] transition-colors"
              onClick={() => setOpen(false)}
            >
              Cart
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
