import { cookies } from 'next/headers'
import Link from 'next/link'
import CartSummary from '../../components/CartSummary'
import Footer from '../../components/Footer'

export const metadata = { title: 'Cart' }

export default async function CartPage({
  searchParams,
}: {
  searchParams: { add?: string }
}) {
  const cookieStore   = cookies()
  const cartId        = cookieStore.get('medusa_cart_id')?.value
  const customerEmail = cookieStore.get('customer_email')?.value ?? ''

  return (
    <main>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="border-b border-s-border px-4 py-4 flex items-baseline justify-between">
        <h1 className="text-lg font-bold uppercase tracking-wide text-s-fg">Cart</h1>
        <Link href="/" className="text-xs text-s-muted hover:text-s-fg transition-colors">
          ← Continue shopping
        </Link>
      </div>

      {!cartId ? (
        /* ── Empty cart state ─────────────────────────────── */
        <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
          <p className="text-s-fg font-semibold text-base">Your cart is empty.</p>
          <p className="text-xs text-s-muted max-w-xs">
            Browse our current drop and add a piece to get started.
          </p>
          <Link
            href="/"
            className="mt-2 bg-s-fg text-s-bg text-xs font-semibold uppercase tracking-widest px-8 py-3 hover:bg-s-red hover:text-white transition-colors duration-150"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        /* ── Cart content ─────────────────────────────────── */
        <div className="max-w-2xl mx-auto">
          <CartSummary cartId={cartId} customerEmail={customerEmail} />
        </div>
      )}
      <Footer />
    </main>
  )
}
