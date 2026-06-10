import Footer from '../../components/Footer'

export const metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <main>
      <div className="border-b border-s-border px-4 py-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">Contact</h1>
      </div>

      <div className="max-w-xl px-4 py-12">
        <p className="text-2xs uppercase tracking-widest text-s-muted mb-8 font-semibold">Get in touch</p>

        <div className="space-y-6 mb-10">
          <div className="flex flex-col gap-1.5">
            <p className="text-2xs uppercase tracking-widest text-s-muted">General enquiries</p>
            <a href="mailto:hello@galeriaxolo.com" className="text-sm font-semibold text-s-fg hover:text-s-red transition-colors">
              hello@galeriaxolo.com
            </a>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-2xs uppercase tracking-widest text-s-muted">Orders & shipping</p>
            <a href="mailto:orders@galeriaxolo.com" className="text-sm font-semibold text-s-fg hover:text-s-red transition-colors">
              orders@galeriaxolo.com
            </a>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-2xs uppercase tracking-widest text-s-muted">Press & consignment</p>
            <a href="mailto:press@galeriaxolo.com" className="text-sm font-semibold text-s-fg hover:text-s-red transition-colors">
              press@galeriaxolo.com
            </a>
          </div>
        </div>

        <div className="border-t border-s-border pt-8">
          <p className="text-xs text-s-muted leading-relaxed">
            We aim to respond within 24 hours. For urgent order matters, include your
            order reference in the subject line.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}
