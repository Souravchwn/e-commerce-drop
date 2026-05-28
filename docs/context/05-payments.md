# Payment System

Defined in `apps/storefront/types/index.ts`.

---

## Payment Tiers

```typescript
const WIRE_THRESHOLD_CENTS = 500_000  // $5,000.00

function getCartTier(totalCents: number): 'card' | 'wire'
```

| Cart Total | Tier | Payment Method | Stripe Flow |
|-----------|------|---------------|-------------|
| < $5,000 | `card` | Card / Apple Pay / Google Pay | `PaymentIntent` with `automatic_payment_methods` |
| ≥ $5,000 | `wire` | International Bank Wire ONLY | `PaymentIntent` with `customer_balance` + `us_bank_transfer` |

**At ≥ $5,000, card fields are NEVER rendered.** `WirePaymentModule` completely replaces `StripeCardPayment`.

Change the threshold in `types/index.ts` only — `WIRE_THRESHOLD_CENTS` is the single source of truth.

---

## Tier 1 — Card Flow

1. `CartSummary` detects `tier = 'card'`
2. Calls `POST /api/payment-intent` → gets `clientSecret`
3. Renders `<StripeCardPayment clientSecret={...} />`
4. User pays → `stripe.confirmPayment()` → redirects to `/order/confirmation`
5. Stripe sends `payment_intent.succeeded` webhook → order fulfilled

---

## Tier 2 — Wire Flow

1. `CartSummary` detects `tier = 'wire'`
2. Renders `<WirePaymentModule />` (no card fields at all)
3. User clicks "Request Wire Details"
4. Calls `POST /api/wire-intent` → creates `customer_balance` PaymentIntent
5. Atomically: reserves inventory, sets Medusa product to `draft`, inserts DB row
6. Returns bank details (SWIFT/ABA, reference code, hosted instructions URL)
7. User initiates wire from their bank (outside Stripe)
8. 48h window: if wire clears → `payment_intent.succeeded` webhook fires
9. If 48h expires → cron transitions to `admin_hold`, notifies admin

---

## Stripe Setup (`lib/stripe.ts`)

| Export | Context | Notes |
|--------|---------|-------|
| `stripe` | Server only | Node SDK, uses `STRIPE_SECRET_KEY` |
| `getStripe()` | Browser | Singleton, uses `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |

**Never import `stripe` (server) in client components.**

---

## Stripe Webhook Setup
| Setting | Value |
|---------|-------|
| Endpoint URL | `https://yourdomain.com/api/webhooks/stripe` |
| Events | `payment_intent.succeeded` |
| Signing secret | → `STRIPE_WEBHOOK_SECRET` env var |

Test locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```
