'use client'

import { useState } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { getStripe } from '../lib/stripe'

interface StripeCardPaymentProps {
  cartId:       string
  amountCents:  number
  clientSecret: string
  onSuccess:    () => void
}

function CheckoutForm({ cartId, onSuccess }: { cartId: string; onSuccess: () => void }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmation?cart_id=${cartId}`,
      },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed. Please try again.')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement
        options={{
          layout:  'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />

      {error && (
        <p className="text-xs text-s-red" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-s-fg text-s-bg text-xs font-semibold uppercase tracking-widest py-4 hover:bg-s-red hover:text-white transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>

      <p className="text-center text-2xs text-s-muted">
        Secured by Stripe · Card, Apple Pay & Google Pay
      </p>
    </form>
  )
}

function getAppearance(isDark: boolean) {
  return {
    theme: (isDark ? 'night' : 'stripe') as 'night' | 'stripe',
    variables: {
      colorPrimary:    isDark ? '#FFFFFF' : '#000000',
      colorBackground: isDark ? '#141414' : '#FFFFFF',
      colorText:       isDark ? '#FFFFFF' : '#000000',
      colorDanger:     '#E8112D',
      fontFamily:      'var(--font-inter), "Helvetica Neue", Helvetica, Arial, sans-serif',
      spacingUnit:     '4px',
      borderRadius:    '0px',
    },
    rules: {
      '.Input': {
        border:          isDark ? '1px solid #2C2C2C' : '1px solid #DBDBDB',
        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
        color:           isDark ? '#FFFFFF' : '#000000',
        boxShadow:       'none',
      },
      '.Input:focus': {
        border:          isDark ? '1px solid #FFFFFF' : '1px solid #000000',
        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
        boxShadow:       'none',
      },
      '.Label': {
        color:         isDark ? '#8A8A8A' : '#767676',
        fontSize:      '10px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      },
    },
  }
}

export default function StripeCardPayment({ cartId, amountCents, clientSecret, onSuccess }: StripeCardPaymentProps) {
  // Read the class applied by the inline <script> in layout — already accurate at mount time.
  const [isDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  })

  return (
    <Elements
      stripe={getStripe()}
      options={{ clientSecret, appearance: getAppearance(isDark) }}
    >
      <CheckoutForm cartId={cartId} onSuccess={onSuccess} />
    </Elements>
  )
}
