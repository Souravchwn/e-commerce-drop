# Deployment Guide — Galeriaxolo

Full deployment walkthrough for a fresh environment. Follow sections in order.

---

## Overview

| Service | Platform | Tier |
|---------|----------|------|
| Storefront + API routes | Vercel | Hobby (free) |
| Sanity CMS Studio | Sanity.io (managed) | Free |
| Database | Supabase | Free (500 MB) |
| Medusa backend | Self-hosted or Railway | Free tier |
| Payments | Stripe | Pay-as-you-go |
| Email | Resend | Free (3,000/month) |

---

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- Vercel CLI (`npm install -g vercel`)
- Stripe CLI (for webhook testing)
- Accounts created: Vercel, Sanity.io, Supabase, Stripe, Resend

---

## Step 1 — Supabase Setup

### 1.1 Create project

Go to [supabase.com](https://supabase.com) → New Project. Note the project URL and keys from **Project Settings → API**.

### 1.2 Run migrations (in order)

Open **SQL Editor** in Supabase Dashboard and run each file:

```
supabase/migrations/001_reservations.sql
supabase/migrations/002_webhook_events.sql
supabase/migrations/003_reservation_customer_email.sql
```

Run them sequentially — each depends on the previous.

### 1.3 Collect credentials

| Variable | Where to find |
|----------|--------------|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key |
| `DATABASE_URL` | Project Settings → Database → Connection string (URI) |

---

## Step 2 — Sanity CMS Setup

### 2.1 Create project

```bash
cd apps/studio
npx sanity@latest init --env
```

Or log in at [sanity.io/manage](https://sanity.io/manage) and create a project manually.

Note the **Project ID** (visible in the URL: `manage.sanity.io/projects/<id>`).

### 2.2 Generate API token

Sanity Dashboard → Project → API → Tokens → Add API token:
- Label: `storefront-write`
- Permissions: **Editor**

Copy the token → `SANITY_API_TOKEN`.

### 2.3 Configure webhook

Sanity Dashboard → Project → API → Webhooks → Add Webhook:

| Field | Value |
|-------|-------|
| Name | `storefront-revalidate` |
| URL | `https://<your-vercel-domain>/api/webhooks/sanity` |
| Trigger on | Create, Update, Delete |
| Filter | `_type == "product"` |
| HTTP method | POST |
| Secret | Generate 32+ random chars → `SANITY_WEBHOOK_SECRET` |

### 2.4 Collect credentials

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | Token from step 2.2 |
| `SANITY_WEBHOOK_SECRET` | Secret from step 2.3 |

---

## Step 3 — Stripe Setup

### 3.1 Create account and get keys

Stripe Dashboard → Developers → API keys:

| Variable | Key type |
|----------|---------|
| `STRIPE_SECRET_KEY` | Secret key (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (`pk_live_...`) |

Use `sk_test_` / `pk_test_` keys until you're ready to go live.

### 3.2 Configure webhook

Stripe Dashboard → Developers → Webhooks → Add endpoint:

| Field | Value |
|-------|-------|
| Endpoint URL | `https://<your-vercel-domain>/api/webhooks/stripe` |
| Events | `payment_intent.succeeded` |

After saving, reveal the signing secret → `STRIPE_WEBHOOK_SECRET` (`whsec_...`).

### 3.3 Enable customer balance (wire payments ≥ $5,000)

Stripe Dashboard → Settings → Payment methods → Enable **Customer balance** with `US bank transfer`.

---

## Step 4 — Medusa Backend Setup

### 4.1 Configure environment

Copy `backend/.env.example` to `backend/.env` and fill in:

```bash
DATABASE_URL=<supabase-connection-string>
MEDUSA_ADMIN_SECRET=<generate-32-char-secret>
```

### 4.2 Run backend locally or deploy

```bash
pnpm --filter backend dev       # local: http://localhost:9000
```

For production, deploy to Railway, Render, or any Node host. Set `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to the deployed URL.

### 4.3 Get publishable key

After Medusa is running, create a publishable key:

```
Medusa Admin → Settings → API Keys → Create publishable key
```

→ `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`

---

## Step 5 — Email Setup (Resend)

1. Create account at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Create API key → `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` to a verified address (e.g., `noreply@yourdomain.com`)
5. Set `ADMIN_EMAIL` to the address that receives wire-expiry alerts

---

## Step 6 — Generate Secrets

```bash
# ADMIN_API_SECRET — protects /api/admin/* routes
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# CRON_SECRET — used by Vercel Cron (also set in Vercel project env)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# BACKUP_ENCRYPTION_KEY — 64-char hex AES-256 key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# SANITY_WEBHOOK_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 7 — Deploy Storefront to Vercel

### 7.1 Link project

```bash
cd apps/storefront
vercel link
```

Or import from GitHub at [vercel.com/new](https://vercel.com/new).

### 7.2 Configure build settings in Vercel

| Setting | Value |
|---------|-------|
| Root directory | `apps/storefront` |
| Framework preset | Next.js |
| Build command | `pnpm build` |
| Output directory | `.next` |
| Node.js version | 20.x |

### 7.3 Add all environment variables

In Vercel → Project → Settings → Environment Variables, add every variable from `.env.example`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_TOKEN
SANITY_WEBHOOK_SECRET
NEXT_PUBLIC_MEDUSA_BACKEND_URL
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
MEDUSA_ADMIN_SECRET
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
ADMIN_API_SECRET
ADMIN_EMAIL
CRON_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
BACKUP_ENCRYPTION_KEY
BACKUP_DESTINATION_WEBHOOK
```

### 7.4 Deploy

```bash
vercel --prod
```

Or push to `main` if GitHub integration is configured.

### 7.5 Verify cron jobs

Vercel reads `vercel.json` in the project root automatically. After deployment, confirm in Vercel Dashboard → Project → Cron Jobs:

| Cron | Schedule | Route |
|------|----------|-------|
| Expire reservations | Hourly | `/api/cron/expire-reservations` |
| Encrypted backup | Sundays 03:00 UTC | `/api/cron/backup` |

---

## Step 8 — Deploy Sanity Studio

```bash
cd apps/studio
npx sanity deploy
```

Choose a hostname (e.g., `galeriaxolo.sanity.studio`). Studio is hosted by Sanity for free.

---

## Step 9 — Post-Deployment Verification

### Smoke tests (manual)

| Check | Expected |
|-------|---------|
| `GET /` | Drop grid renders |
| `GET /products/<slug>` | Product detail page loads |
| `POST /api/webhooks/stripe` with wrong signature | Returns 400 |
| `POST /api/admin/release-item` without `Authorization` header | Returns 401 |
| `GET /api/cron/expire-reservations` without `CRON_SECRET` header | Returns 401 |

### Test a Tier 1 card payment

1. Add a product under $5,000 to cart
2. Use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC
3. Complete checkout → confirm `/order/confirmation` loads

### Test a Tier 2 wire payment

1. Add a product ≥ $5,000 to cart
2. Confirm card fields are **not** shown — only `WirePaymentModule`
3. Click "Request Wire Details" → verify bank details are returned

### Stripe webhook local testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

---

## Environment Variable Summary

Full reference is in `.env.example`. Security rules:

- Variables prefixed `NEXT_PUBLIC_` are bundled into the browser — **never put secrets there**
- `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS — only used in `lib/db.ts` (server)
- `STRIPE_SECRET_KEY` and `MEDUSA_ADMIN_SECRET` must never appear in client components

---

## Backup Destination

`BACKUP_DESTINATION_WEBHOOK` must be a POST endpoint that accepts the raw encrypted blob:

```
Layout: [IV 12 bytes][AuthTag 16 bytes][Ciphertext]
```

This runs every Sunday at 03:00 UTC. Point it at a webhook receiver (e.g., a Make/n8n scenario that stores to Google Drive, or a custom endpoint that writes to S3).

---

## Rollback

Vercel keeps all deployment snapshots. To roll back:

```bash
vercel rollback
```

Or use Vercel Dashboard → Deployments → Promote an older deployment to production.
