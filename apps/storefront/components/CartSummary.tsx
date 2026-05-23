'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StripeCardPayment from './StripeCardPayment'
import WirePaymentModule from './WirePaymentModule'
import { getCart } from '../lib/medusa'
import { getCartTier, WIRE_THRESHOLD_CENTS } from '../types'

interface CartSummaryProps {
  cartId:        string
  customerEmail: string
}

function formatUSD(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(cents / 100)
}

export default function CartSummary({ cartId, customerEmail }: CartSummaryProps) {
  const router = useRouter()
  const [cart,           setCart]           = useState<Awaited<ReturnType<typeof getCart>> | null>(null)
  const [clientSecret,   setClientSecret]   = useState<string | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getCart(cartId)
        setCart(data)

        const totalCents = data.total ?? 0
        // Only fetch a Stripe PaymentIntent for Tier 1 (card) carts
        if (getCartTier(totalCents) === 'card') {
          const res = await fetch('/api/payment-intent', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ cartId }),
          })
          const { clientSecret: cs } = await res.json()
          setClientSecret(cs)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cart')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [cartId])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="text-sm tracking-widest uppercase text-stone-400 animate-pulse">
          Loading cart…
        </span>
      </div>
    )
  }

  if (error || !cart) {
    return (
      <p className="text-center text-sm text-red-600 py-16" role="alert">
        {error ?? 'Cart not found.'}
      </p>
    )
  }

  const totalCents = cart.total ?? 0
  const tier       = getCartTier(totalCents)

  // Derive the first product ID from the cart line items (1-of-1 cart always has 1 item)
  const firstItem  = cart.items?.[0]
  const productId  = (firstItem?.variant?.product_id) ?? ''

  return (
    <div className="flex flex-col gap-10 max-w-lg mx-auto">
      {/* Order summary */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xs tracking-[0.3em] uppercase text-stone-400">Order Summary</h2>

        <div className="mt-4 flex flex-col divide-y divide-stone-100">
          {cart.items?.map((item) => (
            <div key={item.id} className="flex justify-between py-4 text-sm">
              <span className="text-stone-700">{item.title}</span>
              <span className="tabular-nums text-stone-900">
                {formatUSD(item.unit_price ?? 0)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4 border-t border-stone-200">
          <span className="text-sm text-stone-600">Total</span>
          <span className="text-lg font-light tabular-nums text-stone-900">
            {formatUSD(totalCents)}
          </span>
        </div>
      </div>

      {/* Payment tier indicator */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            tier === 'wire' ? 'bg-amber-500' : 'bg-green-500'
          }`}
        />
        <p className="text-xs tracking-widest uppercase text-stone-400">
          {tier === 'wire'
            ? `Wire Transfer Required (≥ ${formatUSD(WIRE_THRESHOLD_CENTS)})`
            : 'Card & Digital Wallet Accepted'}
        </p>
      </div>

      {/* Payment module — mutually exclusive */}
      {tier === 'wire' ? (
        <WirePaymentModule
          cartId={cartId}
          productId={productId}
          amountCents={totalCents}
          customerEmail={customerEmail}
        />
      ) : clientSecret ? (
        <StripeCardPayment
          cartId={cartId}
          amountCents={totalCents}
          clientSecret={clientSecret}
          onSuccess={() => router.push(`/order/confirmation?cart_id=${cartId}`)}
        />
      ) : (
        <div className="flex justify-center py-8">
          <span className="text-sm text-stone-400 animate-pulse">Preparing checkout…</span>
        </div>
      )}
    </div>
  )
}
