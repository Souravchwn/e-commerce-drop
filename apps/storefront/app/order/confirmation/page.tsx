export const metadata = { title: 'Order Confirmed' }

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { cart_id?: string }
}) {
  return (
    <main className="min-h-screen border-t border-[#d4d4d4] flex items-center justify-center px-4">
      <div className="max-w-[400px] w-full flex flex-col gap-5">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#767676]">
          Order Confirmed
        </p>

        <h1 className="text-[28px] font-normal text-black leading-tight">
          Thank you.
        </h1>

        <p className="text-[13px] text-[#767676] leading-relaxed">
          Your order has been received. You will be contacted once payment is
          verified and your piece is prepared for shipment.
        </p>

        {searchParams.cart_id && (
          <p className="text-[11px] font-mono text-[#767676] border-t border-[#d4d4d4] pt-4">
            Ref: {searchParams.cart_id}
          </p>
        )}

        <a
          href="/"
          className="inline-block text-[11px] uppercase tracking-[0.12em] text-[#767676] hover:text-black transition-colors border-t border-[#d4d4d4] pt-4"
        >
          ← Return to Shop
        </a>
      </div>
    </main>
  )
}
