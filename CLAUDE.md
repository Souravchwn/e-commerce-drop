# Gallery Drop — AI Agent Context Index

Supreme-style luxury art gallery e-commerce. 1-of-1 sculptures/antiques, $500–$25,000 per drop.
**Stack**: Next.js 14 · Sanity v3 · Medusa v2 · Supabase · Stripe · Tailwind · pnpm/Turborepo

---

## How to Use This Context System

Load only the modules relevant to your task. Each file is self-contained — you do not need to read source code if the context file covers the area you're working in.

| # | File | Load when working on… |
|---|------|----------------------|
| 00 | [`docs/context/00-architecture.md`](docs/context/00-architecture.md) | Project structure, stack, monorepo layout, run commands |
| 01 | [`docs/context/01-environment.md`](docs/context/01-environment.md) | Env vars, secrets, what's safe to expose to browser |
| 02 | [`docs/context/02-database.md`](docs/context/02-database.md) | Supabase schema, reservation lifecycle, `lib/db.ts` |
| 03 | [`docs/context/03-sanity.md`](docs/context/03-sanity.md) | CMS schema, GROQ queries, `lib/sanity.ts`, webhook setup |
| 04 | [`docs/context/04-medusa.md`](docs/context/04-medusa.md) | Medusa config, product status flow, `lib/medusa.ts` |
| 05 | [`docs/context/05-payments.md`](docs/context/05-payments.md) | Tier 1 (card) vs Tier 2 (wire), $5k threshold, Stripe setup |
| 06 | [`docs/context/06-api-routes.md`](docs/context/06-api-routes.md) | All API route contracts, request/response shapes, side effects |
| 07 | [`docs/context/07-components.md`](docs/context/07-components.md) | React components — props, state machines, render rules |
| 08 | [`docs/context/08-pages-cache.md`](docs/context/08-pages-cache.md) | Pages, ISR, cache tags, Vercel Cron schedule |
| 09 | [`docs/context/09-business-rules.md`](docs/context/09-business-rules.md) | **Read this for every task** — non-negotiable boundaries |
| 10 | [`docs/context/10-types.md`](docs/context/10-types.md) | All TypeScript types and API contracts |
| 11 | [`docs/context/11-design-system.md`](docs/context/11-design-system.md) | UI design tokens, typography, component patterns, Stripe dark theme |

---

## Quick Reference

**Always read `09-business-rules.md` before any code change.**

### The 3 Hard Boundaries
1. **Idempotency** — every Stripe webhook checks `processed_webhook_events` before acting
2. **Admin hold** — expired wire reservations stay hidden until `POST /api/admin/release-item`; never auto-release
3. **Encrypted backup** — AES-256-GCM, blob layout `[IV 12b][AuthTag 16b][Ciphertext]`, weekly cron

### Payment Tier Split (single source of truth: `types/index.ts`)
- `< $5,000` → card/Apple Pay/Google Pay (`StripeCardPayment`)
- `≥ $5,000` → bank wire only (`WirePaymentModule`) — card fields never rendered

### Product Status Flow
```
Sanity: upcoming → live → reserved → admin_hold → sold
Medusa: published → draft (wire hold) → published (released) | stays draft (sold)
```

### Key File Locations
```
apps/storefront/
  types/index.ts          ← WIRE_THRESHOLD_CENTS, all shared types
  lib/db.ts               ← Supabase (server-only, service role)
  lib/sanity.ts           ← Sanity client + GROQ queries
  lib/stripe.ts           ← Stripe server SDK + browser singleton
  lib/medusa.ts           ← Medusa JS SDK
  app/api/                ← All API routes
  components/             ← CartSummary, DropCountdown, StripeCardPayment, WirePaymentModule
apps/studio/schemaTypes/product.ts  ← Sanity schema
backend/medusa-config.ts            ← Medusa config
supabase/migrations/                ← SQL migrations (run in order)
```
