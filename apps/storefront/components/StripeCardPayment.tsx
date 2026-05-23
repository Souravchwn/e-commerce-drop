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
  cartId:          string
  amountCents:     number
  clientSecret:    string
  onSuccess:       () => void
}

function CheckoutForm({ cartId, onSuccess }: { cartId: string; onSuccess: () => void }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [error,  setError]   = useState<string | null>(null)
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />

      {error && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-stone-900 text-white text-sm tracking-widest uppercase
                   py-4 px-8 hover:bg-stone-700 transition-colors duration-200
                   disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>

      <p className="text-center text-xs text-stone-400">
        Secured by Stripe · Card, Apple Pay & Google Pay accepted
      </p>
    </form>
  )
}

export default function StripeCardPayment({
  cartId,
  amountCents,
  clientSecret,
  onSuccess,
}: StripeCardPaymentProps) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary:      '#1c1917', // stone-900
            colorBackground:   '#ffffff',
            colorText:         '#1c1917',
            colorDanger:       '#dc2626',
            fontFamily:        'Inter, sans-serif',
            spacingUnit:       '4px',
            borderRadius:      '0px',
          },
        },
        currency: 'usd',
        amount:   amountCents,
      }}
    >
      <CheckoutForm cartId={cartId} onSuccess={onSuccess} />
    </Elements>
  )
}
