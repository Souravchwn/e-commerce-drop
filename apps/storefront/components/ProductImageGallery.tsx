'use client'

import { useState } from 'react'
import Image from 'next/image'

type ImageItem = { url: string; alt: string }

export default function ProductImageGallery({
  images,
  isSold,
}: {
  images: ImageItem[]
  isSold: boolean
}) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-s-bg-sub flex flex-col items-center justify-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-s-border">
          <rect x="2" y="2" width="28" height="28" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 22l8-8 6 6 4-4 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs text-s-muted uppercase tracking-widest">No image</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Main image */}
      <div className={`relative aspect-square w-full bg-s-bg-sub overflow-hidden ${isSold ? 'grayscale opacity-70' : ''}`}>
        <Image
          src={images[active].url}
          alt={images[active].alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover transition-opacity duration-300"
        />

        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 text-white text-xs font-bold uppercase tracking-widest px-4 py-2">
              Sold Out
            </div>
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-2xs px-2 py-1 font-mono tabular-nums">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex border-t border-s-border">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
              className={[
                'relative flex-1 aspect-square overflow-hidden border-r border-s-border last:border-r-0 transition-all duration-150',
                active === i
                  ? 'opacity-100 ring-2 ring-inset ring-s-fg'
                  : 'opacity-40 hover:opacity-75',
              ].join(' ')}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 20vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
