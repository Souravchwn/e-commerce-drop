# TypeScript Types

All shared types in `apps/storefront/types/index.ts`.

---

## Core Types

```typescript
// Payment tier threshold — single source of truth
const WIRE_THRESHOLD_CENTS = 500_000  // $5,000.00

// Tier router
function getCartTier(totalCents: number): 'card' | 'wire'

// Product status — matches Sanity schema status field
type ProductStatus = 'upcoming' | 'live' | 'reserved' | 'admin_hold' | 'sold'

// Payment tier
type CartTier = 'card' | 'wire'

// DB row status
type ReservationStatus = 'reserved' | 'admin_hold' | 'released' | 'completed'
```

---

## Sanity Types

```typescript
type SanityProduct = {
  _id: string
  title: string
  slug: { current: string }
  price: number
  description: any[]          // Portable Text blocks
  images: SanityImageAsset[]
  dropDate: string
  medusaProductId: string
  weightGrams: number
  dimensions: { lengthCm: number; widthCm: number; heightCm: number }
  hsCode: string
  countryOfOrigin: string
  status: ProductStatus
}

type SanityProductListItem = // lightweight — title, slug, price, images, dropDate, status

type SanityImageAsset = {
  _key: string
  asset: { _ref: string }
  alt: string
}
```

---

## API Contract Types

```typescript
// POST /api/wire-intent
type WireIntentRequest = {
  cartId: string
  productId: string
  amountCents: number
  customerEmail: string
}

type WireIntentResponse = {
  paymentIntentId: string
  bankDetails: BankTransferInstructions | null
}

// Stripe bank transfer details
type BankTransferInstructions = {
  amount_remaining: number
  currency: string
  financial_addresses: FinancialAddress[]
  hosted_instructions_url?: string
  reference: string
  type: string
}

type FinancialAddress = {
  type: string
  supported_networks: string[]
  swift?: { account_number: string; bic: string; bank_name: string; country: string }
  aba?: { routing_number: string; account_number: string; bank_name: string }
}
```

---

## Database Type

```typescript
type ProductReservation = {
  id: string
  cart_id: string
  product_id: string
  stripe_pi_id: string
  status: ReservationStatus
  reserved_at: string
  expires_at: string
  admin_notified_at: string | null
  created_at: string
  updated_at: string
}
```
