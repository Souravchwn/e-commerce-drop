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
  const [cart,         setCart]         = useState<Awaited<ReturnType<typeof getCart>> | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getCart(cartId)
        setCart(data)

        const totalCents = data.total ?? 0
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
      <div className="flex justify-center py-12">
        <span className="text-[11px] uppercase tracking-[0.12em] text-[#767676] animate-pulse">
          Loading…
        </span>
      </div>
    )
  }

  if (error || !cart) {
    return (
      <p className="text-[13px] text-[#cc0000] py-8 text-center" role="alert">
        {error ?? 'Cart not found.'}
      </p>
    )
  }

  const totalCents = cart.total ?? 0
  const tier       = getCartTier(totalCents)
  const firstItem  = cart.items?.[0]
  const productId  = firstItem?.variant?.product_id ?? ''

  return (
    <div className="flex flex-col gap-0">
      {/* Line items */}
      <div className="border-t border-[#d4d4d4]">
        {cart.items?.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-start py-4 border-b border-[#d4d4d4] gap-4"
          >
            <span className="text-[13px] text-black leading-snug">{item.title}</span>
            <span className="text-[13px] tabular-nums text-black whitespace-nowrap">
              {formatUSD(item.unit_price ?? 0)}
            </span>
          </div>
        ))}

        {/* Total row */}
        <div className="flex justify-between items-baseline py-4 border-b border-[#d4d4d4]">
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#767676]">Total</span>
          <span className="text-[20px] tabular-nums text-black">{formatUSD(totalCents)}</span>
        </div>
      </div>

      {/* Payment tier label */}
      <p className="py-4 text-[11px] uppercase tracking-[0.1em] text-[#767676] border-b border-[#d4d4d4]">
        {tier === 'wire'
          ? `Wire Transfer Required (≥ ${formatUSD(WIRE_THRESHOLD_CENTS)})`
          : 'Card · Apple Pay · Google Pay'}
      </p>

      {/* Payment module — mutually exclusive */}
      <div className="pt-6">
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
            <span className="text-[11px] uppercase tracking-[0.12em] text-[#767676] animate-pulse">
              Preparing checkout…
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
