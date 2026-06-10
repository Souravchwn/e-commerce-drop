'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { medusa, getOrCreateCart, addLineItem } from '../lib/medusa'

/**
 * Server Action: create/retrieve cart, add the product's first Medusa variant,
 * set the cart cookie, then redirect to /cart.
 *
 * Fails gracefully — if Medusa is unreachable the user still lands on /cart
 * and sees a "Failed to load cart" message rather than a blank crash.
 */
export async function addToCartAction(medusaProductId: string): Promise<void> {
  const jar            = cookies()
  const existingCartId = jar.get('medusa_cart_id')?.value

  try {
    // 1. Get or create the Medusa cart
    const cart = await getOrCreateCart(existingCartId)

    // 2. Persist the cart ID in an httpOnly cookie (1-week TTL)
    if (!existingCartId || existingCartId !== cart.id) {
      jar.set('medusa_cart_id', cart.id, {
        httpOnly: true,
        sameSite: 'lax',
        secure:   process.env.NODE_ENV === 'production',
        maxAge:   60 * 60 * 24 * 7,
        path:     '/',
      })
    }

    // 3. Look up the Medusa variant and add it to the cart
    //    Only possible when the product has been synced to Medusa (ID starts with "prod_")
    if (medusaProductId?.startsWith('prod_')) {
      try {
        // Retrieve the product to get its first variant ID
        const { product } = await medusa.store.product.retrieve(medusaProductId)
        const variantId   = (product as { variants?: { id: string }[] })?.variants?.[0]?.id

        if (variantId) {
          // Guard: skip if this variant is already in the cart (1-of-1 idempotency)
          const alreadyInCart = (cart.items as { variant_id: string }[] | undefined)
            ?.some((item) => item.variant_id === variantId)
          if (!alreadyInCart) {
            await addLineItem(cart.id, variantId)
          }
        } else {
          console.warn('[addToCart] No variant found for Medusa product:', medusaProductId)
        }
      } catch (medusaErr) {
        // Non-fatal: cart exists, line item just couldn't be added
        console.error('[addToCart] Medusa product/variant lookup failed:', medusaErr)
      }
    } else {
      console.warn('[addToCart] Product not yet synced to Medusa. Skipping line-item add.')
    }
  } catch (err) {
    // Fatal: could not create/retrieve cart — redirect anyway so UX doesn't hang
    console.error('[addToCart] Cart create/retrieve failed:', err)
  }

  redirect('/cart')
}
