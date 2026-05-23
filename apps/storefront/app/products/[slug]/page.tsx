import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { PortableText } from '@portabletext/react'
import { sanityClient, PRODUCT_BY_SLUG_QUERY, ALL_PRODUCT_SLUGS_QUERY, urlFor } from '../../../lib/sanity'
import DropCountdown from '../../../components/DropCountdown'
import type { SanityProduct } from '../../../types'

const getProduct = unstable_cache(
  (slug: string) =>
    sanityClient.fetch<SanityProduct>(PRODUCT_BY_SLUG_QUERY, { slug }),
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

interface ProductPageProps {
  params: { slug: string }
}

function AddToCartClient({
  dropDate,
  productId,
}: {
  dropDate:  string
  productId: string
}) {
  'use client'
  // Wrapped so DropCountdown (client component) can live inside a server page
  return null // replaced below with the actual import
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const heroImage = product.images?.[0]
    ? urlFor(product.images[0]).width(900).height(1100).url()
    : null

  const isSold = product.status === 'sold'

  return (
    <main className="min-h-screen">
      {/* Back */}
      <nav className="px-6 pt-8 pb-0">
        <Link
          href="/"
          className="text-xs tracking-[0.3em] uppercase text-stone-400 hover:text-stone-900 transition-colors"
        >
          ← All Drops
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Images */}
        <div className="flex flex-col gap-3">
          {heroImage && (
            <div className="relative aspect-[4/5] bg-stone-50">
              <Image
                src={heroImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
          {product.images?.slice(1).map((img, i) => {
            const url = urlFor(img).width(600).height(750).url()
            return (
              <div key={i} className="relative aspect-[4/5] bg-stone-50">
                <Image
                  src={url}
                  alt={`${product.title} — view ${i + 2}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )
          })}
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-12 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400">
              1 of 1 Original
            </p>
            <h1 className="text-3xl font-light text-stone-900 leading-tight">
              {product.title}
            </h1>
            <p className="text-2xl font-light tabular-nums text-stone-900">
              ${product.price.toLocaleString('en-US')}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm prose-stone max-w-none text-stone-600">
              <PortableText value={product.description} />
            </div>
          )}

          {/* Shipping metadata */}
          <div className="border-t border-stone-100 pt-6 grid grid-cols-2 gap-4 text-xs text-stone-500">
            <div>
              <span className="block tracking-widest uppercase text-[10px] text-stone-400 mb-1">Weight</span>
              {(product.weightGrams / 1000).toFixed(2)} kg
            </div>
            <div>
              <span className="block tracking-widest uppercase text-[10px] text-stone-400 mb-1">Dimensions</span>
              {product.dimensions.lengthCm}×{product.dimensions.widthCm}×{product.dimensions.heightCm} cm
            </div>
            <div>
              <span className="block tracking-widest uppercase text-[10px] text-stone-400 mb-1">HS Code</span>
              {product.hsCode}
            </div>
            <div>
              <span className="block tracking-widest uppercase text-[10px] text-stone-400 mb-1">Origin</span>
              {product.countryOfOrigin}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            {isSold ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <p className="text-xs tracking-[0.3em] uppercase text-stone-400">Sold</p>
                <p className="text-sm text-stone-500">This piece has found its home.</p>
              </div>
            ) : (
              <DropCountdown
                dropDate={product.dropDate}
                productId={product.medusaProductId ?? product._id}
                onAddToCart={(id) => {
                  // Redirect to cart after adding item via Medusa SDK
                  // Full cart flow handled client-side via CartSummary
                  window.location.href = `/cart?add=${id}`
                }}
              />
            )}
          </div>

          {/* Payment tier notice */}
          {!isSold && (
            <p className="text-xs text-stone-400 text-center">
              {product.price >= 5000
                ? 'This item requires international wire transfer (≥ $5,000)'
                : 'Card, Apple Pay & Google Pay accepted'}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
