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
  const [email,        setEmail]        = useState(customerEmail)
  const [emailTouched, setEmailTouched] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getCart(cartId)
        setCart(data)

        const totalCents = data.total ?? 0
        const productId  = data.items?.[0]?.variant?.product_id ?? ''

        if (getCartTier(totalCents) === 'card') {
          const res = await fetch('/api/payment-intent', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ cartId, amountCents: totalCents, productId }),
          })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.error ?? `Payment intent failed (${res.status})`)
          }
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
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-s-border border-t-s-fg animate-spin" />
          <p className="text-xs text-s-muted">Loading your cart…</p>
        </div>
      </div>
    )
  }

  if (error || !cart) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
        <p className="text-sm text-s-red font-semibold" role="alert">{error ?? 'Cart not found.'}</p>
        <a href="/" className="text-xs text-s-muted hover:text-s-fg transition-colors">← Back to shop</a>
      </div>
    )
  }

  const totalCents = cart.total ?? 0
  const tier       = getCartTier(totalCents)
  const firstItem  = cart.items?.[0]
  const productId  = firstItem?.variant?.product_id ?? ''

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const emailError = emailTouched && !emailValid

  return (
    <div>
      {/* ── Line items ────────────────────────────────────── */}
      <div className="border-b border-s-border">
        {cart.items?.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 px-4 py-4 border-b border-s-border last:border-b-0"
          >
            <span className="text-sm text-s-fg leading-snug flex-1">{item.title}</span>
            <span className="text-sm font-semibold tabular-nums text-s-fg whitespace-nowrap shrink-0">
              {formatUSD(item.unit_price ?? 0)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Total ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-s-border">
        <span className="text-xs uppercase tracking-widest text-s-muted font-semibold">Total</span>
        <span className="text-2xl font-bold tabular-nums text-s-fg">{formatUSD(totalCents)}</span>
      </div>

      {/* ── Payment tier label ────────────────────────────── */}
      <div className="px-4 py-2 bg-s-bg-sub border-b border-s-border">
        <p className="text-2xs text-s-muted uppercase tracking-widest">
          {tier === 'wire'
            ? `Wire transfer required (≥ ${formatUSD(WIRE_THRESHOLD_CENTS)})`
            : 'Card · Apple Pay · Google Pay'}
        </p>
      </div>

      {/* ── Contact email ─────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-s-border">
        <label
          htmlFor="checkout-email"
          className="block text-2xs font-semibold uppercase tracking-widest text-s-muted mb-2"
        >
          {tier === 'wire' ? 'Contact email *' : 'Contact email'}
        </label>
        <input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          placeholder="your@email.com"
          className="w-full border border-s-border bg-s-bg text-s-fg text-sm px-3 py-2.5 placeholder:text-s-muted focus:border-s-fg focus:outline-none"
          aria-invalid={emailError}
          aria-describedby={emailError ? 'email-err' : undefined}
        />
        {emailError && (
          <p id="email-err" className="text-2xs text-s-red mt-1" role="alert">
            Enter a valid email address.
          </p>
        )}
      </div>

      {/* ── Payment module ────────────────────────────────── */}
      <div className="px-4 py-6">
        {tier === 'wire' ? (
          emailValid ? (
            <WirePaymentModule
              cartId={cartId}
              productId={productId}
              amountCents={totalCents}
              customerEmail={email.trim()}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-s-muted">Enter your email above to continue.</p>
              <button
                onClick={() => setEmailTouched(true)}
                className="w-full bg-s-fg/30 text-s-bg text-xs font-semibold uppercase tracking-widest py-4 cursor-not-allowed"
                disabled
              >
                Request Bank Wire Details
              </button>
            </div>
          )
        ) : clientSecret ? (
          <StripeCardPayment
            cartId={cartId}
            amountCents={totalCents}
            clientSecret={clientSecret}
            onSuccess={() => router.push(`/order/confirmation?cart_id=${cartId}`)}
          />
        ) : (
          <div className="flex items-center justify-center gap-3 py-12">
            <div className="w-5 h-5 border-2 border-s-border border-t-s-fg animate-spin" />
            <p className="text-xs text-s-muted">Preparing checkout…</p>
          </div>
        )}
      </div>
    </div>
  )
}
