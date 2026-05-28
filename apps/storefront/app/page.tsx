import { unstable_cache } from 'next/cache'
import { sanityClient, ALL_PRODUCTS_QUERY, urlFor } from '../lib/sanity'
import type { SanityProductListItem } from '../types'
import ShopGrid from '../components/ShopGrid'
import type { GridProduct } from '../components/ShopGrid'

const getProducts = unstable_cache(
  () => sanityClient.fetch<SanityProductListItem[]>(ALL_PRODUCTS_QUERY),
  ['all-products'],
  { tags: ['products'], revalidate: 60 },
)

export default async function HomePage() {
  const raw = await getProducts()

  const products: GridProduct[] = raw.map((p) => ({
    _id:      p._id,
    title:    p.title,
    slug:     p.slug,
    price:    p.price,
    status:   p.status,
    imageUrl: p.images ? urlFor(p.images).width(800).height(800).url() : null,
  }))

  return (
    <main>
      <ShopGrid products={products} />

      <footer className="border-t border-[#d4d4d4] px-4 py-6 flex flex-col sm:flex-row justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.1em] text-[#767676]">
          All pieces are 1-of-1 originals
        </p>
        <p className="text-[11px] uppercase tracking-[0.1em] text-[#767676]">
          Galeriaxolo.com © {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  )
}
