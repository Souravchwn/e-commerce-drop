import { notFound } from 'next/navigation'
import Image from 'next/image'
import { unstable_cache } from 'next/cache'
import { PortableText } from '@portabletext/react'
import { sanityClient, PRODUCT_BY_SLUG_QUERY, ALL_PRODUCT_SLUGS_QUERY, urlFor } from '../../../lib/sanity'
import AddToCart from '../../../components/AddToCart'
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

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const images = product.images ?? []
  const isSold = product.status === 'sold'

  return (
    <main className="min-h-screen">
      <div className="lg:grid lg:grid-cols-2 lg:items-start">

        {/* Left — image stack */}
        <div className="flex flex-col gap-[1px] bg-[#d4d4d4]">
          {images.length > 0 ? (
            images.map((img, i) => {
              const url = urlFor(img).width(900).height(900).url()
              return (
                <div key={i} className="relative aspect-square bg-[#f5f5f5]">
                  <Image
                    src={url}
                    alt={i === 0 ? product.title : `${product.title} — view ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={`object-cover ${isSold ? 'grayscale' : ''}`}
                  />
                </div>
              )
            })
          ) : (
            <div className="aspect-square bg-[#f5f5f5] flex items-center justify-center">
              <span className="text-[11px] uppercase tracking-[0.15em] text-[#d4d4d4]">No image</span>
            </div>
          )}
        </div>

        {/* Right — sticky details */}
        <div className="lg:sticky lg:top-12 lg:h-[calc(100vh-48px)] lg:overflow-y-auto lg:border-l lg:border-[#d4d4d4] flex flex-col">

          {/* Top details block */}
          <div className="flex flex-col gap-5 px-5 py-6 border-b border-[#d4d4d4]">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#767676]">
              1 of 1 Original
            </p>

            <div className="flex flex-col gap-1">
              <h1 className="text-[22px] font-normal leading-tight text-black">
                {product.title}
              </h1>
              <p className="text-[20px] font-normal tabular-nums text-black">
                ${product.price.toLocaleString('en-US')}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none text-[13px] leading-relaxed text-black">
                <PortableText value={product.description} />
              </div>
            )}

            {/* Payment notice */}
            {!isSold && (
              <p className="text-[11px] text-[#767676]">
                {product.price >= 5000
                  ? 'Wire transfer required for purchases ≥ $5,000'
                  : 'Card · Apple Pay · Google Pay accepted'}
              </p>
            )}
          </div>

          {/* CTA block */}
          <div className="px-5 py-6 border-b border-[#d4d4d4]">
            {isSold ? (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#cc0000]">Sold</p>
                <p className="text-[13px] text-[#767676]">This piece has found its home.</p>
              </div>
            ) : (
              <AddToCart
                dropDate={product.dropDate}
                productId={product.medusaProductId ?? product._id}
              />
            )}
          </div>

          {/* Shipping accordion */}
          <details className="group border-b border-[#d4d4d4]">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none text-[11px] uppercase tracking-[0.1em] hover:bg-[#f5f5f5] transition-colors">
              Shipping & Details
              <span className="text-[#767676] text-[16px] leading-none group-open:rotate-45 transition-transform inline-block">+</span>
            </summary>
            <div className="px-5 pb-5 grid grid-cols-2 gap-4">
              <DetailField label="Weight"     value={`${(product.weightGrams / 1000).toFixed(2)} kg`} />
              <DetailField label="Dimensions" value={`${product.dimensions.lengthCm}×${product.dimensions.widthCm}×${product.dimensions.heightCm} cm`} />
              <DetailField label="HS Code"    value={product.hsCode} />
              <DetailField label="Origin"     value={product.countryOfOrigin} />
            </div>
          </details>

        </div>
      </div>
    </main>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.12em] text-[#767676]">{label}</span>
      <span className="text-[13px] text-black">{value}</span>
    </div>
  )
}
