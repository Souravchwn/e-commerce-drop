import Footer from '../../components/Footer'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <main>
      <div className="border-b border-s-border px-4 py-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">Privacy Policy</h1>
      </div>

      <div className="max-w-2xl px-4 py-10 space-y-8 text-xs text-s-muted leading-relaxed">
        <p className="text-2xs uppercase tracking-widest text-s-muted font-semibold">Last updated: June 2026</p>

        {[
          {
            title: '1. Data We Collect',
            body:  'We collect your email address, shipping address, and payment information (processed and stored by Stripe — we never see your raw card details). We also collect basic usage analytics.',
          },
          {
            title: '2. How We Use Your Data',
            body:  'Your data is used solely to process orders, send order confirmation emails, and respond to enquiries. We do not sell, rent, or share your personal data with third parties for marketing purposes.',
          },
          {
            title: '3. Email Communications',
            body:  'If you subscribe to our mailing list, we will send drop previews and purchase receipts. You can unsubscribe at any time via the link in any email.',
          },
          {
            title: '4. Third-Party Services',
            body:  'We use Stripe for payment processing, Sanity for content management, Vercel for hosting, and Supabase for transactional data. Each of these services has their own privacy policy.',
          },
          {
            title: '5. Data Retention',
            body:  'Order data is retained for 7 years for legal and tax compliance. Mailing list data is retained until you unsubscribe.',
          },
          {
            title: '6. Your Rights',
            body:  'You may request access to, correction of, or deletion of your personal data at any time by emailing hello@galeriaxolo.com. We will respond within 30 days.',
          },
          {
            title: '7. Cookies',
            body:  'We use a single httpOnly cookie to identify your cart session. No tracking or advertising cookies are used.',
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
