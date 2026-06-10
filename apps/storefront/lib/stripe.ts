import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe as StripeClient } from '@stripe/stripe-js'

// ── Server-side Stripe instance (Node SDK) ────────────────────────────────────
// Only import this in API routes / server components. Never expose STRIPE_SECRET_KEY
// to the browser.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript:  true,
  appInfo: {
    name:    'gallery-drop',
    version: '1.0.0',
  },
})

// ── Browser-side Stripe singleton (Stripe.js) ─────────────────────────────────
// Lazily initialised to avoid loading Stripe.js on pages that don't need it.
let stripePromise: Promise<StripeClient | null>

export function getStripe(): Promise<StripeClient | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
