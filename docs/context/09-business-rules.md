# Business Rules — Non-Negotiable

These are hard constraints. Never modify, bypass, or work around them.

---

## Boundary 1: Idempotency (anti-ghost-order)

Every Stripe webhook handler **must** check `processed_webhook_events` before acting.

```
1. Check table for event.id
2. Found → return 200 { received: true, duplicate: true }  (stop here)
3. Not found → process the event
4. Insert event.id AFTER successful processing (not before — retries must work if we crash mid-way)
```

Do NOT remove or bypass this check for any event type. Do NOT insert before processing.

---

## Boundary 2: Admin Hold (anti-double-sell)

```
expired reservation (expires_at < now, status = 'reserved')
    → must transition to admin_hold
    → must stay hidden from storefront indefinitely
    → ONLY POST /api/admin/release-item can move it to released
```

Guards enforced in `/api/admin/release-item`:
- `403` if bearer token is wrong
- `409` if `reservation.status !== 'admin_hold'` — cannot release `reserved` (wire may still clear) or `completed` (already sold)

**NEVER add any code path that auto-releases items from `admin_hold` to `released`.**

---

## Boundary 3: Weekly Encrypted Backup

- Runs every Sunday 03:00 UTC via Vercel Cron
- Encryption: AES-256-GCM, 96-bit random IV per backup (new IV every run)
- Key: 32 bytes stored as 64-char hex in `BACKUP_ENCRYPTION_KEY`
- Blob layout: `[IV (12 bytes)][AuthTag (16 bytes)][Ciphertext (N bytes)]`
- Destination: configurable via `BACKUP_DESTINATION_WEBHOOK`

Never change the blob layout — it breaks decryption of existing backups.

---

## General Rules

- Items are **1-of-1**: inventory qty is always 1, never more
- `$5,000 threshold` (`WIRE_THRESHOLD_CENTS = 500_000`) is the **only** place to change the tier cutoff — do not hardcode it anywhere else
- Medusa product `draft` = hidden; `published` = visible — no exceptions
- `revalidateTag` must be called at the end of every mutation that changes product state
