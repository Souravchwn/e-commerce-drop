import { NextResponse } from 'next/server'
import { stripe }       from '../../../lib/stripe'

export const runtime = 'nodejs'

// Creates a Stripe PaymentIntent for Tier 1 (card / Apple Pay / Google Pay) carts.
// Called client-side from CartSummary when cart total < $5,000.
export async function POST(req: Request): Promise<Response> {
  let body: { cartId: string; amountCents: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cartId, amountCents } = body

  if (!cartId) {
    return NextResponse.json({ error: 'cartId required' }, { status: 400 })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        cart_id: cartId,
        tier:    'card',
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('[payment-intent]', err)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 },
    )
  }
}
