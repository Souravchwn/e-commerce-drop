import { createClient } from '@supabase/supabase-js'
import type { ProductReservation } from '../types'

// Service-role client — server-only. Bypasses RLS. Never import from client components.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── Typed table helpers ───────────────────────────────────────────────────────

export async function insertReservation(
  data: Omit<ProductReservation, 'id' | 'created_at' | 'updated_at' | 'admin_notified_at'>,
) {
  const { error } = await supabase
    .from('product_reservations')
    .insert(data)
  if (error) throw new Error(`DB insert reservation: ${error.message}`)
}

export async function getReservationByStripePI(stripePiId: string) {
  const { data, error } = await supabase
    .from('product_reservations')
    .select('*')
    .eq('stripe_pi_id', stripePiId)
    .maybeSingle<ProductReservation>()
  if (error) throw new Error(`DB get reservation: ${error.message}`)
  return data
}

export async function updateReservationStatus(
  id: string,
  status: ProductReservation['status'],
  extra: Partial<ProductReservation> = {},
) {
  const { error } = await supabase
    .from('product_reservations')
    .update({ status, ...extra })
    .eq('id', id)
  if (error) throw new Error(`DB update reservation: ${error.message}`)
}

export async function isWebhookEventProcessed(stripeEventId: string): Promise<boolean> {
  const { data } = await supabase
    .from('processed_webhook_events')
    .select('stripe_event_id')
    .eq('stripe_event_id', stripeEventId)
    .maybeSingle()
  return data !== null
}

export async function markWebhookEventProcessed(stripeEventId: string, eventType: string) {
  const { error } = await supabase
    .from('processed_webhook_events')
    .insert({ stripe_event_id: stripeEventId, event_type: eventType })
  // Ignore unique-violation — idempotent by design
  if (error && !error.message.includes('duplicate')) {
    throw new Error(`DB mark webhook event: ${error.message}`)
  }
}
