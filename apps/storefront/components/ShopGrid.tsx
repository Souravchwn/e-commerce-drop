'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Filter = 'all' | 'upcoming' | 'live' | 'sold'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live',     label: 'Live'     },
  { key: 'sold',     label: 'Sold'     },
]

export type GridProduct = {
  _id:      string
  title:    string
  slug:     { current: string }
  price:    number
  status:   string
  imageUrl: string | null
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'sold') {
    return (
      <span className="absolute top-0 left-0 bg-[#cc0000] text-white text-[10px] tracking-[0.1em] uppercase px-2 py-[3px] leading-none">
        Sold Out
      </span>
    )
  }
  if (status === 'upcoming') {
    return (
      <span className="absolute top-0 left-0 bg-black text-white text-[10px] tracking-[0.1em] uppercase px-2 py-[3px] leading-none">
        Coming Soon
      </span>
    )
  }
  if (status === 'reserved' || status === 'admin_hold') {
    return (
      <span className="absolute top-0 left-0 bg-black text-white text-[10px] tracking-[0.1em] uppercase px-2 py-[3px] leading-none">
        Reserved
      </span>
    )
  }
  return null
}

export default function ShopGrid({ products }: { products: GridProduct[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all'
    ? products
    : products.filter((p) => {
        if (filter === 'sold')     return p.status === 'sold'
        if (filter === 'upcoming') return p.status === 'upcoming'
        if (filter === 'live')     return p.status === 'live' || p.status === 'reserved' || p.status === 'admin_hold'
        return true
      })

  return (
    <>
      {/* Filter bar — sticky just below the fixed header */}
      <div className="sticky top-12 z-40 bg-white border-b border-[#d4d4d4] overflow-x-auto scrollbar-none">
        <div className="flex items-stretch h-10 min-w-max">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 text-[11px] uppercase tracking-[0.1em] border-r border-[#d4d4d4] first:border-l whitespace-nowrap transition-colors ${
                filter === key
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-[#f5f5f5]'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto flex items-center px-4 text-[11px] uppercase tracking-[0.1em] text-[#767676] whitespace-nowrap">
            {filtered.length}&nbsp;{filtered.length === 1 ? 'Piece' : 'Pieces'}
          </span>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#767676]">No items</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-[#d4d4d4]">
          {filtered.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product.slug.current}`}
              className="group bg-white flex flex-col"
            >
              {/* Square image */}
              <div className={`relative aspect-square overflow-hidden bg-[#f5f5f5] ${product.status === 'sold' ? 'grayscale' : ''}`}>
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-[#d4d4d4] tracking-widest uppercase">No image</span>
                  </div>
                )}
                <StatusBadge status={product.status} />
              </div>

              {/* Name + price */}
              <div className="px-3 py-[10px] flex flex-col gap-[3px]">
                <p className="text-[12px] leading-snug text-black line-clamp-2">
                  {product.title}
                </p>
                <p className="text-[12px] text-[#767676] tabular-nums">
                  ${product.price.toLocaleString('en-US')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
