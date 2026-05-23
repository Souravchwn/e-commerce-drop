import Medusa from '@medusajs/js-sdk'

export const medusa = new Medusa({
  baseUrl:        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!,
  debug:          process.env.NODE_ENV === 'development',
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

// ── Typed helpers ─────────────────────────────────────────────────────────────

/** Retrieve the current cart, creating one if it doesn't exist yet. */
export async function getOrCreateCart(cartId?: string) {
  if (cartId) {
    const { cart } = await medusa.store.cart.retrieve(cartId)
    return cart
  }
  const { cart } = await medusa.store.cart.create({})
  return cart
}

/** Add a Medusa variant to the cart (quantity always 1 for 1-of-1 pieces). */
export async function addLineItem(cartId: string, variantId: string) {
  const { cart } = await medusa.store.cart.createLineItem(cartId, {
    variant_id: variantId,
    quantity:   1,
  })
  return cart
}

/** Retrieve a full cart with totals. */
export async function getCart(cartId: string) {
  const { cart } = await medusa.store.cart.retrieve(cartId)
  return cart
}
