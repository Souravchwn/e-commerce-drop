'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TimeLeft {
  days:    number
  hours:   number
  minutes: number
  seconds: number
}

interface DropCountdownProps {
  dropDate:    string
  productId:   string
  onAddToCart: (productId: string) => void
  isPending?:  boolean
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

function pad(n: number) { return String(n).padStart(2, '0') }

export default function DropCountdown({
  dropDate,
  productId,
  onAddToCart,
  isPending = false,
}: DropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => computeTimeLeft(dropDate))
  const [isLive,   setIsLive]   = useState<boolean>(() => computeTimeLeft(dropDate) === null)
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
    if (computeTimeLeft(dropDate) === null) { setIsLive(true); return }
    intervalRef.current = setInterval(tick, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [dropDate, tick])

  if (isLive) {
    return (
      <button
        onClick={() => onAddToCart(productId)}
        disabled={isPending}
        className="w-full bg-s-fg text-s-bg text-xs font-bold uppercase tracking-widest py-4 px-4 hover:bg-s-red hover:text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
            Adding…
          </>
        ) : 'Add to Cart'}
      </button>
    )
  }

  if (!timeLeft) return null

  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xs uppercase tracking-widest text-s-muted font-semibold">Available In</p>

      <div className="flex items-end gap-1" aria-live="polite" aria-atomic="true">
        {[
          { value: timeLeft.days,    label: 'Days' },
          { value: timeLeft.hours,   label: 'Hrs'  },
          { value: timeLeft.minutes, label: 'Min'  },
          { value: timeLeft.seconds, label: 'Sec'  },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-end">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black tabular-nums text-s-fg leading-none">{pad(value)}</span>
              <span className="text-2xs text-s-muted uppercase tracking-widest mt-1">{label}</span>
            </div>
            {i < 3 && (
              <span className="text-3xl font-black text-s-muted/50 leading-none mb-4 mx-0.5 select-none">:</span>
            )}
          </div>
        ))}
      </div>

      <button
        disabled
        aria-disabled="true"
        className="w-full bg-s-bg-sub text-s-muted text-xs font-bold uppercase tracking-widest py-4 px-4 cursor-not-allowed border border-s-border"
      >
        Coming Soon
      </button>
    </div>
  )
}
