// ─── Sanity ───────────────────────────────────────────────────────────────────

export interface SanityImageAsset {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number }
  alt?: string
}

export interface SanityDimensions {
  lengthCm: number
  widthCm:  number
  heightCm: number
}

export type ProductStatus = 'upcoming' | 'live' | 'reserved' | 'admin_hold' | 'sold'

export interface SanityProduct {
  _id:              string
  title:            string
  slug:             { current: string }
  price:            number          // whole USD dollars
  description?:     unknown[]       // Portable Text blocks
  images:           SanityImageAsset[]
  dropDate:         string          // ISO 8601 UTC datetime
  medusaProductId?: string
  status:           ProductStatus
  weightGrams:      number
  dimensions:       SanityDimensions
  hsCode:           string
  countryOfOrigin:  string
}

export interface SanityProductListItem {
  _id:      string
  title:    string
  slug:     { current: string }
  price:    number
  images:   SanityImageAsset[]
  dropDate: string
  status:   ProductStatus
}

// ─── Payment Tiers ────────────────────────────────────────────────────────────

/** Cart total in cents. Below this → card. At or above → wire transfer. */
export const WIRE_THRESHOLD_CENTS = 500_000 // $5,000.00

export type CartTier = 'card' | 'wire'

export function getCartTier(totalCents: number): CartTier {
  return totalCents >= WIRE_THRESHOLD_CENTS ? 'wire' : 'card'
}

// ─── Wire Intent ──────────────────────────────────────────────────────────────

export interface WireIntentRequest {
  cartId:        string
  productId:     string
  amountCents:   number
  customerEmail: string
}

export interface BankTransferInstructions {
  amount_remaining:     number
  currency:             string
  financial_addresses:  FinancialAddress[]
  hosted_instructions_url?: string
  reference:            string
  type:                 string
}

export interface FinancialAddress {
  supported_networks: string[]
  type:               string
  aba?:   { account_number: string; bank_name: string; routing_number: string }
  swift?: { account_number: string; bank_code: string; bank_name: string; country: string; swift_code: string }
}

export interface WireIntentResponse {
  paymentIntentId: string
  bankDetails:     BankTransferInstructions | null
}

// ─── Reservations ─────────────────────────────────────────────────────────────

export type ReservationStatus = 'reserved' | 'admin_hold' | 'released' | 'completed'

export interface ProductReservation {
  id:                 string
  cart_id:            string
  product_id:         string
  stripe_pi_id:       string | null
  customer_email?:    string | null
  status:             ReservationStatus
  reserved_at:        string
  expires_at:         string
  admin_notified_at?: string
  created_at:         string
  updated_at:         string
}
