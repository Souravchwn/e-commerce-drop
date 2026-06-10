'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export type GridProduct = {
  _id:      string
  title:    string
  slug:     { current: string }
  price:    number
  status:   string
  imageUrl: string | null
}

type Filter = 'all' | 'live' | 'upcoming' | 'sold'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'live',     label: 'Live'     },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'sold',     label: 'Sold'     },
]

function filterProducts(products: GridProduct[], filter: Filter) {
  if (filter === 'all')      return products
  if (filter === 'live')     return products.filter((p) => ['live', 'reserved', 'admin_hold'].includes(p.status))
  if (filter === 'upcoming') return products.filter((p) => p.status === 'upcoming')
  if (filter === 'sold')     return products.filter((p) => p.status === 'sold')
  return products
}

function countFor(products: GridProduct[], key: Filter) {
  return filterProducts(products, key).length
}

export default function ShopGrid({ products }: { products: GridProduct[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const filtered = filterProducts(products, filter)

  // First live item gets the hero treatment
  const hero    = filter === 'all' ? filtered.find((p) => p.status === 'live') ?? filtered[0] : null
  const rest    = hero ? filtered.filter((p) => p._id !== hero._id) : filtered

  return (
    <div>
      {/* ── Filter / category bar ─────────────────────────── */}
      <div className="sticky top-11 z-40 bg-s-bg border-b border-s-border">
        <div className="flex overflow-x-auto scrollbar-none">
          {FILTERS.map(({ key, label }) => {
            const count = countFor(products, key)
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={[
                  'relative flex-shrink-0 h-9 px-4 text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors duration-100',
                  filter === key
                    ? 'text-s-fg font-semibold filter-active'
                    : 'text-s-muted hover:text-s-fg',
                ].join(' ')}
              >
                {label}
                <span className={`text-[10px] tabular-nums ${filter === key ? 'text-s-red' : 'text-s-muted/60'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <div className="w-12 h-px bg-s-border" />
          <p className="text-xs text-s-muted">No pieces in this category.</p>
          <button onClick={() => setFilter('all')} className="text-xs text-s-fg underline hover:text-s-red transition-colors">
            View all →
          </button>
        </div>
      ) : (
        <>
          {/* ── Hero card (first live or first item in "All") ── */}
          {hero && filter === 'all' && (
            <HeroCard product={hero} />
          )}

          {/* ── Product grid ─────────────────────────────────── */}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 border-l border-t border-s-border">
              {rest.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Hero Card (2×2 featured) ─────────────────────────────────── */
function HeroCard({ product }: { product: GridProduct }) {
  const isSold = product.status === 'sold'
  const isLive = ['live', 'reserved', 'admin_hold'].includes(product.status)

  return (
    <Link
      href={`/products/${product.slug.current}`}
      className="group relative block border-b border-s-border overflow-hidden bg-s-bg-sub"
    >
      <div className="relative h-[55vw] max-h-[620px] min-h-[300px] overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            priority
            sizes="100vw"
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] ${isSold ? 'grayscale opacity-60' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 bg-s-bg-sub flex items-center justify-center">
            <span className="text-xs text-s-muted">No image</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Live badge */}
        {isLive && !isSold && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-s-red text-white text-xs px-3 py-1 font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-dot" />
            Live Now
          </div>
        )}
        {isSold && (
          <div className="absolute top-4 left-4 bg-black/80 text-white text-xs px-3 py-1 font-semibold uppercase tracking-widest">
            Sold Out
          </div>
        )}

        {/* Info overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <p className="text-2xs text-white/60 uppercase tracking-widest mb-1 font-medium">
            1 of 1 Original
          </p>
          <h2 className="text-xl sm:text-3xl font-bold text-white leading-tight mb-1 max-w-lg">
            {product.title}
          </h2>
          <p className="text-lg sm:text-2xl font-bold text-white tabular-nums">
            ${product.price.toLocaleString('en-US')}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white text-black text-xs font-semibold uppercase tracking-widest px-5 py-2.5 group-hover:bg-s-red group-hover:text-white transition-colors duration-200">
            View Piece
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Regular Product Card ─────────────────────────────────────── */
function ProductCard({ product }: { product: GridProduct }) {
  const isSold = product.status === 'sold'
  const isLive = ['live', 'reserved', 'admin_hold'].includes(product.status)

  return (
    <Link
      href={`/products/${product.slug.current}`}
      className="group relative block border-r border-b border-s-border bg-s-bg overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-s-bg-sub">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${isSold ? 'grayscale opacity-60' : ''}`}
          />
        ) : (
          /* Placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-s-bg-sub">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-s-border">
              <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-2xs text-s-muted">No image</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Status badges */}
        {isSold && (
          <span className="absolute top-0 left-0 bg-black text-white text-2xs px-2 py-1 font-semibold uppercase tracking-widest">
            Sold Out
          </span>
        )}
        {isLive && !isSold && (
          <span className="absolute top-0 left-0 flex items-center gap-1 bg-s-red text-white text-2xs px-2 py-1 font-semibold uppercase tracking-widest">
            <span className="w-1 h-1 bg-white rounded-full animate-pulse-dot" />
            Live
          </span>
        )}
        {product.status === 'upcoming' && (
          <span className="absolute top-0 left-0 bg-s-fg/90 text-s-bg text-2xs px-2 py-1 font-semibold uppercase tracking-widest">
            Soon
          </span>
        )}

        {/* Hover CTA */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-s-fg/90 text-s-bg text-2xs font-semibold uppercase tracking-widest py-2 text-center">
          View Piece
        </div>
      </div>

      {/* Info */}
      <div className="px-2.5 py-2">
        <p className="text-sm text-s-fg leading-snug line-clamp-2 font-medium">{product.title}</p>
        <p className="text-sm text-s-fg mt-0.5 tabular-nums">${product.price.toLocaleString('en-US')}</p>
      </div>
    </Link>
  )
}
