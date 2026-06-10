/**
 * Galeriaxolo — Sanity Demo Data Seed Script
 *
 * Usage (from repo root):
 *   node scripts/seed-sanity.mjs
 *
 * Requirements:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  — your Sanity project ID
 *   NEXT_PUBLIC_SANITY_DATASET     — dataset (default: production)
 *   SANITY_API_TOKEN               — write token from sanity.io/manage → API → Tokens
 *
 * The script reads vars from .env.local or .env at the repo root.
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load env vars ────────────────────────────────────────────────────────────
function loadEnv() {
  const candidates = [
    resolve(__dirname, '../.env.local'),
    resolve(__dirname, '../.env'),
    resolve(__dirname, '../apps/storefront/.env.local'),
  ]
  for (const p of candidates) {
    try {
      const lines = readFileSync(p, 'utf-8').split('\n')
      for (const line of lines) {
        const m = line.match(/^([^#\s=][^=]*)=(.*)$/)
        if (m && !process.env[m[1].trim()]) {
          process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
        }
      }
      console.log(`  Loaded env from: ${p}`)
      break
    } catch {}
  }
}

loadEnv()

// ── Sanity client ─────────────────────────────────────────────────────────────
const client = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token:      process.env.SANITY_API_TOKEN,
  useCdn:     false,
})

// ── Demo products ─────────────────────────────────────────────────────────────
// Images from picsum.photos (deterministic, always available, art-adjacent)
const now = Date.now()
const DAY = 24 * 60 * 60 * 1000

const PRODUCTS = [
  {
    title:   'Bronze Torso Fragment',
    slug:    'bronze-torso-fragment',
    price:   2800,
    status:  'live',
    dropDate: new Date(now - 8 * DAY).toISOString(),
    description: 'A remarkable bronze torso fragment from a 19th-century French atelier. The warm patina and refined musculature suggest a classically trained hand. Acquired from a private Parisian estate in 2018. Minor surface oxidation consistent with age.',
    weightGrams: 4200,
    dimensions:  { lengthCm: 28, widthCm: 18, heightCm: 42 },
    hsCode:      '9703.00',
    countryOfOrigin: 'FR',
    imageUrl: 'https://picsum.photos/seed/bronze-torso/800/800',
  },
  {
    title:   'Han Dynasty Jade Bi Disc',
    slug:    'han-dynasty-jade-bi-disc',
    price:   8500,
    status:  'live',
    dropDate: new Date(now - 5 * DAY).toISOString(),
    description: 'Exceptional nephrite jade bi disc, 2nd–1st century BCE. Deep spinach-green nephrite with characteristic mottled inclusions and natural veining. Ritual object of considerable archaeological importance. Export certificate and full provenance documentation included.',
    weightGrams: 680,
    dimensions:  { lengthCm: 22, widthCm: 22, heightCm: 2 },
    hsCode:      '9706.00',
    countryOfOrigin: 'CN',
    imageUrl: 'https://picsum.photos/seed/jade-disc-han/800/800',
  },
  {
    title:   'Carved Marble Head Study',
    slug:    'carved-marble-head-study',
    price:   4200,
    status:  'live',
    dropDate: new Date(now - 3 * DAY).toISOString(),
    description: 'An exquisite Carrara marble portrait study from an Italian workshop, circa 1720–1740. Fine detail in the hair, brow, and drapery folds suggests a well-trained hand. Minor historical restoration to the nose tip. From a Florentine private collection, documented since 1891.',
    weightGrams: 8600,
    dimensions:  { lengthCm: 24, widthCm: 20, heightCm: 38 },
    hsCode:      '9703.00',
    countryOfOrigin: 'IT',
    imageUrl: 'https://picsum.photos/seed/marble-head-study/800/800',
  },
  {
    title:   'Meiji Cloisonné Vessel',
    slug:    'meiji-cloisonne-vessel',
    price:   1650,
    status:  'upcoming',
    dropDate: new Date(now + 7 * DAY).toISOString(),
    description: 'A fine Meiji-period cloisonné vase, Japan circa 1890–1900. Midnight-blue ground with chrysanthemum, paulownia, and phoenix decoration rendered in vibrant opaque enamels. Gilt bronze foot and rim mounts. Perfect condition — no cracks, chips, or restoration.',
    weightGrams: 2100,
    dimensions:  { lengthCm: 12, widthCm: 12, heightCm: 30 },
    hsCode:      '9706.00',
    countryOfOrigin: 'JP',
    imageUrl: 'https://picsum.photos/seed/meiji-cloisonne/800/800',
  },
  {
    title:   'Kuba Kingdom Ceremonial Helmet Mask',
    slug:    'kuba-kingdom-ceremonial-mask',
    price:   12000,
    status:  'live',
    dropDate: new Date(now - 14 * DAY).toISOString(),
    description: 'Museum-quality Kuba Kingdom helmet mask, Democratic Republic of Congo, early 20th century. Cowrie shells, glass beads, and geometric raffia patchwork in the distinctive Kuba idiom. Collected by a Belgian colonial administrator in 1923 and documented in the Tervuren collection records.',
    weightGrams: 1850,
    dimensions:  { lengthCm: 28, widthCm: 26, heightCm: 34 },
    hsCode:      '9703.00',
    countryOfOrigin: 'CD',
    imageUrl: 'https://picsum.photos/seed/kuba-mask/800/800',
  },
  {
    title:   'Art Nouveau Bronze Figurine',
    slug:    'art-nouveau-bronze-figurine',
    price:   3400,
    status:  'sold',
    dropDate: new Date(now - 35 * DAY).toISOString(),
    description: 'A graceful Art Nouveau dancing figure in gilded bronze, Vienna circa 1905–1910. Signed on the integral base. Original gilt surface in excellent condition. Mounted on the original black Belgian marble plinth. A quintessential example of Viennese Jugendstil sensibility.',
    weightGrams: 2400,
    dimensions:  { lengthCm: 14, widthCm: 10, heightCm: 38 },
    hsCode:      '9703.00',
    countryOfOrigin: 'AT',
    imageUrl: 'https://picsum.photos/seed/art-nouveau-bronze/800/800',
  },
  {
    title:   'Roman Cobalt Glass Unguentarium',
    slug:    'roman-cobalt-glass-unguentarium',
    price:   980,
    status:  'sold',
    dropDate: new Date(now - 50 * DAY).toISOString(),
    description: 'Intact Roman unguentarium in deep cobalt blue glass, Eastern Mediterranean, 1st–2nd century CE. Iridescent weathering creates a beautiful prismatic surface patina. Formerly in the collection of a London antiquities dealer, acquired 1967. Accompanied by a copy of the original purchase receipt.',
    weightGrams: 120,
    dimensions:  { lengthCm: 5, widthCm: 5, heightCm: 14 },
    hsCode:      '9706.00',
    countryOfOrigin: 'IT',
    imageUrl: 'https://picsum.photos/seed/roman-glass/800/800',
  },
  {
    title:   'Etruscan Terracotta Antefix',
    slug:    'etruscan-terracotta-antefix',
    price:   18500,
    status:  'upcoming',
    dropDate: new Date(now + 14 * DAY).toISOString(),
    description: 'Exceptional Etruscan painted terracotta antefix depicting a Gorgoneion (Medusa head), Central Italy, 5th century BCE. Original polychrome traces survive on the face — ochre, black, and red pigments. From the Castellani collection, documented in auction records since 1875. Export certificate from the Italian Ministry of Culture included.',
    weightGrams: 3800,
    dimensions:  { lengthCm: 32, widthCm: 8, heightCm: 38 },
    hsCode:      '9706.00',
    countryOfOrigin: 'IT',
    imageUrl: 'https://picsum.photos/seed/etruscan-antefix/800/800',
  },
]

// ── Upload image from URL ─────────────────────────────────────────────────────
async function uploadImage(url, filename) {
  process.stdout.write(`    Uploading image: ${filename} ... `)
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const asset  = await client.assets.upload('image', buffer, {
      filename,
      contentType: 'image/jpeg',
    })
    console.log('✓')
    return {
      _type:  'image',
      asset:  { _type: 'reference', _ref: asset._id },
      alt:    filename.replace(/-/g, ' ').replace('.jpg', ''),
    }
  } catch (err) {
    console.log(`⚠  skipped (${err.message})`)
    return null
  }
}

// ── Block text helper ─────────────────────────────────────────────────────────
function toPortableText(text) {
  return [
    {
      _type: 'block',
      _key:  Math.random().toString(36).slice(2),
      style: 'normal',
      markDefs: [],
      children: [
        { _type: 'span', _key: Math.random().toString(36).slice(2), text, marks: [] },
      ],
    },
  ]
}

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🎨  Galeriaxolo — Demo Data Seeder\n')

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error('Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not set.')
    console.error('Add it to .env.local at the repo root.\n')
    process.exit(1)
  }
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Error: SANITY_API_TOKEN is not set.')
    console.error('Generate a write token at sanity.io/manage → API → Tokens.\n')
    process.exit(1)
  }

  console.log(`  Project : ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`  Dataset : ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'}\n`)

  let created = 0
  let failed  = 0

  for (const p of PRODUCTS) {
    console.log(`▸ ${p.title}  ($${p.price.toLocaleString()} · ${p.status})`)

    const imageAsset = await uploadImage(p.imageUrl, `${p.slug}.jpg`)

    const doc = {
      _type:       'product',
      title:       p.title,
      slug:        { _type: 'slug', current: p.slug },
      price:       p.price,
      status:      p.status,
      dropDate:    p.dropDate,
      description: toPortableText(p.description),
      images:      imageAsset ? [imageAsset] : [],
      weightGrams: p.weightGrams,
      dimensions:  p.dimensions,
      hsCode:      p.hsCode,
      countryOfOrigin: p.countryOfOrigin,
    }

    try {
      const result = await client.create(doc)
      console.log(`  ✓ Created: ${result._id}\n`)
      created++
    } catch (err) {
      console.error(`  ✗ Failed : ${err.message}\n`)
      failed++
    }
  }

  console.log('─────────────────────────────────────────')
  console.log(`  Created : ${created}`)
  if (failed) console.log(`  Failed  : ${failed}`)
  console.log('\n✅ Done. Open Sanity Studio to review and add real product photos.\n')
}

seed().catch((err) => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
