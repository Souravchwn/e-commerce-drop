import Link from 'next/link'

const PRIMARY_LINKS = [
  { href: '/',           label: 'shop'      },
  { href: '/previews',   label: 'previews'  },
  { href: '/news',       label: 'news'      },
  { href: '/about',      label: 'about'     },
  { href: '/stores',     label: 'stores'    },
]

const SECONDARY_LINKS = [
  { href: '/faq',        label: 'FAQ'                  },
  { href: '/contact',    label: 'contact'              },
  { href: '/terms',      label: 'terms'                },
  { href: '/privacy',    label: 'privacy policy'       },
  { href: '/mailing',    label: 'mailing list'         },
]

export default function Footer() {
  return (
    <footer className="border-t border-s-border bg-s-bg mt-8">
      <div className="px-4 sm:px-6 py-6 flex flex-col gap-3">

        {/* Primary links */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
          {PRIMARY_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-s-fg hover:text-s-red transition-colors duration-100"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Secondary links */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer support links">
          {SECONDARY_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-s-muted hover:text-s-fg transition-colors duration-100"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-2xs text-s-muted mt-2">
          © {new Date().getFullYear()} Galeriaxolo
        </p>
      </div>
    </footer>
  )
}
