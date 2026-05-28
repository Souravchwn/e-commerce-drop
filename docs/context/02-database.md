# Database — Supabase PostgreSQL

Migrations live in `supabase/migrations/` — run in order via Supabase SQL Editor.

---

## Table: `product_reservations`
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

### Status Lifecycle (critical — see Business Rules)
```
reserved  →  admin_hold  →  released    (admin manually confirmed no wire)
                        ↘  (stays hidden forever until admin acts)
reserved  →  completed               (Stripe webhook confirmed payment)
```

| Status | Meaning | Who sets it |
|--------|---------|-------------|
| `reserved` | Wire created, 48h window active | `POST /api/wire-intent` |
| `admin_hold` | 48h expired, admin notified, item stays hidden | `GET /api/cron/expire-reservations` |
| `released` | Admin verified no wire arrived, item back live | `POST /api/admin/release-item` ONLY |
| `completed` | Stripe confirmed payment, order fulfilled | `POST /api/webhooks/stripe` |

**NEVER** auto-transition `admin_hold` → `released` in any code path.

---

## Table: `processed_webhook_events`
Idempotency log for Stripe webhook events (prevents ghost orders).

```sql
stripe_event_id  TEXT  PK  (Stripe's event.id, e.g. "evt_...")
event_type       TEXT      e.g. "payment_intent.succeeded"
processed_at     TIMESTAMPTZ
```

---

## Lib Functions (`lib/db.ts`)
Server-side only — uses `SUPABASE_SERVICE_ROLE_KEY`.

| Export | Signature | Notes |
|--------|-----------|-------|
| `supabase` | Supabase client | Service role, bypasses RLS |
| `insertReservation()` | `(data) => Promise<void>` | Inserts into `product_reservations` |
| `getReservationByStripePI()` | `(piId) => Promise<ProductReservation>` | Lookup by PaymentIntent ID |
| `updateReservationStatus()` | `(id, status) => Promise<void>` | Updates status field |
| `isWebhookEventProcessed()` | `(eventId) => Promise<boolean>` | Checks idempotency table |
| `markWebhookEventProcessed()` | `(eventId, type) => Promise<void>` | Inserts to idempotency table |
