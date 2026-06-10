import Footer from '../../components/Footer'

export const metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <main>
      <div className="border-b border-s-border px-4 py-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">About</h1>
      </div>

      <div className="max-w-2xl px-4 py-12 sm:py-16">
        <p className="text-2xs uppercase tracking-widest text-s-muted mb-6 font-semibold">Galeriaxolo</p>

        <h2 className="text-3xl sm:text-4xl font-black uppercase leading-tight text-s-fg mb-8">
          Every piece,<br />one of one.
        </h2>

        <div className="space-y-5 text-sm text-s-muted leading-relaxed">
          <p>
            Galeriaxolo is a curated gallery of rare sculptures and antiques sourced from
            private collections and estate sales across Europe, Asia, and the Americas.
            Each piece is authenticated, documented, and released in strictly limited drops.
          </p>
          <p>
            We work directly with expert appraisers and independent authenticators to
            verify provenance and condition before any piece goes live. A certificate of
            authenticity is included with every purchase.
          </p>
          <p>
            Drops happen every 2–4 weeks. Each piece is available exactly once — no
            reproductions, no restocks, no exceptions.
          </p>
          <p>
            International shipping is handled through our white-glove logistics partners,
            with full insurance and real-time tracking on every order.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-s-border grid grid-cols-2 sm:grid-cols-3 gap-6">
          {[
            { label: 'Founded',    value: '2024'              },
            { label: 'Pieces sold', value: '1-of-1 only'      },
            { label: 'Shipping',   value: 'Worldwide'         },
            { label: 'Payment',    value: 'Card + Wire'       },
            { label: 'Auth',       value: 'Every piece'       },
            { label: 'Returns',    value: 'On condition only' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xs uppercase tracking-widest text-s-muted mb-1">{label}</p>
              <p className="text-sm font-semibold text-s-fg">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
