import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import ThemeProvider from '../components/ThemeProvider'

const inter = Inter({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display:  'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'Galeriaxolo',
    template: '%s | Galeriaxolo',
  },
  description: 'Rare sculptures and antiques. Limited drops every 2–4 weeks.',
  openGraph: {
    type:     'website',
    siteName: 'Galeriaxolo',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}}catch(e){}})();` }} />
      </head>
      {/* pt-11 = 44px fixed header */}
      <body className="min-h-screen bg-s-bg text-s-fg antialiased pt-11">
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
