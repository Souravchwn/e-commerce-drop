import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import { sanityClient, ALL_PRODUCTS_FOR_PREVIEWS_QUERY, urlFor } from '../../../lib/sanity'
import { groupBySeasons } from '../../../lib/seasons'
import type { SanityProductListItem } from '../../../types'
import Footer from '../../../components/Footer'

export const metadata = { title: 'Preview' }

const getProducts = unstable_cache(
  () => sanityClient.fetch<SanityProductListItem[]>(ALL_PRODUCTS_FOR_PREVIEWS_QUERY),
  ['previews-all'],
  { tags: ['products'], revalidate: 60 },
)

export async function generateStaticParams() {
  const raw     = await sanityClient.fetch<SanityProductListItem[]>(ALL_PRODUCTS_FOR_PREVIEWS_QUERY).catch(() => [])
  const seasons = groupBySeasons(raw)
  return seasons.map((s) => ({ season: s.key }))
}

export default async function SeasonPage({ params }: { params: { season: string } }) {
  const raw     = await getProducts().catch(() => [] as SanityProductListItem[])
  const seasons = groupBySeasons(raw)
  const season  = seasons.find((s) => s.key === params.season)

  if (!season) notFound()

  const products = season.products
  const allSold  = products.every((p) => p.status === 'sold')

  return (
    <main>
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <nav className="border-b border-s-border px-4 h-9 flex items-center gap-2 text-2xs text-s-muted">
        <Link href="/previews" className="hover:text-s-fg transition-colors uppercase tracking-wide font-medium">Previews</Link>
        <span className="text-s-border">›</span>
        <span className="text-s-fg">{season.label}</span>
      </nav>

      {/* ── Season hero header ──────────────────────────────── */}
      <div className="border-b border-s-border">
        <div className="px-4 py-8 sm:py-12">
          <p className="text-2xs uppercase tracking-widest text-s-muted mb-2 font-medium">
            {season.half === 'ss' ? 'Spring/Summer' : 'Fall/Winter'} {season.year}
          </p>
          <h1 className="text-4xl sm:text-6xl font-black uppercase leading-none text-s-fg tracking-tight mb-4">
            {season.label}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs text-s-muted">
              {products.length} {products.length === 1 ? 'piece' : 'pieces'}
            </span>
            {!allSold && (
              <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-widest text-s-red">
                <span className="w-1.5 h-1.5 bg-s-red rounded-full animate-pulse-dot" />
                {products.filter((p) => !['sold'].includes(p.status)).length} available
              </span>
            )}
            {allSold && (
              <span className="text-xs text-s-muted uppercase tracking-widest">Sold out</span>
            )}
          </div>
        </div>

        {/* ── Season nav (other seasons) ───────────────────── */}
        {seasons.length > 1 && (
          <div className="flex overflow-x-auto scrollbar-none border-t border-s-border">
            <SeasonNav seasons={seasons} currentKey={season.key} />
          </div>
        )}
      </div>

      {/* ── Product grid ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 border-l border-t border-s-border">
        {products.map((product, idx) => {
          const imgUrl = product.images?.[0]
            ? urlFor(product.images[0]).width(600).height(600).url()
            : null
          const isSold = product.status === 'sold'
          const isLive = ['live', 'reserved', 'admin_hold'].includes(product.status)

          return (
            <Link
              key={product._id}
              href={`/products/${product.slug.current}`}
              className="group block border-r border-b border-s-border bg-s-bg overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden bg-s-bg-sub">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={product.title}
                    fill
                    priority={idx < 5}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className={`object-cover transition-transform duration-500 group-hover:scale-[1.04] ${isSold ? 'grayscale opacity-60' : ''}`}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-s-bg-sub">
                    <span className="text-2xs text-s-muted">No image</span>
                  </div>
                )}

                {/* Dark hover overlay */}
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

                {/* Hover CTA slide-up */}
                <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-s-fg/90 text-s-bg text-2xs font-semibold uppercase tracking-widest py-2 text-center">
                  View Piece
                </div>
              </div>

              <div className="px-2.5 py-2">
                <p className="text-sm text-s-fg leading-snug line-clamp-2 font-medium">{product.title}</p>
                <p className="text-sm text-s-fg mt-0.5 tabular-nums">${product.price.toLocaleString('en-US')}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <Footer />
    </main>
  )
}

// Client-side season nav needs to be a server component that passes data
function SeasonNav({ seasons, currentKey }: { seasons: ReturnType<typeof groupBySeasons>; currentKey: string }) {
  return (
    <>
      <Link
        href="/previews"
        className="flex-shrink-0 h-9 px-4 text-xs flex items-center text-s-muted hover:text-s-fg transition-colors border-r border-s-border"
      >
        All Seasons
      </Link>
      {seasons.map((s) => (
        <Link
          key={s.key}
          href={`/previews/${s.key}`}
          className={[
            'relative flex-shrink-0 h-9 px-4 text-xs flex items-center whitespace-nowrap transition-colors duration-100 border-r border-s-border last:border-r-0',
            s.key === currentKey
              ? 'text-s-fg font-semibold filter-active'
              : 'text-s-muted hover:text-s-fg',
          ].join(' ')}
        >
          {s.label}
        </Link>
      ))}
    </>
  )
}
