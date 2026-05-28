'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TimeLeft {
  days:    number
  hours:   number
  minutes: number
  seconds: number
}

interface DropCountdownProps {
  dropDate:    string   // ISO 8601 UTC datetime string from Sanity
  productId:   string
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
  const [isLive,   setIsLive]   = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    const remaining = computeTimeLeft(dropDate)
    if (remaining === null) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setTimeLeft(null)
      setIsLive(true)
    } else {
      setTimeLeft(remaining)
    }
  }, [dropDate])

  useEffect(() => {
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
      <button
        onClick={() => onAddToCart(productId)}
        className="w-full bg-black text-white text-[11px] tracking-[0.15em] uppercase py-5 px-4 hover:bg-[#333] transition-colors"
      >
        Add to Cart
      </button>
    )
  }

  if (!timeLeft) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Countdown clock */}
      <div
        className="flex items-start gap-0"
        aria-live="polite"
        aria-atomic="true"
      >
        {[
          { value: timeLeft.days,    label: 'Days' },
          { value: timeLeft.hours,   label: 'Hrs'  },
          { value: timeLeft.minutes, label: 'Min'  },
          { value: timeLeft.seconds, label: 'Sec'  },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-start">
            <div className="flex flex-col items-center w-14 sm:w-16">
              <span className="font-mono text-[32px] sm:text-[36px] leading-none tabular-nums text-black">
                {pad(value)}
              </span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.15em] text-[#767676]">
                {label}
              </span>
            </div>
            {i < 3 && (
              <span className="font-mono text-[32px] sm:text-[36px] leading-none text-[#d4d4d4] select-none px-1">
                :
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Disabled CTA */}
      <button
        disabled
        aria-disabled="true"
        className="w-full bg-[#f5f5f5] text-[#767676] text-[11px] tracking-[0.15em] uppercase py-5 px-4 cursor-not-allowed select-none"
      >
        Coming Soon
      </button>
    </div>
  )
}
