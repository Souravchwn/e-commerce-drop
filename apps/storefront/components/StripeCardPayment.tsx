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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />

      {error && (
        <p className="text-[13px] text-[#cc0000] text-center" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-black text-white text-[11px] tracking-[0.15em] uppercase py-5 px-4 hover:bg-[#333] transition-colors disabled:bg-[#f5f5f5] disabled:text-[#767676] disabled:cursor-not-allowed"
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>

      <p className="text-center text-[11px] text-[#767676]">
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
            colorPrimary:    '#000000',
            colorBackground: '#ffffff',
            colorText:       '#000000',
            colorDanger:     '#cc0000',
            fontFamily:      '"Helvetica Neue", Helvetica, Arial, sans-serif',
            spacingUnit:     '4px',
            borderRadius:    '0px',
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
