import { revalidateTag } from 'next/cache'
import { NextResponse }   from 'next/server'
import type Stripe        from 'stripe'
import { stripe }         from '../../../../lib/stripe'
import {
  isWebhookEventProcessed,
  markWebhookEventProcessed,
  getReservationByStripePI,
  updateReservationStatus,
} from '../../../../lib/db'
import { updateProductStatus } from '../../../../lib/sanity'

// Must be nodejs runtime — Web Crypto API doesn't support Stripe's HMAC-SHA256
export const runtime = 'nodejs'

// Tell Next.js not to parse the body — we need the raw buffer for sig verification
export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<Response> {
  // ── 1. Read raw body (required for Stripe signature verification) ───────────
  const rawBody = Buffer.from(await req.arrayBuffer())
  const sig     = req.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  // ── 2. Verify cryptographic signature ────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return new Response('Invalid Stripe signature', { status: 400 })
  }

  // ── 3. Idempotency check (Boundary 1) ─────────────────────────────────────────
  // Stripe retries webhooks up to 72 hours on non-2xx responses.
  // We deduplicate by storing processed event IDs in PostgreSQL.
  const alreadyProcessed = await isWebhookEventProcessed(event.id)
  if (alreadyProcessed) {
    // Safe no-op — return 200 so Stripe stops retrying this event
    return NextResponse.json({ received: true, duplicate: true })
  }

  // ── 4. Route event types ──────────────────────────────────────────────────────
  try {
    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
    }
    // Additional events can be handled here as the platform grows:
    // 'payment_intent.payment_failed'
    // 'customer.subscription.deleted'
  } catch (err) {
    console.error(`[stripe-webhook] Error handling event ${event.id}:`, err)
    // Return 500 so Stripe retries — our idempotency table prevents double-execution
    // once the issue is resolved and the handler succeeds.
    return new Response('Internal processing error', { status: 500 })
  }

  // ── 5. Record event as processed — prevents re-execution on retries ───────────
  await markWebhookEventProcessed(event.id, event.type)

  return NextResponse.json({ received: true })
}

// ── Handler: payment settled ──────────────────────────────────────────────────

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  const { cart_id, product_id } = pi.metadata

  if (!product_id) {
    console.warn('[stripe-webhook] payment_intent.succeeded missing product_id in metadata')
    return
  }

  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const authHeader = { Authorization: `Bearer ${process.env.MEDUSA_ADMIN_SECRET}`, 'Content-Type': 'application/json' }

  // ── a. Mark order as PAID in Medusa ──────────────────────────────────────────
  if (medusaUrl && cart_id) {
    await fetch(`${medusaUrl}/admin/orders?cart_id=${cart_id}`, {
      headers: authHeader,
    })
      .then((r) => r.json())
      .then(async ({ orders }) => {
        const orderId = orders?.[0]?.id
        if (orderId) {
          await fetch(`${medusaUrl}/admin/orders/${orderId}/capture`, {
            method:  'POST',
            headers: authHeader,
          })
        }
      })
      .catch((err) => console.error('[stripe-webhook] Medusa order update failed:', err))
  }

  // ── b. Mark item as SOLD in Medusa (zero inventory) ──────────────────────────
  if (medusaUrl && product_id.startsWith('prod_')) {
    // Fetch variants first to get variant IDs
    const variantsRes = await fetch(`${medusaUrl}/admin/products/${product_id}`, {
      headers: authHeader,
    }).catch(() => null)

    if (variantsRes?.ok) {
      const { product } = await variantsRes.json()
      for (const variant of product?.variants ?? []) {
        await fetch(`${medusaUrl}/admin/variants/${variant.id}/inventory-items`, {
          method:  'GET',
          headers: authHeader,
        })
          .then((r) => r.json())
          .then(async ({ inventory_items }) => {
            for (const item of inventory_items ?? []) {
              await fetch(`${medusaUrl}/admin/inventory-items/${item.id}`, {
                method:  'POST',
                headers: authHeader,
                body:    JSON.stringify({ stocked_quantity: 0 }),
              })
            }
          })
          .catch(console.error)
      }
    }
  }

  // ── c. Update reservation status to 'completed' ───────────────────────────────
  const reservation = await getReservationByStripePI(pi.id)
  if (reservation) {
    await updateReservationStatus(reservation.id, 'completed')
  }

  // ── d. Update Sanity product status to 'sold' ─────────────────────────────────
  // Sanity _id is not stored in Stripe metadata; look it up via product_id.
  // For now we update via a GROQ query — in production you'd store sanity_id in metadata.
  try {
    const { sanityClient } = await import('../../../../lib/sanity')
    const sanityProduct = await sanityClient.fetch<{ _id: string } | null>(
      `*[_type == "product" && medusaProductId == $id][0] { _id }`,
      { id: product_id },
    )
    if (sanityProduct) {
      await updateProductStatus(sanityProduct._id, 'sold')
    }
  } catch (err) {
    // Non-fatal — Medusa is the source of truth for inventory
    console.error('[stripe-webhook] Sanity status update failed:', err)
  }

  // ── e. Bust Next.js data cache ─────────────────────────────────────────────────
  revalidateTag('products')
  if (product_id) revalidateTag(`product-${product_id}`)

  console.log(`[stripe-webhook] payment_intent.succeeded processed: pi=${pi.id} product=${product_id}`)
}
