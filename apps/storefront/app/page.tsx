import Link from 'next/link'
import Image from 'next/image'
import { unstable_cache } from 'next/cache'
import { sanityClient, ALL_PRODUCTS_QUERY, urlFor } from '../lib/sanity'
import type { SanityProductListItem } from '../types'

const getProducts = unstable_cache(
  () => sanityClient.fetch<SanityProductListItem[]>(ALL_PRODUCTS_QUERY),
  ['all-products'],
  { tags: ['products'], revalidate: 60 },
)

function DropBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    upcoming:   { label: 'Coming Soon',  className: 'bg-stone-100 text-stone-500' },
    live:       { label: 'Live Now',     className: 'bg-green-50 text-green-700'  },
    reserved:   { label: 'Reserved',     className: 'bg-amber-50 text-amber-700'  },
    admin_hold: { label: 'Pending',      className: 'bg-amber-50 text-amber-700'  },
    sold:       { label: 'Sold',         className: 'bg-stone-100 text-stone-400' },
  }
  const { label, className } = map[status] ?? map['upcoming']
  return (
    <span className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 ${className}`}>
      {label}
    </span>
  )
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="px-6 py-24 text-center border-b border-stone-100">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400 mb-6">
          Gallery Drop
        </p>
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-stone-900 max-w-xl mx-auto leading-tight">
          Rare sculptures &amp;<br className="hidden sm:block" /> antiques
        </h1>
        <p className="mt-6 text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
          Limited editions released every 2–4 weeks. One piece, one owner.
        </p>
      </section>

      {/* Product grid */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        {products.length === 0 ? (
          <p className="text-center text-sm text-stone-400 py-20 tracking-widest uppercase">
            Next drop coming soon
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-100">
            {products.map((product) => {
              const imageUrl = product.images
                ? urlFor(product.images).width(600).height(750).url()
                : null

              return (
                <Link
                  key={product._id}
                  href={`/products/${product.slug.current}`}
                  className="group bg-white flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-50">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-stone-300 tracking-widest uppercase">
                          No image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <h2 className="text-sm font-medium text-stone-900 leading-snug">
                        {product.title}
                      </h2>
                      <DropBadge status={product.status} />
                    </div>
                    <p className="text-sm tabular-nums text-stone-600">
                      ${product.price.toLocaleString('en-US')}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 px-6 py-12 text-center">
        <p className="text-xs text-stone-400 tracking-[0.2em] uppercase">
          All pieces are 1-of-1 originals
        </p>
      </footer>
    </main>
  )
}
