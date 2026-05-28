# Environment Variables

Config lives in:
- `apps/storefront/.env.local` — storefront & API routes
- `backend/.env` — Medusa
- `.env.example` at repo root — full reference (no real values)

## Full Variable Reference

| Variable | Used by | Purpose | Exposure |
|----------|---------|---------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | storefront | Sanity GROQ queries | Public (browser) |
| `NEXT_PUBLIC_SANITY_DATASET` | storefront | `production` | Public (browser) |
| `SANITY_API_TOKEN` | server API routes | Sanity Mutations API write access | Server only |
| `SANITY_WEBHOOK_SECRET` | `/api/webhooks/sanity` | Validates Sanity webhook calls | Server only |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | storefront + API routes | Medusa REST base URL | Public (browser) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | storefront | Medusa store SDK auth | Public (browser) |
| `MEDUSA_ADMIN_SECRET` | server API routes only | Internal Medusa admin calls | **NEVER expose to browser** |
| `STRIPE_SECRET_KEY` | server API routes only | Stripe Node SDK | **NEVER expose to browser** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | browser | Stripe.js initialization | Public (browser) |
| `STRIPE_WEBHOOK_SECRET` | `/api/webhooks/stripe` | Signature verification (`whsec_...`) | Server only |
| `SUPABASE_URL` | server API routes | Supabase project URL | Server only |
| `SUPABASE_SERVICE_ROLE_KEY` | server API routes only | Bypasses RLS | **NEVER expose to browser** |
| `ADMIN_API_SECRET` | `/api/admin/*` | Bearer token for admin endpoints | Server only |
| `ADMIN_EMAIL` | cron job | Receives wire-expiry notification emails | Server only |
| `CRON_SECRET` | cron routes | Vercel injects automatically for scheduled invocations | Server only |
| `RESEND_API_KEY` | cron job | Sends admin notification emails (Resend free tier) | Server only |
| `RESEND_FROM_EMAIL` | cron job | From address for admin emails | Server only |
| `BACKUP_ENCRYPTION_KEY` | backup cron | 64-char hex AES-256 key | Server only |
| `BACKUP_DESTINATION_WEBHOOK` | backup cron | POST endpoint receiving encrypted backup blob | Server only |
| `DATABASE_URL` | Medusa backend + backup cron | Supabase PostgreSQL connection string | Server only |

## Security Rules
- Variables prefixed `NEXT_PUBLIC_` are embedded in the browser bundle — **never put secrets there**
- `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS — server-only imports only (`lib/db.ts`)
- `MEDUSA_ADMIN_SECRET` and `STRIPE_SECRET_KEY` must never appear in client components
