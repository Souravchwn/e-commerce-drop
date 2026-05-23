'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TimeLeft {
  days:    number
  hours:   number
  minutes: number
  seconds: number
}

interface DropCountdownProps {
  dropDate:  string   // ISO 8601 UTC datetime string from Sanity
  productId: string
  onAddToCart: (productId: string) => void
}

function computeTimeLeft(dropDate: string): TimeLeft | null {
  const delta = new Date(dropDate).getTime() - Date.now()
  if (delta <= 0) return null
  return {
    days:    Math.floor(delta / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((delta / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((delta / 1000 / 60) % 60),
    seconds: Math.floor((delta / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function DropCountdown({ dropDate, productId, onAddToCart }: DropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => computeTimeLeft(dropDate))
  const [isLive, setIsLive]     = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    const remaining = computeTimeLeft(dropDate)
    if (remaining === null) {
      // Exact millisecond the clock hits zero — no page refresh needed
      if (intervalRef.current) clearInterval(intervalRef.current)
      setTimeLeft(null)
      setIsLive(true)
    } else {
      setTimeLeft(remaining)
    }
  }, [dropDate])

  useEffect(() => {
    // If drop is already past on first render, go live immediately
    if (computeTimeLeft(dropDate) === null) {
      setIsLive(true)
      return
    }
    intervalRef.current = setInterval(tick, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [dropDate, tick])

  if (isLive) {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400">
          Drop is Live
        </p>
        <button
          onClick={() => onAddToCart(productId)}
          className="w-full max-w-sm bg-stone-900 text-white text-sm tracking-widest uppercase
                     py-4 px-8 hover:bg-stone-700 transition-colors duration-200
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-900"
        >
          Add to Cart →
        </button>
      </div>
    )
  }

  if (!timeLeft) return null

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Clock */}
      <div className="flex items-start gap-3 sm:gap-5" aria-live="polite" aria-atomic="true">
        {[
          { value: timeLeft.days,    label: 'Days'    },
          { value: timeLeft.hours,   label: 'Hours'   },
          { value: timeLeft.minutes, label: 'Min'     },
          { value: timeLeft.seconds, label: 'Sec'     },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-start gap-3 sm:gap-5">
            <div className="flex flex-col items-center">
              <span className="font-mono text-4xl sm:text-5xl font-light tabular-nums text-stone-900 leading-none">
                {pad(value)}
              </span>
              <span className="mt-2 text-[10px] tracking-[0.25em] uppercase text-stone-400">
                {label}
              </span>
            </div>
            {i < 3 && (
              <span className="font-mono text-4xl sm:text-5xl font-light text-stone-300 leading-none select-none">
                :
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Disabled button */}
      <button
        disabled
        aria-disabled="true"
        className="w-full max-w-sm bg-stone-100 text-stone-400 text-sm tracking-widest uppercase
                   py-4 px-8 cursor-not-allowed select-none"
      >
        Coming Soon
      </button>
    </div>
  )
}
