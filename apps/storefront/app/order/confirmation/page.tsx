import Link from 'next/link'
import Footer from '../../../components/Footer'

export const metadata = { title: 'Order Confirmed' }

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { cart_id?: string }
}) {
  return (
    <>
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full py-16">

          {/* Success mark */}
          <div className="w-10 h-10 bg-s-fg flex items-center justify-center mb-6">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l4 4 8-8" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-s-red mb-2">
            Order Confirmed
          </p>

          <h1 className="text-4xl font-black uppercase leading-none text-s-fg mb-4">
            Thank you.
          </h1>

          <p className="text-sm text-s-muted leading-relaxed mb-6 max-w-sm">
            Your order has been received. You will be contacted once payment is
            verified and your piece is prepared for shipment.
          </p>

          {searchParams.cart_id && (
            <p className="text-2xs font-mono text-s-muted border-t border-s-border pt-4 mb-6">
              Order ref: {searchParams.cart_id}
            </p>
          )}

          <Link
            href="/"
            className="inline-block bg-s-fg text-s-bg text-xs font-semibold uppercase tracking-widest px-8 py-3 hover:bg-s-red hover:text-white transition-colors duration-150"
          >
            Back to Shop
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
