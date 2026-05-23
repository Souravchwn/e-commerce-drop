import { NextResponse } from 'next/server'
import { supabase }     from '../../../../lib/db'
import type { ProductReservation } from '../../../../types'

export const runtime = 'nodejs'

// Vercel Cron — runs every hour (see vercel.json).
// Finds reservations that have passed their 48-hour expiry and transitions
// them to 'admin_hold'. This NEVER automatically releases items back to the
// storefront (Boundary 2 — anti-double-sell system).
//
// The store owner receives an email and must manually verify their banking
// dashboard before calling POST /api/admin/release-item to restore stock.
export async function GET(req: Request): Promise<Response> {
  // Vercel adds the CRON_SECRET to scheduled invocations automatically
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Find all reservations that are 'reserved' and whose 48-hour window has passed
  const now = new Date().toISOString()
  const { data: expired, error } = await supabase
    .from('product_reservations')
    .select('*')
    .eq('status', 'reserved')
    .lt('expires_at', now)
    .returns<ProductReservation[]>()

  if (error) {
    console.error('[expire-reservations] DB query failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results: { id: string; status: 'admin_hold' | 'error'; productId: string }[] = []

  for (const reservation of expired ?? []) {
    try {
      // ── Transition: reserved → admin_hold ────────────────────────────────────
      // NOT released — the owner must verify the banking dashboard first
      await supabase
        .from('product_reservations')
        .update({
          status:            'admin_hold',
          admin_notified_at: now,
        })
        .eq('id', reservation.id)

      // ── Send admin notification email (Resend free tier) ──────────────────────
      const adminEmail = process.env.ADMIN_EMAIL
      const resendKey  = process.env.RESEND_API_KEY
      const fromEmail  = process.env.RESEND_FROM_EMAIL ?? 'noreply@gallerydrop.com'

      if (adminEmail && resendKey) {
        await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: {
            Authorization:  `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:    fromEmail,
            to:      adminEmail,
            subject: `[ACTION REQUIRED] Wire reservation expired — ${reservation.product_id}`,
            html: `
              <h2>Wire Reservation Expired</h2>
              <p>A 48-hour international wire hold has expired without confirmed payment.</p>
              <table cellpadding="8" style="border-collapse:collapse;font-family:monospace;">
                <tr><td><strong>Reservation ID</strong></td><td>${reservation.id}</td></tr>
                <tr><td><strong>Product ID</strong></td><td>${reservation.product_id}</td></tr>
                <tr><td><strong>Cart ID</strong></td><td>${reservation.cart_id}</td></tr>
                <tr><td><strong>Stripe PI</strong></td><td>${reservation.stripe_pi_id ?? '—'}</td></tr>
                <tr><td><strong>Reserved At</strong></td><td>${reservation.reserved_at}</td></tr>
                <tr><td><strong>Expired At</strong></td><td>${reservation.expires_at}</td></tr>
              </table>
              <p><strong>Next steps:</strong></p>
              <ol>
                <li>Log in to your banking dashboard and verify whether the wire has cleared.</li>
                <li>
                  If the wire has NOT arrived and you want to release the item back to the
                  storefront, call:<br/>
                  <code>POST /api/admin/release-item</code> with
                  <code>{ "reservationId": "${reservation.id}" }</code>
                </li>
                <li>
                  If the wire HAS arrived (wires can take up to 3 business days), do NOT
                  release — the Stripe webhook will fulfil the order automatically once
                  the payment settles.
                </li>
              </ol>
              <p style="color:#991b1b;">
                <strong>Do not release the item if there is any possibility the wire will
                still clear. Releasing and then receiving the wire will result in a
                double-sale situation.</strong>
              </p>
            `,
          }),
        }).catch((err) =>
          console.error('[expire-reservations] Resend API failed:', err),
        )
      }

      results.push({ id: reservation.id, status: 'admin_hold', productId: reservation.product_id })
    } catch (err) {
      console.error(`[expire-reservations] Failed for reservation ${reservation.id}:`, err)
      results.push({ id: reservation.id, status: 'error', productId: reservation.product_id })
    }
  }

  console.log(`[expire-reservations] Processed ${results.length} expired reservation(s)`)
  return NextResponse.json({ processed: results.length, results })
}
