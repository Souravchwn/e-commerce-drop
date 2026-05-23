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
  const cartId = cookieStore.get('medusa_cart_id')?.value

  if (!cartId) redirect('/')

  // customerEmail would normally come from the authenticated session;
  // for the guest flow, read it from a cookie or query param.
  const customerEmail =
    cookieStore.get('customer_email')?.value ?? 'guest@example.com'

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="max-w-lg mx-auto">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400 mb-10 text-center">
          Your Cart
        </p>
        <CartSummary cartId={cartId} customerEmail={customerEmail} />
      </div>
    </main>
  )
}
