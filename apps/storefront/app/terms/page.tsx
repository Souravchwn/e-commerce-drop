import Footer from '../../components/Footer'

export const metadata = { title: 'Terms of Sale' }

export default function TermsPage() {
  return (
    <main>
      <div className="border-b border-s-border px-4 py-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">Terms of Sale</h1>
      </div>

      <div className="max-w-2xl px-4 py-10 space-y-8 text-xs text-s-muted leading-relaxed">
        <p className="text-2xs uppercase tracking-widest text-s-muted font-semibold">Last updated: June 2026</p>

        {[
          {
            title: '1. All Sales Final',
            body:  'All purchases are final. We do not offer refunds for change of mind. Returns are accepted only if a piece arrives in materially different condition than described, reported within 7 days of delivery with photographic evidence.',
          },
          {
            title: '2. Authenticity',
            body:  'Every piece sold through Galeriaxolo is accompanied by a certificate of authenticity. We make no guarantee of future appreciation or investment value.',
          },
          {
            title: '3. Payment',
            body:  'Card payments are processed immediately via Stripe. Wire transfers initiate a 48-hour hold. If the wire is not received within 48 hours, the hold expires and the piece is released back to inventory.',
          },
          {
            title: '4. Shipping',
            body:  'Risk of loss passes to the buyer upon handover to our logistics partner. We insure all shipments for full purchase value. Customs duties and import taxes are the buyer\'s responsibility.',
          },
          {
            title: '5. Descriptions',
            body:  'Piece descriptions, dimensions, and condition reports are provided in good faith. Slight variations in colour rendering due to photography and screen calibration are expected and do not constitute misrepresentation.',
          },
          {
            title: '6. Governing Law',
            body:  'These terms are governed by the laws of the jurisdiction in which Galeriaxolo is registered. Disputes shall be resolved by binding arbitration.',
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 className="text-sm font-bold text-s-fg mb-2">{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </div>

      <Footer />
    </main>
  )
}
