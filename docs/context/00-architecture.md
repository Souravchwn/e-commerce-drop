# Architecture & Stack

## Identity
Supreme-style luxury art gallery e-commerce. Each drop: 1–3 unique sculptures/antiques, $500–$25,000, every 2–4 weeks. Items are strictly **1-of-1** (single unit inventory).

## Stack
| Layer | Technology |
|-------|-----------|
| Storefront + API routes | Next.js 14 App Router |
| CMS | Sanity Studio v3 |
| Inventory / Orders / Cart | Medusa v2 |
| Database | Supabase PostgreSQL |
| Payments | Stripe |
| Styling | Tailwind CSS |
| Monorepo | pnpm + Turborepo |
| Deployment | Vercel (storefront), Sanity.io, Supabase |

**Cost constraint**: $0/month fixed. No paid services without explicit approval.

## Monorepo Layout
```
e-commerce-drop/
├── apps/
│   ├── storefront/          # Next.js 14 App Router — storefront + all API routes
│   └── studio/              # Sanity Studio v3
├── backend/                 # Medusa v2 — inventory, orders, cart
├── supabase/migrations/     # Raw SQL run in Supabase SQL Editor
├── package.json             # pnpm workspace root
├── turbo.json               # Turborepo pipeline
└── .env.example             # All required env vars documented
```

## Run Commands (from repo root)
```bash
pnpm install                    # install all workspaces
pnpm --filter storefront dev    # Next.js storefront :3000
pnpm --filter studio dev        # Sanity Studio :3333
pnpm --filter backend dev       # Medusa backend :9000
```

## Deployment Targets
- **Vercel** — storefront + API routes (Hobby tier, free)
- **Sanity.io** — Studio (free tier)
- **Supabase** — PostgreSQL (free tier, 500 MB)

## Key Directory Map
```
apps/storefront/
├── app/
│   ├── api/
│   │   ├── admin/release-item/   # POST — manual admin release
│   │   ├── cron/
│   │   │   ├── expire-reservations/  # GET — hourly Vercel Cron
│   │   │   └── backup/               # GET — weekly Vercel Cron
│   │   ├── payment-intent/       # POST — Tier 1 card PaymentIntent
│   │   ├── wire-intent/          # POST — Tier 2 wire PaymentIntent
│   │   └── webhooks/
│   │       ├── stripe/           # POST — Stripe events
│   │       └── sanity/           # POST — Sanity publish events
│   ├── (pages)/                  # /, /products/[slug], /cart, /order/confirmation
├── components/                   # CartSummary, DropCountdown, StripeCardPayment, WirePaymentModule
├── lib/                          # sanity.ts, stripe.ts, medusa.ts, db.ts
└── types/index.ts                # All shared TypeScript types
```
