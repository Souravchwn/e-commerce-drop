import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'
import { supabase } from '../../../lib/db'
import type { WireIntentRequest, WireIntentResponse } from '../../../types'

export const runtime = 'nodejs'

export async function POST(req: Request): Promise<Response> {
  let body: WireIntentRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cartId, productId, amountCents, customerEmail } = body

  // ── Validate inputs ──────────────────────────────────────────────────────────
  if (!cartId || !productId || !customerEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (typeof amountCents !== 'number' || amountCents < 500_000) {
    return NextResponse.json(
      { error: 'Wire transfers only available for orders ≥ $5,000' },
      { status: 400 },
    )
  }

  // ── Guard: reject if item is already reserved or sold ────────────────────────
  const { data: existing } = await supabase
    .from('product_reservations')
    .select('id, status')
    .eq('product_id', productId)
    .in('status', ['reserved', 'admin_hold', 'completed'])
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'This item is no longer available' },
      { status: 409 },
    )
  }

  try {
    // ── Create or retrieve Stripe Customer ────────────────────────────────────
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    })
    const customer =
      existingCustomers.data[0] ??
      (await stripe.customers.create({ email: customerEmail }))

    // ── Create Stripe PaymentIntent (customer_balance → bank wire) ────────────
    // Stripe's `customer_balance` method issues a virtual bank account.
    // The buyer sends a SWIFT wire to that account. Stripe reconciles the
    // incoming wire and fires payment_intent.succeeded once funds settle.
    const paymentIntent = await stripe.paymentIntents.create({
      amount:               amountCents,
      currency:             'usd',
      payment_method_types: ['customer_balance'],
      payment_method_data:  { type: 'customer_balance' },
      confirm:              true,
      customer:             customer.id,
      payment_method_options: {
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            // us_bank_transfer issues ABA routing + account number.
            // International payers wire USD to that account via SWIFT.
            type: 'us_bank_transfer',
            requested_address_types: ['aba'],
          },
        },
      },
      metadata: {
        cart_id:    cartId,
        product_id: productId,
        tier:       'wire',
      },
    })

    // ── Atomic 48-hour reservation ────────────────────────────────────────────
    // expires_at is set but NEVER auto-releases the item — the hourly cron
    // transitions expired rows to 'admin_hold' and notifies the owner.
    const reservedAt  = new Date()
    const expiresAt   = new Date(reservedAt.getTime() + 48 * 60 * 60 * 1000)

    const { error: dbError } = await supabase
      .from('product_reservations')
      .insert({
        cart_id:      cartId,
        product_id:   productId,
        stripe_pi_id: paymentIntent.id,
        status:       'reserved',
        reserved_at:  reservedAt.toISOString(),
        expires_at:   expiresAt.toISOString(),
      })

    if (dbError) throw new Error(`Reservation insert failed: ${dbError.message}`)

    // ── Draft the Medusa product (hides it from storefront) ───────────────────
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    if (medusaUrl && productId.startsWith('prod_')) {
      await fetch(`${medusaUrl}/admin/products/${productId}`, {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${process.env.MEDUSA_ADMIN_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'draft' }),
      }).catch(console.error) // non-fatal — reservation is the source of truth
    }

    // ── Return bank transfer instructions to the frontend ─────────────────────
    const bankDetails =
      paymentIntent.next_action?.display_bank_transfer_instructions ?? null

    const response: WireIntentResponse = {
      paymentIntentId: paymentIntent.id,
      bankDetails:     bankDetails as WireIntentResponse['bankDetails'],
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[wire-intent]', err)
    return NextResponse.json(
      { error: 'Failed to create wire intent. Please try again.' },
      { status: 500 },
    )
  }
}
