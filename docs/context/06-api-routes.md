# API Routes

All routes live in `apps/storefront/app/api/`.

---

## POST `/api/wire-intent`
Creates a Stripe wire PaymentIntent and atomically reserves inventory.

**Auth**: none (public — cart must contain valid product)

**Request**:
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

**Side effects** (all atomic):
1. Creates/retrieves Stripe Customer by email
2. Creates `customer_balance` PaymentIntent with `us_bank_transfer`
3. Inserts row in `product_reservations` (`expires_at = now + 48h`, `status = 'reserved'`)
4. Sets Medusa product status to `draft` (hidden from storefront)

**Error codes**:
- `400` — missing fields or `amountCents < 500_000`
- `409` — product already reserved or sold
- `500` — Stripe or DB failure

---

## POST `/api/payment-intent`
Creates a Stripe PaymentIntent for Tier 1 (card) carts.

**Auth**: none

**Request**: `{ cartId: string, amountCents: number }`

**Response**: `{ clientSecret: string }`

Only called when `cart.total < WIRE_THRESHOLD_CENTS`. Used by `StripeCardPayment` to initialize Stripe Elements.

---

## POST `/api/webhooks/stripe`
Secure Stripe event receiver with full idempotency.

**Auth**: `stripe-signature` header (Stripe signs automatically)

**Verification**: `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`

**Idempotency flow**:
1. Check `processed_webhook_events` for `event.id`
2. Found → return `200 { received: true, duplicate: true }` immediately (no-op)
3. Not found → process → insert `event.id` (insert happens AFTER success so retries work)

**Handled events**:
| Event | Actions |
|-------|---------|
| `payment_intent.succeeded` | Mark order PAID in Medusa · Zero inventory · `product_reservations.status = 'completed'` · Sanity `status = 'sold'` · `revalidateTag('products')` |

**Important**: return `500` on processing errors (not `200`) so Stripe retries. Idempotency table prevents double-execution once error is fixed.

---

## POST `/api/webhooks/sanity`
Receives Sanity product publish events.

**Auth**: `x-sanity-webhook-secret` header must match `SANITY_WEBHOOK_SECRET`

**Actions**:
- If `medusaProductId` exists → update Medusa product title
- If not → create Medusa product (1 variant, qty 1) + write `medusaProductId` back to Sanity
- `revalidateTag('products')`

---

## POST `/api/admin/release-item`
Manually releases a product from `admin_hold` back to the storefront.

**Auth**: `Authorization: Bearer ADMIN_API_SECRET` (required)

**Request**: `{ reservationId: string }`

**Guards**:
- `403` — wrong bearer token
- `409` — `reservation.status !== 'admin_hold'` (cannot release `reserved` or `completed`)

**Actions on success**:
1. `product_reservations.status = 'released'`
2. Medusa product `status = 'published'`
3. Sanity product `status = 'live'`
4. `revalidateTag('products')`

**Rule**: Only callable after owner has manually verified their banking dashboard. Never call programmatically from any automated flow.

---

## GET `/api/cron/expire-reservations`
Vercel Cron — runs hourly (`0 * * * *`).

**Auth**: `Authorization: Bearer CRON_SECRET` (Vercel injects automatically)

**Query**: `product_reservations WHERE status = 'reserved' AND expires_at < now()`

**For each expired reservation**:
1. `status = 'admin_hold'`
2. `admin_notified_at = now()`
3. Sends HTML email to `ADMIN_EMAIL` via Resend API

**Does NOT**: release the item, update Medusa, update Sanity, or trigger any other side effects. Product stays hidden until admin acts.

---

## GET `/api/cron/backup`
Vercel Cron — runs weekly (`0 3 * * 0`, Sundays 03:00 UTC).

**Auth**: `Authorization: Bearer CRON_SECRET`

**Process**:
1. Queries `information_schema.tables` for all public tables
2. Dumps all rows to JSON object
3. Serializes with metadata header (`created_at`, `table_count`, `tables[]`)
4. Encrypts with AES-256-GCM: layout `[IV (12 bytes)][AuthTag (16 bytes)][Ciphertext]`
5. POSTs encrypted `Buffer` to `BACKUP_DESTINATION_WEBHOOK` as `application/octet-stream`

**Decrypt a backup**:
```typescript
const key      = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY, 'hex')  // 32 bytes
const iv       = payload.slice(0, 12)
const authTag  = payload.slice(12, 28)
const ct       = payload.slice(28)
const decipher = createDecipheriv('aes-256-gcm', key, iv)
decipher.setAuthTag(authTag)
const plaintext = Buffer.concat([decipher.update(ct), decipher.final()])
```
