# Gallery Drop — AI Agent Context

This file is the authoritative context document for AI coding agents working on this repository.
Read this before touching any file.

---

## Project Identity

**What it is**: A "Supreme-style" luxury art gallery e-commerce platform. Each drop releases 1–3 unique sculptures or antiques priced $500–$25,000 every 2–4 weeks. Items are strictly 1-of-1 (single unit inventory).

**Stack**: Next.js 14 App Router · Sanity Studio v3 · Medusa v2 · Supabase PostgreSQL · Stripe · Tailwind CSS · pnpm monorepo with Turborepo

**Deployment target**: Vercel (storefront + API routes, free Hobby tier) · Sanity.io (free tier) · Supabase (free tier, 500 MB)

**Cost constraint**: $0/month fixed infrastructure. Do not add any paid services without explicit approval.

---

## Monorepo Layout

```
e-commerce-drop/
├── apps/
│   ├── storefront/          Next.js 14 App Router — storefront + all API routes
│   └── studio/              Sanity Studio v3 — client-managed CMS
├── backend/                 Medusa v2 — inventory, orders, cart management
├── supabase/migrations/     Raw SQL run in Supabase SQL Editor
├── package.json             pnpm workspace root
├── turbo.json               Turborepo pipeline
└── .env.example             All required env vars documented (no real values)
```

**Run commands** (from repo root):
```bash
pnpm install                    # install all workspaces
pnpm --filter storefront dev    # Next.js storefront on :3000
pnpm --filter studio dev        # Sanity Studio on :3333
pnpm --filter backend dev       # Medusa backend on :9000
```

---

## Environment Variables

All vars live in `apps/storefront/.env.local` (storefront/API routes) and `backend/.env` (Medusa).
See `.env.example` at repo root for the full list. Critical vars:

| Variable | Used by | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | storefront | Sanity GROQ queries |
| `NEXT_PUBLIC_SANITY_DATASET` | storefront | `production` |
| `SANITY_API_TOKEN` | server API routes | Sanity Mutations API write access |
| `SANITY_WEBHOOK_SECRET` | `/api/webhooks/sanity` | Validates Sanity webhook calls |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | storefront + API routes | Medusa REST base URL |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | storefront | Medusa store SDK auth |
| `MEDUSA_ADMIN_SECRET` | server API routes only | Internal Medusa admin calls — never expose to browser |
| `STRIPE_SECRET_KEY` | server API routes only | Stripe Node SDK — never expose to browser |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | browser | Stripe.js initialization |
| `STRIPE_WEBHOOK_SECRET` | `/api/webhooks/stripe` | Signature verification (`whsec_...`) |
| `SUPABASE_URL` | server API routes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | server API routes only | Bypasses RLS — never expose to browser |
| `ADMIN_API_SECRET` | `/api/admin/*` | Bearer token for admin endpoints |
| `ADMIN_EMAIL` | cron job | Receives wire-expiry notification emails |
| `CRON_SECRET` | cron routes | Vercel injects this automatically for scheduled invocations |
| `RESEND_API_KEY` | cron job | Sends admin notification emails (Resend free tier) |
| `RESEND_FROM_EMAIL` | cron job | From address for admin emails |
| `BACKUP_ENCRYPTION_KEY` | backup cron | 64-char hex AES-256 key |
| `BACKUP_DESTINATION_WEBHOOK` | backup cron | POST endpoint that receives encrypted backup blob |
| `DATABASE_URL` | Medusa backend + backup cron | Supabase PostgreSQL connection string |

---

## Database Schema (Supabase PostgreSQL)

Run migrations in `supabase/migrations/` in order via Supabase SQL Editor.

### `product_reservations`
Tracks 48-hour wire-transfer holds on 1-of-1 items.

```sql
id                UUID        PK
cart_id           TEXT        Medusa cart ID
product_id        TEXT        Medusa product ID
stripe_pi_id      TEXT        Stripe PaymentIntent ID
status            TEXT        'reserved' | 'admin_hold' | 'released' | 'completed'
reserved_at       TIMESTAMPTZ when hold was created
expires_at        TIMESTAMPTZ reserved_at + 48 hours (NEVER auto-releases)
admin_notified_at TIMESTAMPTZ when notification email was sent
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ (auto-updated by trigger)
```

**Status lifecycle — critical business rule (Boundary 2)**:
- `reserved` → wire created, 48h window active
- `admin_hold` → 48h expired, cron notified admin, **item stays hidden until owner acts**
- `released` → admin manually released after confirming no wire arrived
- `completed` → Stripe webhook confirmed payment, order fulfilled

**Never** auto-transition `admin_hold` → `released` in code. Only `POST /api/admin/release-item` can do this.

### `processed_webhook_events`
Idempotency log for Stripe webhook events (Boundary 1).

```sql
stripe_event_id  TEXT  PK  (Stripe's event.id, e.g. "evt_...")
event_type       TEXT      e.g. "payment_intent.succeeded"
processed_at     TIMESTAMPTZ
```

---

## Sanity CMS Schema

**Schema file**: `apps/studio/schemaTypes/product.ts`

Document type: `product`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Required, 2–120 chars |
| `slug` | slug | Required, auto-generated from title |
| `price` | number | Required, min $500, whole USD dollars |
| `description` | block[] | Portable Text |
| `images` | image[] | Min 1, each has `alt` field |
| `dropDate` | datetime | UTC, required — drives countdown timer |
| `medusaProductId` | string | Auto-set by Sanity webhook sync, read-only in Studio |
| `weightGrams` | number | Required, for customs |
| `dimensions` | object | `lengthCm`, `widthCm`, `heightCm` — all required |
| `hsCode` | string | Required, e.g. `9703.00` for sculptures |
| `countryOfOrigin` | string | Required, ISO 3166-1 alpha-2 (e.g. `FR`) |
| `status` | string | `upcoming` \| `live` \| `reserved` \| `admin_hold` \| `sold` |

**Webhook from Sanity → storefront**: fires on publish, calls `POST /api/webhooks/sanity`.
The endpoint creates/updates the Medusa product and writes `medusaProductId` back to Sanity.

---

## Payment Tiers — Core Business Logic

Defined in `apps/storefront/types/index.ts`:

```typescript
const WIRE_THRESHOLD_CENTS = 500_000  // $5,000.00

function getCartTier(totalCents: number): 'card' | 'wire'
```

| Cart Total | Payment Method | Stripe Flow |
|-----------|---------------|-------------|
| < $5,000 | Card / Apple Pay / Google Pay | `PaymentIntent` with `automatic_payment_methods` |
| ≥ $5,000 | International Bank Wire ONLY | `PaymentIntent` with `customer_balance` + `us_bank_transfer` |

**At ≥ $5,000, card fields are never rendered.** `WirePaymentModule` completely replaces `StripeCardPayment`.

---

## API Routes Reference

All routes live in `apps/storefront/app/api/`.

### `POST /api/wire-intent`
Creates a Stripe wire PaymentIntent and atomically reserves inventory.

**Request body**:
```typescript
{
  cartId:        string   // Medusa cart ID
  productId:     string   // Medusa product ID
  amountCents:   number   // must be >= 500_000
  customerEmail: string
}
```

**Response**:
```typescript
{
  paymentIntentId: string
  bankDetails: {
    amount_remaining:     number
    currency:             string
    financial_addresses:  FinancialAddress[]
    hosted_instructions_url?: string
    reference:            string
    type:                 string
  } | null
}
```

**Side effects**:
1. Creates/retrieves Stripe Customer by email
2. Creates `customer_balance` PaymentIntent with `us_bank_transfer`
3. Inserts row in `product_reservations` with `expires_at = now + 48h`
4. Sets Medusa product status to `draft` (hides from storefront)

**Error codes**:
- `400` — missing fields or `amountCents < 500_000`
- `409` — product already reserved/sold
- `500` — Stripe or DB failure

---

### `POST /api/payment-intent`
Creates a Stripe PaymentIntent for Tier 1 (card) carts.

**Request body**: `{ cartId: string, amountCents: number }`

**Response**: `{ clientSecret: string }`

Only called when `cart.total < WIRE_THRESHOLD_CENTS`. Used by `StripeCardPayment` to initialize Stripe Elements.

---

### `POST /api/webhooks/stripe`
Secure Stripe event receiver. Implements full idempotency.

**Headers required**: `stripe-signature` (Stripe sends this automatically)

**Verified via**: `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`

**Idempotency flow**:
1. Check `processed_webhook_events` for `event.id`
2. If found → return `200 { received: true, duplicate: true }` (no-op)
3. If not found → process → insert `event.id` into table

**Handled events**:

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Mark order PAID in Medusa · Zero inventory · Update `product_reservations.status = 'completed'` · Update Sanity product `status = 'sold'` · `revalidateTag('products')` |

**Important**: return `500` on processing errors (not `200`) so Stripe retries. The idempotency table prevents double-execution once the error is fixed.

---

### `POST /api/webhooks/sanity`
Receives Sanity product publish events.

**Headers required**: `x-sanity-webhook-secret` (must match `SANITY_WEBHOOK_SECRET` env var)

**Actions**:
- If `medusaProductId` exists → update Medusa product title
- If not → create Medusa product with 1 variant (qty: 1) + write `medusaProductId` back to Sanity via Mutations API
- `revalidateTag('products')`

---

### `POST /api/admin/release-item`
**Protected** — requires `Authorization: Bearer ADMIN_API_SECRET`.

Manually releases a product from `admin_hold` back to the live storefront.
**Only callable after the owner has manually verified their banking dashboard.**

**Request body**: `{ reservationId: string }`

**Guards**:
- Returns `403` if bearer token is wrong
- Returns `409` if `reservation.status !== 'admin_hold'` — cannot release `reserved` (wire may still clear) or `completed` (already sold) items

**Actions on success**:
1. Sets `product_reservations.status = 'released'`
2. Sets Medusa product `status = 'published'`
3. Sets Sanity product `status = 'live'`
4. `revalidateTag('products')`

---

### `GET /api/cron/expire-reservations`
**Vercel Cron** — runs hourly (`0 * * * *`). Protected by `CRON_SECRET`.

Finds `product_reservations` where `status = 'reserved' AND expires_at < now()`.

**For each expired reservation**:
1. Sets `status = 'admin_hold'`
2. Sets `admin_notified_at = now()`
3. Sends detailed HTML email to `ADMIN_EMAIL` via Resend API

**Does NOT**: release the item, update Medusa, update Sanity, or call any other side effects.
The product stays hidden (`draft` in Medusa) until admin manually releases it.

---

### `GET /api/cron/backup`
**Vercel Cron** — runs weekly (`0 3 * * 0`, Sundays at 03:00 UTC). Protected by `CRON_SECRET`.

Full database backup to cold storage (Boundary 3).

**Process**:
1. Queries `information_schema.tables` for all public tables
2. Dumps all rows from each table to a JSON object
3. Serializes to JSON with metadata header (`created_at`, `table_count`, `tables[]`)
4. Encrypts with AES-256-GCM: layout is `[iv (12 bytes) | authTag (16 bytes) | ciphertext]`
5. POSTs the encrypted `Buffer` to `BACKUP_DESTINATION_WEBHOOK` as `application/octet-stream`

**To decrypt a backup**:
```typescript
const key      = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY, 'hex')  // 32 bytes
const iv       = payload.slice(0, 12)
const authTag  = payload.slice(12, 28)
const ct       = payload.slice(28)
const decipher = createDecipheriv('aes-256-gcm', key, iv)
decipher.setAuthTag(authTag)
const plaintext = Buffer.concat([decipher.update(ct), decipher.final()])
```

---

## React Components

All in `apps/storefront/components/`.

### `DropCountdown.tsx`
**`'use client'`** — real-time countdown with zero page refresh on transition.

**Props**: `{ dropDate: string, productId: string, onAddToCart: (id: string) => void }`

**Behaviour**:
- Uses `setInterval(tick, 1000)` to compute `Date.now()` delta
- When delta ≤ 0: `clearInterval` + `setIsLive(true)` — no router push, no fetch
- State A: DD:HH:MM:SS display + disabled "Coming Soon" button
- State B: "Add to Cart →" active button

**Critical**: `computeTimeLeft` returns `null` when drop is past (not zero values). The `null` check is what triggers the state flip.

---

### `CartSummary.tsx`
**`'use client'`** — payment tier router.

**Props**: `{ cartId: string, customerEmail: string }`

**Logic**:
1. On mount: `getCart(cartId)` via Medusa SDK
2. Computes `tier = getCartTier(cart.total)`
3. For `'card'` tier: also fetches `POST /api/payment-intent` to get `clientSecret`
4. Renders **either** `<StripeCardPayment>` **or** `<WirePaymentModule>` — never both

The $5,000 boundary is read from `WIRE_THRESHOLD_CENTS` in `types/index.ts`. Change it there and only there.

---

### `WirePaymentModule.tsx`
**`'use client'`** — wire transfer request UI.

**Props**: `{ cartId, productId, amountCents, customerEmail }`

**States**: idle → loading → `BankDetails` panel (success) / error message (failure)

After `POST /api/wire-intent` succeeds, renders `BankDetails` with:
- Swift account details (account number, BIC/SWIFT code, bank name, country)
- Or ABA routing + account for USD domestic
- Reference code (must be included in wire memo)
- Link to Stripe hosted instructions page

---

### `StripeCardPayment.tsx`
**`'use client'`** — Stripe Elements wrapper for Tier 1.

**Props**: `{ cartId, amountCents, clientSecret, onSuccess }`

Wraps `@stripe/react-stripe-js` `Elements` + `PaymentElement`. Appearance theme uses stone-900 as primary. Wallets: `applePay: 'auto', googlePay: 'auto'`.

Calls `stripe.confirmPayment()` with `return_url = /order/confirmation?cart_id=...`.

---

## Shared Library (`apps/storefront/lib/`)

| File | Exports | Notes |
|------|---------|-------|
| `lib/sanity.ts` | `sanityClient`, `urlFor()`, `ALL_PRODUCTS_QUERY`, `PRODUCT_BY_SLUG_QUERY`, `ALL_PRODUCT_SLUGS_QUERY`, `patchMedusaProductId()`, `updateProductStatus()` | `SANITY_API_TOKEN` only available server-side |
| `lib/stripe.ts` | `stripe` (Node SDK), `getStripe()` (browser singleton) | `stripe` is server-only. Never import in client components. |
| `lib/medusa.ts` | `medusa` (JS SDK), `getOrCreateCart()`, `addLineItem()`, `getCart()` | Uses `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` |
| `lib/db.ts` | `supabase` (service role), `insertReservation()`, `getReservationByStripePI()`, `updateReservationStatus()`, `isWebhookEventProcessed()`, `markWebhookEventProcessed()` | Service role key — **never import in client components** |

---

## Medusa Backend (`backend/`)

**Version**: Medusa v2 (`@medusajs/medusa ^2.7.0`)

**Config**: `backend/medusa-config.ts`
- Database: Supabase PostgreSQL via `DATABASE_URL`
- SSL enforced in production
- Payment provider: `medusa-payment-stripe` (official plugin)
- Stripe `capture: true` — auto-captures Tier 1 card payments

**Admin dashboard**: available at `http://localhost:7001` in development (or your deployed URL)

**Key Medusa concepts used**:
- Products: 1 per artwork, 1 variant, inventory qty = 1
- Status `draft` = hidden from storefront (used during wire reservation hold)
- Status `published` = visible in storefront
- The Medusa admin API is called internally from Next.js API routes using `MEDUSA_ADMIN_SECRET`

---

## Business Rules — Non-Negotiable

### Boundary 1: Idempotency (anti-ghost-order)
- **Every** Stripe webhook handler must check `processed_webhook_events` before acting
- If `event.id` already exists → `return 200 { received: true, duplicate: true }` immediately
- Insert `event.id` **after** successful processing (not before — so retries work if we crash mid-way)
- Do NOT remove or bypass this check for any event type

### Boundary 2: Admin hold (anti-double-sell)
- Expired reservations (`expires_at < now, status = 'reserved'`) MUST transition to `admin_hold`
- `admin_hold` items MUST stay hidden from the storefront indefinitely
- Only `POST /api/admin/release-item` can move `admin_hold` → `released`
- That endpoint has an explicit guard: returns `409` for any status other than `admin_hold`
- **Never add any code path that auto-releases items from `admin_hold` to `released`**

### Boundary 3: Weekly encrypted backup
- Runs every Sunday 03:00 UTC via Vercel Cron
- AES-256-GCM, 96-bit random IV per backup
- Encryption key is 32 bytes stored as 64-char hex in `BACKUP_ENCRYPTION_KEY`
- Backup blob layout: `[IV (12 bytes)][AuthTag (16 bytes)][Ciphertext (N bytes)]`
- Destination is configurable via `BACKUP_DESTINATION_WEBHOOK`

---

## Pages

| Route | Type | Notes |
|-------|------|-------|
| `/` | Server | Fetches all Sanity products, renders drop grid, ISR 60s |
| `/products/[slug]` | Server | Full product detail + `DropCountdown` client island, ISR 30s |
| `/cart` | Server shell + Client | Reads `medusa_cart_id` cookie, renders `CartSummary` |
| `/order/confirmation` | Server | Shows after successful payment, reads `cart_id` query param |

---

## Cache Strategy

Uses Next.js `unstable_cache` with tags:

| Tag | Invalidated by |
|-----|---------------|
| `products` | `/api/webhooks/stripe` (on SOLD), `/api/webhooks/sanity` (on publish), `/api/admin/release-item` (on release) |
| `product-{medusaProductId}` | `/api/webhooks/stripe` on that specific product |

---

## Vercel Cron Configuration

Defined in `apps/storefront/vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/expire-reservations", "schedule": "0 * * * *"  },
    { "path": "/api/cron/backup",              "schedule": "0 3 * * 0"  }
  ]
}
```

Both routes authenticate via `Authorization: Bearer CRON_SECRET`. Vercel injects this header automatically. Test locally by passing the header manually.

---

## Sanity Webhooks Setup

In Sanity Dashboard → API → Webhooks, create:

| Setting | Value |
|---------|-------|
| URL | `https://yourdomain.com/api/webhooks/sanity` |
| Trigger on | Create, Update |
| Filter | `_type == "product"` |
| HTTP method | POST |
| Secret | Set to value of `SANITY_WEBHOOK_SECRET` env var |
| Header name | `x-sanity-webhook-secret` |

---

## Stripe Webhooks Setup

In Stripe Dashboard → Developers → Webhooks, create:

| Setting | Value |
|---------|-------|
| Endpoint URL | `https://yourdomain.com/api/webhooks/stripe` |
| Events to listen for | `payment_intent.succeeded` |
| Signing secret | Copy to `STRIPE_WEBHOOK_SECRET` env var |

Test locally with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

---

## TypeScript Types

All shared types in `apps/storefront/types/index.ts`:

- `SanityProduct` — full product document from GROQ
- `SanityProductListItem` — lightweight list view fields
- `SanityImageAsset` — Sanity image reference type
- `ProductStatus` — `'upcoming' | 'live' | 'reserved' | 'admin_hold' | 'sold'`
- `CartTier` — `'card' | 'wire'`
- `WIRE_THRESHOLD_CENTS` — `500_000` ($5,000 in cents)
- `getCartTier(totalCents)` — returns `CartTier`
- `WireIntentRequest` / `WireIntentResponse` — API contract types
- `BankTransferInstructions` / `FinancialAddress` — Stripe bank transfer types
- `ReservationStatus` — DB enum type
- `ProductReservation` — full DB row type
