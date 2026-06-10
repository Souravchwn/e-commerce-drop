import Footer from '../../components/Footer'

export const metadata = { title: 'Stores' }

export default function StoresPage() {
  return (
    <main>
      <div className="border-b border-s-border px-4 py-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">Stores</h1>
      </div>

      <div className="px-4 py-12 max-w-2xl">
        <p className="text-2xs uppercase tracking-widest text-s-muted mb-6 font-semibold">Gallery Locations</p>
        <h2 className="text-3xl font-black uppercase leading-tight text-s-fg mb-8">
          Online only,<br />for now.
        </h2>
        <p className="text-sm text-s-muted leading-relaxed mb-8">
          Galeriaxolo currently operates exclusively online. Private viewings are
          available by appointment for pieces valued over $10,000. Contact us to arrange.
        </p>

        <div className="border border-s-border p-5">
          <p className="text-2xs uppercase tracking-widest text-s-muted mb-2">Private Viewings</p>
          <p className="text-sm text-s-fg font-semibold mb-3">By appointment only</p>
          <p className="text-xs text-s-muted leading-relaxed mb-4">
            For significant purchases, we can arrange for a piece to be transported
            to a secure viewing location of your choice, with full insurance coverage.
          </p>
          <a
            href="mailto:hello@galeriaxolo.com"
            className="inline-block text-xs font-bold uppercase tracking-widest text-s-fg hover:text-s-red transition-colors"
          >
            Request a viewing →
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
