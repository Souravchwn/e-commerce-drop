import { NextResponse }    from 'next/server'
import { revalidateTag }   from 'next/cache'
import { supabase }        from '../../../../lib/db'
import { updateProductStatus } from '../../../../lib/sanity'
import type { ProductReservation } from '../../../../types'

export const runtime = 'nodejs'

// Human-gated inventory release endpoint (Boundary 2).
// The store owner calls this ONLY after manually verifying their banking
// dashboard confirms the wire was NOT received (or choosing to abandon the hold).
// This is the ONLY path that returns an item to the live storefront.
export async function POST(req: Request): Promise<Response> {
  // ── 1. Verify admin secret ────────────────────────────────────────────────────
  const auth = req.headers.get('Authorization')
  if (!auth || auth !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Forbidden', { status: 403 })
  }

  let body: { reservationId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { reservationId } = body
  if (!reservationId) {
    return NextResponse.json({ error: 'reservationId is required' }, { status: 400 })
  }

  // ── 2. Fetch reservation ──────────────────────────────────────────────────────
  const { data: reservation, error: fetchError } = await supabase
    .from('product_reservations')
    .select('*')
    .eq('id', reservationId)
    .maybeSingle<ProductReservation>()

  if (fetchError || !reservation) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
  }

  // ── 3. Guard: only admin_hold reservations may be released ───────────────────
  // Cannot release a 'reserved' item (wire may still clear within 48h).
  // Cannot release a 'completed' item (already paid, item is sold).
  if (reservation.status !== 'admin_hold') {
    return NextResponse.json(
      {
        error: `Cannot release a reservation with status '${reservation.status}'. Only 'admin_hold' items can be manually released.`,
      },
      { status: 409 },
    )
  }

  // ── 4. Update reservation status → released ───────────────────────────────────
  const { error: updateError } = await supabase
    .from('product_reservations')
    .update({ status: 'released' })
    .eq('id', reservationId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // ── 5. Restore Medusa product to 'published' ──────────────────────────────────
  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (medusaUrl && reservation.product_id.startsWith('prod_')) {
    await fetch(`${medusaUrl}/admin/products/${reservation.product_id}`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${process.env.MEDUSA_ADMIN_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'published' }),
    }).catch((err) =>
      console.error('[release-item] Medusa publish failed:', err),
    )
  }

  // ── 6. Update Sanity product status → live ────────────────────────────────────
  try {
    const { sanityClient } = await import('../../../../lib/sanity')
    const sanityProduct = await sanityClient.fetch<{ _id: string } | null>(
      `*[_type == "product" && medusaProductId == $id][0] { _id }`,
      { id: reservation.product_id },
    )
    if (sanityProduct) {
      await updateProductStatus(sanityProduct._id, 'live')
    }
  } catch (err) {
    console.error('[release-item] Sanity status update failed:', err)
  }

  // ── 7. Bust Next.js cache ──────────────────────────────────────────────────────
  revalidateTag('products')
  revalidateTag(`product-${reservation.product_id}`)

  console.log(`[release-item] Reservation ${reservationId} released by admin. Product: ${reservation.product_id}`)

  return NextResponse.json({ released: true, reservationId })
}
