import { NextResponse } from 'next/server'
import { stripe }       from '../../../lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: Request): Promise<Response> {
  let body: { cartId: string; amountCents: number; productId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cartId, amountCents, productId } = body

  if (!cartId) {
    return NextResponse.json({ error: 'cartId required' }, { status: 400 })
  }
  if (typeof amountCents !== 'number' || amountCents < 50) {
    return NextResponse.json({ error: 'amountCents must be a number ≥ 50' }, { status: 400 })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        cart_id:    cartId,
        product_id: productId ?? '',
        tier:       'card',
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
