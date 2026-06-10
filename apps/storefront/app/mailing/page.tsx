import Footer from '../../components/Footer'

export const metadata = { title: 'Mailing List' }

export default function MailingPage() {
  return (
    <main>
      <div className="border-b border-s-border px-4 py-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-s-fg">Mailing List</h1>
      </div>

      <div className="max-w-md px-4 py-12">
        <p className="text-2xs uppercase tracking-widest text-s-muted mb-4 font-semibold">
          Drop notifications
        </p>
        <h2 className="text-3xl font-black uppercase leading-tight text-s-fg mb-4">
          Get early access.
        </h2>
        <p className="text-sm text-s-muted leading-relaxed mb-8">
          Subscribe to be notified 24 hours before each drop goes live.
          No spam — drops only.
        </p>

        <form
          action="https://app.convertkit.com/forms/subscribe"
          method="post"
          className="flex flex-col gap-3"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div>
            <label htmlFor="email" className="text-2xs uppercase tracking-widest text-s-muted block mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email_address"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-3 py-3 bg-s-bg border border-s-border text-sm text-s-fg placeholder:text-s-muted focus:outline-none focus:border-s-fg transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-s-fg text-s-bg text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-s-red hover:text-white transition-colors duration-150"
          >
            Subscribe
          </button>

          <p className="text-2xs text-s-muted">
            Unsubscribe any time. No tracking, no sharing. See our{' '}
            <a href="/privacy" className="underline hover:text-s-fg transition-colors">privacy policy</a>.
          </p>
        </form>
      </div>

      <Footer />
    </main>
  )
}
