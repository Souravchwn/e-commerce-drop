import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export const runtime = 'nodejs'

// Sanity fires this webhook when a product is published or updated.
// We sync it to Medusa and bust the Next.js cache.
export async function POST(req: Request): Promise<Response> {
  // Validate the shared secret Sanity sends as a header
  const secret = req.headers.get('x-sanity-webhook-secret')
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: { _id: string; _type: string; title?: string; price?: number; medusaProductId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body._type !== 'product') {
    return NextResponse.json({ skipped: true })
  }

  const medusaUrl  = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const authHeader = {
    Authorization:  `Bearer ${process.env.MEDUSA_ADMIN_SECRET}`,
    'Content-Type': 'application/json',
  }

  // Sync to Medusa: create product if it doesn't exist, otherwise update it
  if (medusaUrl) {
    if (body.medusaProductId) {
      // Update existing Medusa product
      await fetch(`${medusaUrl}/admin/products/${body.medusaProductId}`, {
        method:  'POST',
        headers: authHeader,
        body:    JSON.stringify({ title: body.title }),
      }).catch(console.error)
    } else {
      // Create new Medusa product and write the ID back to Sanity
      const res = await fetch(`${medusaUrl}/admin/products`, {
        method:  'POST',
        headers: authHeader,
        body: JSON.stringify({
          title:  body.title,
          status: 'draft',
          variants: [
            {
              title: 'Default',
              prices: [{ currency_code: 'usd', amount: (body.price ?? 0) * 100 }],
              inventory_quantity: 1,
            },
          ],
        }),
      })
      if (res.ok) {
        const { product } = await res.json()
        // Write Medusa product ID back to Sanity
        const { patchMedusaProductId } = await import('../../../../lib/sanity')
        await patchMedusaProductId(body._id, product.id).catch(console.error)
      }
    }
  }

  // Bust cache
  revalidateTag('products')

  return NextResponse.json({ synced: true })
}
