import Link from 'next/link'
import Footer from '../../components/Footer'

export const metadata = { title: 'News' }

// In production this would come from Sanity. For now, static.
const NEWS = [
  {
    date:    '2026-06-01',
    label:   'New Drop',
    title:   'Spring/Summer 2026 Drop Now Live',
    excerpt: 'Six new pieces — sculptures and antiques from a private Parisian estate. Each piece authenticated and ready to ship.',
    href:    '/previews',
  },
  {
    date:    '2026-05-15',
    label:   'Authentication',
    title:   'New Independent Authenticator Partnership',
    excerpt: 'We have partnered with a leading independent appraisal firm to add a second-opinion authentication layer to every piece.',
    href:    '#',
  },
  {
    date:    '2026-04-20',
    label:   'Shipping',
    title:   'White-Glove Shipping Now Available Globally',
    excerpt: 'We now offer full white-glove delivery — crated, insured, and tracked — to over 60 countries.',
    href:    '#',
  },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function NewsPage() {
  return (
    <main>
      <div className="border-b border-s-border px-4 py-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">News</h1>
      </div>

      <div className="divide-y divide-s-border">
        {NEWS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex flex-col sm:flex-row gap-4 sm:gap-8 px-4 py-6 hover:bg-s-bg-sub transition-colors duration-100"
          >
            <div className="flex-shrink-0 sm:w-32">
              <p className="text-2xs text-s-muted tabular-nums">{formatDate(item.date)}</p>
              <p className="text-2xs uppercase tracking-widest text-s-red font-semibold mt-1">{item.label}</p>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-s-fg mb-1 group-hover:text-s-red transition-colors duration-100">
                {item.title}
              </h2>
              <p className="text-xs text-s-muted leading-relaxed">{item.excerpt}</p>
            </div>
            <div className="flex-shrink-0 self-center text-s-muted group-hover:text-s-red transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <Footer />
    </main>
  )
}
