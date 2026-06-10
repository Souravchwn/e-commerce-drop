import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageAsset } from '../types'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn:    true,
  // Write token used server-side only for Mutations API callbacks
  token: typeof window === 'undefined' ? process.env.SANITY_API_TOKEN : undefined,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageAsset) {
  return builder.image(source)
}

// ── GROQ Queries ──────────────────────────────────────────────────────────────

export const ALL_PRODUCTS_QUERY = `
  *[_type == "product"] | order(dropDate desc) {
    _id,
    title,
    "slug": { "current": slug.current },
    price,
    "images": images[0..0],
    dropDate,
    status
  }
`

export const PRODUCT_BY_SLUG_QUERY = `
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    "slug": { "current": slug.current },
    price,
    description,
    images,
    dropDate,
    medusaProductId,
    status,
    weightGrams,
    dimensions,
    hsCode,
    countryOfOrigin
  }
`

export const ALL_PRODUCT_SLUGS_QUERY = `
  *[_type == "product"] { "slug": slug.current }
`

export const ALL_PRODUCTS_FOR_PREVIEWS_QUERY = `
  *[_type == "product"] | order(dropDate desc) {
    _id,
    title,
    "slug": { "current": slug.current },
    price,
    "images": images[0..0],
    dropDate,
    status
  }
`

// ── Mutations (server-side only) ──────────────────────────────────────────────

/** Writes the Medusa product ID back to Sanity after sync. */
export async function patchMedusaProductId(
  sanityId: string,
  medusaProductId: string,
): Promise<void> {
  await sanityClient
    .patch(sanityId)
    .set({ medusaProductId })
    .commit()
}

/** Updates product status in Sanity (called from webhook handler). */
export async function updateProductStatus(
  sanityId: string,
  status: string,
): Promise<void> {
  await sanityClient
    .patch(sanityId)
    .set({ status })
    .commit()
}
