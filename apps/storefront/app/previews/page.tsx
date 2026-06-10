import { unstable_cache } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import { sanityClient, ALL_PRODUCTS_FOR_PREVIEWS_QUERY, urlFor } from '../../lib/sanity'
import { groupBySeasons } from '../../lib/seasons'
import type { SanityProductListItem } from '../../types'
import Footer from '../../components/Footer'

export const metadata = { title: 'Previews' }

const getProducts = unstable_cache(
  () => sanityClient.fetch<SanityProductListItem[]>(ALL_PRODUCTS_FOR_PREVIEWS_QUERY),
  ['previews-all'],
  { tags: ['products'], revalidate: 60 },
)

export default async function PreviewsPage() {
  const raw     = await getProducts().catch(() => [] as SanityProductListItem[])
  const seasons = groupBySeasons(raw)

  return (
    <main>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="border-b border-s-border px-4 py-3 flex items-baseline gap-4">
        <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">Previews</h1>
        <span className="text-2xs text-s-muted">{seasons.length} {seasons.length === 1 ? 'season' : 'seasons'}</span>
      </div>

      {seasons.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-32">
          <p className="text-xs text-s-muted">No previews available yet.</p>
          <Link href="/" className="text-xs text-s-fg underline hover:text-s-red transition-colors">
            Browse current drop →
          </Link>
        </div>
      ) : (
        <>
          {/* ── Season list ─────────────────────────────────── */}
          {seasons.map((season, idx) => {
            const coverImg = season.products[0]?.images?.[0]
              ? urlFor(season.products[0].images[0]).width(1200).height(800).url()
              : null
            const soldCount    = season.products.filter((p) => p.status === 'sold').length
            const allSold      = soldCount === season.products.length
            const previewImgs  = season.products
              .slice(0, 5)
              .map((p) => p.images?.[0] ? urlFor(p.images[0]).width(300).height(300).url() : null)
              .filter(Boolean) as string[]

            return (
              <Link
                key={season.key}
                href={`/previews/${season.key}`}
                className="group block border-b border-s-border hover:bg-s-bg-sub transition-colors duration-150"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Cover image */}
                  <div className="relative lg:w-[45%] aspect-[16/9] lg:aspect-[4/3] overflow-hidden bg-s-bg-sub flex-shrink-0">
                    {coverImg ? (
                      <Image
                        src={coverImg}
                        alt={season.label}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] ${allSold ? 'grayscale opacity-70' : ''}`}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-s-muted uppercase tracking-widest">No preview</span>
                      </div>
                    )}
                  </div>

                  {/* Info panel */}
                  <div className="flex-1 px-5 py-6 lg:py-8 flex flex-col justify-between">
                    <div>
                      {/* Season label */}
                      <p className="text-2xs uppercase tracking-widest text-s-muted mb-2 font-medium">
                        {season.half === 'ss' ? 'Spring/Summer' : 'Fall/Winter'} {season.year}
                      </p>
                      <h2 className="text-3xl sm:text-4xl font-black uppercase leading-none text-s-fg tracking-tight mb-4">
                        {season.label}
                      </h2>
                      <p className="text-xs text-s-muted mb-6">
                        {season.products.length} {season.products.length === 1 ? 'piece' : 'pieces'}
                        {soldCount > 0 && (
                          <> · <span className={allSold ? 'text-s-fg' : 'text-s-muted'}>{soldCount} sold</span></>
                        )}
                        {!allSold && (
                          <> · <span className="text-s-red font-semibold">{season.products.length - soldCount} available</span></>
                        )}
                      </p>

                      {/* Preview thumbnails strip */}
                      {previewImgs.length > 0 && (
                        <div className="flex gap-1 mb-6">
                          {previewImgs.map((url, i) => (
                            <div
                              key={i}
                              className="relative w-12 h-12 sm:w-16 sm:h-16 overflow-hidden bg-s-bg-sub border border-s-border flex-shrink-0"
                            >
                              <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                            </div>
                          ))}
                          {season.products.length > 5 && (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-s-bg-sub border border-s-border flex-shrink-0 flex items-center justify-center">
                              <span className="text-2xs font-bold text-s-muted">+{season.products.length - 5}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-s-fg group-hover:text-s-red transition-colors duration-200">
                      View collection
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </>
      )}

      <Footer />
    </main>
  )
}
