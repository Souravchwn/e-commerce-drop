# React Components

All in `apps/storefront/components/`.

---

## `DropCountdown.tsx`
`'use client'` — real-time countdown, zero page refresh on transition.

**Props**: `{ dropDate: string, productId: string, onAddToCart: (id: string) => void }`

**Behaviour**:
- `setInterval(tick, 1000)` computes `Date.now()` delta
- When delta ≤ 0: `clearInterval` + `setIsLive(true)` — no router push, no fetch
- State A (pre-drop): DD:HH:MM:SS display + disabled "Coming Soon" button
- State B (live): "Add to Cart →" active button

**Critical**: `computeTimeLeft` returns `null` when drop is past (not zero values). The `null` check triggers the state flip — never change this to return `0` values.

---

## `CartSummary.tsx`
`'use client'` — payment tier router.

**Props**: `{ cartId: string, customerEmail: string }`

**Logic**:
1. On mount: `getCart(cartId)` via Medusa SDK
2. Computes `tier = getCartTier(cart.total)` (threshold from `types/index.ts`)
3. For `'card'` tier: fetches `POST /api/payment-intent` → gets `clientSecret`
4. Renders **either** `<StripeCardPayment>` **or** `<WirePaymentModule>` — **never both**

Never render both components simultaneously regardless of tier logic.

---

## `WirePaymentModule.tsx`
`'use client'` — wire transfer request UI.

**Props**: `{ cartId: string, productId: string, amountCents: number, customerEmail: string }`

**States**: `idle` → `loading` → `BankDetails` panel (success) / error message (failure)

**After `POST /api/wire-intent` succeeds**, renders `BankDetails` with:
- Swift account details (account number, BIC/SWIFT, bank name, country)
- Or ABA routing + account for USD domestic
- Reference code (must be in wire memo)
- Link to Stripe hosted instructions page

---

## `StripeCardPayment.tsx`
`'use client'` — Stripe Elements wrapper for Tier 1.

**Props**: `{ cartId: string, amountCents: number, clientSecret: string, onSuccess: () => void }`

- Wraps `@stripe/react-stripe-js` `Elements` + `PaymentElement`
- Appearance theme: `stone-900` as primary
- Wallets: `applePay: 'auto'`, `googlePay: 'auto'`
- Calls `stripe.confirmPayment()` with `return_url = /order/confirmation?cart_id=...`
