import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CartSummary from '../../components/CartSummary'

export const metadata = { title: 'Cart' }

export default async function CartPage({
  searchParams,
}: {
  searchParams: { add?: string }
}) {
  const cookieStore = cookies()
  const cartId       = cookieStore.get('medusa_cart_id')?.value
  const customerEmail = cookieStore.get('customer_email')?.value ?? 'guest@example.com'

  if (!cartId) redirect('/')

  return (
    <main className="min-h-screen border-t border-[#d4d4d4]">
      <div className="max-w-[520px] mx-auto px-4 py-8">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#767676] mb-8">
          Your Cart
        </p>
        <CartSummary cartId={cartId} customerEmail={customerEmail} />
      </div>
    </main>
  )
}
