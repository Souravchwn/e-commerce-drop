export const metadata = { title: 'Order Confirmed' }

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { cart_id?: string }
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center flex flex-col gap-6">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400">
          Order Confirmed
        </p>
        <h1 className="text-3xl font-light text-stone-900">
          Thank you.
        </h1>
        <p className="text-sm text-stone-500 leading-relaxed">
          Your order has been received. You will receive a confirmation email
          once payment is verified and your piece is prepared for shipment.
        </p>
        <p className="text-xs text-stone-400 font-mono">
          Ref: {searchParams.cart_id ?? '—'}
        </p>
        <a
          href="/"
          className="mt-4 inline-block text-xs tracking-[0.3em] uppercase text-stone-400
                     hover:text-stone-900 transition-colors underline underline-offset-4"
        >
          Return to Gallery
        </a>
      </div>
    </main>
  )
}
