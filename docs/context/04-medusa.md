# Medusa Backend

**Version**: Medusa v2 (`@medusajs/medusa ^2.7.0`)
**Config file**: `backend/medusa-config.ts`
**Admin dashboard**: `http://localhost:7001` (dev) or deployed URL

---

## Configuration
- **Database**: Supabase PostgreSQL via `DATABASE_URL`, SSL enforced in production
- **Payment provider**: `medusa-payment-stripe` (official plugin)
- **Stripe `capture: true`** — auto-captures Tier 1 card payments

---

## Key Concepts

| Concept | Usage in this project |
|---------|----------------------|
| Products | 1 per artwork, 1 variant, inventory qty = 1 |
| `draft` status | Hidden from storefront — used during wire reservation hold |
| `published` status | Visible in storefront |

Medusa admin API is called **internally** from Next.js API routes using `MEDUSA_ADMIN_SECRET`. Never expose this secret to the browser.

---

## Lib Functions (`lib/medusa.ts`)

Uses `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (public — safe in browser).

| Export | Purpose |
|--------|---------|
| `medusa` | Medusa JS SDK instance |
| `getOrCreateCart()` | Gets or creates a Medusa cart |
| `addLineItem(cartId, variantId, qty)` | Adds item to cart |
| `getCart(cartId)` | Fetches cart with totals |

---

## Product Status Flow
```
published  →  draft        (wire intent created — /api/wire-intent)
draft      →  published    (admin releases — /api/admin/release-item)
draft      →  (stays)      (wire payment confirmed — Stripe webhook zeros inventory, Sanity marks sold)
```

When `payment_intent.succeeded` fires:
- Medusa inventory zeroed (qty set to 0)
- Sanity `status` → `sold`
- Product remains `published` (storefront shows "sold" state via Sanity status)
