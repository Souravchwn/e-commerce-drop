import { unstable_cache } from 'next/cache'
import { sanityClient, ALL_PRODUCTS_QUERY, urlFor } from '../lib/sanity'
import type { SanityProductListItem } from '../types'
import ShopGrid from '../components/ShopGrid'
import Footer from '../components/Footer'
import type { GridProduct } from '../components/ShopGrid'

const getProducts = unstable_cache(
  () => sanityClient.fetch<SanityProductListItem[]>(ALL_PRODUCTS_QUERY),
  ['all-products'],
  { tags: ['products'], revalidate: 60 },
)

export default async function HomePage() {
  const raw = await getProducts().catch(() => [] as SanityProductListItem[])

  const products: GridProduct[] = raw.map((p) => ({
    _id:      p._id,
    title:    p.title,
    slug:     p.slug,
    price:    p.price,
    status:   p.status,
    imageUrl: p.images?.[0] ? urlFor(p.images[0]).width(800).height(800).url() : null,
  }))

  const liveCount = products.filter((p) =>
    ['live', 'reserved', 'admin_hold'].includes(p.status),
  ).length

  return (
    <main>
      {/* ── Red scrolling ticker ────────────────────────────── */}
      <div className="h-8 bg-s-red overflow-hidden flex items-center">
        <div
          className="flex whitespace-nowrap text-white text-2xs uppercase tracking-widest font-semibold"
          style={{ animation: 'marquee 40s linear infinite' }}
        >
          {Array(8).fill('New Drop — 1-of-1 Sculptures & Antiques · Worldwide Shipping · Wire Transfer Available ≥ $5,000 · Each Piece Certified Authentic · ').join('')}
        </div>
      </div>

      {/* ── Drop header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-s-border">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">
            Current Drop
          </h1>
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-widest text-s-red">
              <span className="w-1.5 h-1.5 bg-s-red rounded-full animate-pulse-dot" />
              {liveCount} available
            </span>
          )}
        </div>
        <p className="text-2xs text-s-muted hidden sm:block">
          {products.length} {products.length === 1 ? 'piece' : 'pieces'} total
        </p>
      </div>

      {/* ── Shop grid ───────────────────────────────────────── */}
      <ShopGrid products={products} />

      <Footer />
    </main>
  )
}
