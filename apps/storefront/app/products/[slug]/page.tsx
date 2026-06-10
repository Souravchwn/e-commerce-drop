import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { PortableText } from '@portabletext/react'
import {
  sanityClient,
  PRODUCT_BY_SLUG_QUERY,
  ALL_PRODUCT_SLUGS_QUERY,
  urlFor,
} from '../../../lib/sanity'
import AddToCart from '../../../components/AddToCart'
import ProductImageGallery from '../../../components/ProductImageGallery'
import Footer from '../../../components/Footer'
import type { SanityProduct } from '../../../types'

const getProduct = unstable_cache(
  (slug: string) => sanityClient.fetch<SanityProduct>(PRODUCT_BY_SLUG_QUERY, { slug }),
  ['product-by-slug'],
  { tags: ['products'], revalidate: 30 },
)

export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<{ slug: string }[]>(ALL_PRODUCT_SLUGS_QUERY)
  return slugs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) return {}
  return {
    title:       product.title,
    description: `${product.title} — $${product.price.toLocaleString('en-US')}`,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const images = product.images ?? []
  const isSold = product.status === 'sold'
  const isLive = ['live', 'reserved', 'admin_hold'].includes(product.status)

  const imageData = images.map((img, i) => ({
    url: urlFor(img).width(1400).height(1400).url(),
    alt: i === 0 ? product.title : `${product.title} — view ${i + 1}`,
  }))

  return (
    <main>
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <nav className="border-b border-s-border px-4 h-9 flex items-center gap-2 text-2xs text-s-muted">
        <a href="/" className="hover:text-s-fg transition-colors uppercase tracking-wide font-medium">Shop</a>
        <span className="text-s-border">›</span>
        <span className="text-s-fg truncate">{product.title}</span>
      </nav>

      {/* ── Two-column ──────────────────────────────────────── */}
      <div className="lg:flex lg:items-start">

        {/* Left: sticky image gallery ~58% */}
        <div className="lg:w-[58%] border-b lg:border-b-0 lg:border-r border-s-border lg:sticky lg:top-11">
          <ProductImageGallery images={imageData} isSold={isSold} />
        </div>

        {/* Right: product info ~42% */}
        <div className="lg:w-[42%] flex flex-col">

          {/* ── Title block ─────────────────────────────────── */}
          <div className="px-5 pt-6 pb-5 border-b border-s-border">
            {/* Status */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-2xs uppercase tracking-widest text-s-muted">1 of 1 Original</span>
              {isSold && (
                <span className="text-2xs uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 font-bold">Sold</span>
              )}
              {isLive && !isSold && (
                <span className="flex items-center gap-1.5 text-2xs uppercase tracking-widest bg-s-red text-white px-2 py-0.5 font-bold">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-dot" />
                  Available Now
                </span>
              )}
              {product.status === 'upcoming' && (
                <span className="text-2xs uppercase tracking-widest border border-s-border text-s-muted px-2 py-0.5">Upcoming</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase leading-tight text-s-fg tracking-tight mb-3">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black tabular-nums text-s-fg">
                ${product.price.toLocaleString('en-US')}
              </span>
              {product.price >= 5000 && (
                <span className="text-2xs text-s-muted uppercase tracking-wide">USD</span>
              )}
            </div>
          </div>

          {/* ── CTA ─────────────────────────────────────────── */}
          <div className="px-5 py-5 border-b border-s-border">
            {isSold ? (
              <div className="flex flex-col gap-2">
                <div className="w-full border border-s-border py-4 text-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-s-muted">Sold Out</span>
                </div>
                <p className="text-xs text-s-muted text-center">This piece has found its home.</p>
              </div>
            ) : (
              <AddToCart
                dropDate={product.dropDate}
                productId={product.medusaProductId ?? product._id}
              />
            )}
          </div>

          {/* ── Payment note ────────────────────────────────── */}
          {!isSold && (
            <div className="px-5 py-3 bg-s-bg-sub border-b border-s-border flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-s-muted flex-shrink-0">
                <rect x="1" y="3" width="10" height="8" rx="0" stroke="currentColor" strokeWidth="1"/>
                <path d="M4 3V2a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1"/>
              </svg>
              <p className="text-2xs text-s-muted">
                {product.price >= 5000
                  ? 'Wire transfer required for purchases ≥ $5,000'
                  : 'Card · Apple Pay · Google Pay accepted'}
              </p>
            </div>
          )}

          {/* ── Description ─────────────────────────────────── */}
          {product.description && (
            <div className="px-5 py-5 border-b border-s-border">
              <p className="text-2xs font-bold uppercase tracking-widest text-s-muted mb-3">About this piece</p>
              <div className="prose prose-sm max-w-none text-s-fg [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-s-fg">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <PortableText value={product.description as any[]} />
              </div>
            </div>
          )}

          {/* ── Provenance details ──────────────────────────── */}
          <details className="group border-b border-s-border">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-s-bg-sub transition-colors">
              <span className="text-2xs font-bold uppercase tracking-widest text-s-fg">Shipping & Provenance</span>
              <span className="text-s-muted text-xl leading-none transition-transform duration-200 group-open:rotate-45 select-none">+</span>
            </summary>
            <div className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 border border-s-border p-4">
                {product.weightGrams && (
                  <Stat label="Weight" value={`${(product.weightGrams / 1000).toFixed(2)} kg`} />
                )}
                {product.dimensions && (
                  <Stat
                    label="Dimensions"
                    value={`${product.dimensions.lengthCm} × ${product.dimensions.widthCm} × ${product.dimensions.heightCm} cm`}
                  />
                )}
                {product.hsCode && <Stat label="HS Code" value={product.hsCode} />}
                {product.countryOfOrigin && <Stat label="Origin" value={product.countryOfOrigin} />}
              </div>
            </div>
          </details>

          {/* ── Authenticity note ───────────────────────────── */}
          <div className="px-5 py-5 flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-s-red flex-shrink-0 mt-0.5">
              <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.5l-3.7 2 .7-4.1L2 5.5l4.2-.9L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-2xs font-bold text-s-fg mb-1 uppercase tracking-wide">Certificate of Authenticity</p>
              <p className="text-2xs text-s-muted leading-relaxed">
                Included with every piece. International white-glove shipping on request.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xs uppercase tracking-widest text-s-muted mb-1">{label}</p>
      <p className="text-xs font-semibold text-s-fg">{value}</p>
    </div>
  )
}
