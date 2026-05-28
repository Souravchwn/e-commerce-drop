# Pages, Cache & Cron

---

## Pages

| Route | Rendering | Notes |
|-------|-----------|-------|
| `/` | Server, ISR 60s | Fetches all Sanity products, renders drop grid |
| `/products/[slug]` | Server, ISR 30s | Full product detail + `DropCountdown` client island |
| `/cart` | Server shell + Client | Reads `medusa_cart_id` cookie, renders `CartSummary` |
| `/order/confirmation` | Server | After successful payment, reads `cart_id` query param |

---

## Cache Strategy

Uses Next.js `unstable_cache` with tags.

| Tag | Invalidated by |
|-----|---------------|
| `products` | `/api/webhooks/stripe` (on sold) |
| `products` | `/api/webhooks/sanity` (on publish) |
| `products` | `/api/admin/release-item` (on release) |
| `product-{medusaProductId}` | `/api/webhooks/stripe` on that specific product |

All invalidations call `revalidateTag(...)` at the end of their success path.

---

## Vercel Cron Configuration

File: `apps/storefront/vercel.json`

```json
{
  "crons": [
    { "path": "/api/cron/expire-reservations", "schedule": "0 * * * *"  },
    { "path": "/api/cron/backup",              "schedule": "0 3 * * 0"  }
  ]
}
```

| Cron | Schedule | Purpose |
|------|----------|---------|
| `expire-reservations` | Hourly | Transitions expired wires to `admin_hold`, emails admin |
| `backup` | Sundays 03:00 UTC | AES-256-GCM encrypted full DB backup |

Both routes authenticate via `Authorization: Bearer CRON_SECRET`. Vercel injects this automatically. Test locally by passing the header manually.
