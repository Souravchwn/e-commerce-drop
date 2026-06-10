import Footer from '../../components/Footer'

export const metadata = { title: 'FAQ' }

const FAQS = [
  {
    q: 'Are all pieces truly one of a kind?',
    a: 'Yes. Every piece is a singular original — no reproductions, no editions, no restocks. Once sold, it is gone.',
  },
  {
    q: 'How do I know a piece is authentic?',
    a: 'Every piece is independently authenticated before listing. A physical certificate of authenticity signed by our appraisal partner ships with each piece.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'For pieces under $5,000: Visa, Mastercard, American Express, Apple Pay, and Google Pay. For pieces $5,000 and above: international SWIFT wire transfer only.',
  },
  {
    q: 'How does the wire transfer process work?',
    a: 'Click "Request Bank Wire Details" on the checkout page. We will generate a unique reference code and a dedicated bank account number for your transfer. Your piece is held for 48 hours while the wire clears (typically 2–3 business days).',
  },
  {
    q: 'What if I want to return a piece?',
    a: 'Returns are accepted within 7 days of delivery if the piece arrives in a condition materially different from its listing. Please contact us immediately with photos. We do not accept returns for change of mind.',
  },
  {
    q: 'How are pieces shipped?',
    a: 'Domestic: insured, white-glove delivery within 5–7 business days. International: crated, fully insured, tracked air freight. Shipping costs vary by destination and piece dimensions — contact us for a quote.',
  },
  {
    q: 'Can I view a piece before buying?',
    a: 'Private viewings are available by appointment for pieces over $10,000. Contact us at hello@galeriaxolo.com to arrange.',
  },
  {
    q: 'When do drops happen?',
    a: 'Roughly every 2–4 weeks. Subscribe to our mailing list for early access and drop previews.',
  },
]

export default function FaqPage() {
  return (
    <main>
      <div className="border-b border-s-border px-4 py-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">FAQ</h1>
      </div>

      <div className="max-w-2xl divide-y divide-s-border">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group px-4 py-5">
            <summary className="flex items-start justify-between gap-4 cursor-pointer list-none select-none">
              <span className="text-sm font-semibold text-s-fg group-open:text-s-red transition-colors">{q}</span>
              <span className="flex-shrink-0 text-xl leading-none text-s-muted transition-transform duration-200 group-open:rotate-45 mt-0.5">+</span>
            </summary>
            <p className="mt-3 text-xs text-s-muted leading-relaxed pr-8">{a}</p>
          </details>
        ))}
      </div>

      <Footer />
    </main>
  )
}
