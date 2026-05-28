import type { Metadata } from 'next'
import './globals.css'
import Header from '../components/Header'

export const metadata: Metadata = {
  title: {
    default:  'Galeriaxolo',
    template: '%s — Galeriaxolo',
  },
  description: 'Rare sculptures and antiques. Limited drops every 2–4 weeks.',
  openGraph: {
    type:     'website',
    siteName: 'Galeriaxolo',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black antialiased pt-12">
        <Header />
        {children}
      </body>
    </html>
  )
}
