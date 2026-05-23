import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      // Supabase requires SSL in production
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
      connection: {
        // Supabase free tier connection pooler settings
        pool: { min: 0, max: 5 },
      },
    },
    redisUrl:  process.env.REDIS_URL, // optional — omit to use in-memory store
    http: {
      storeCors:  process.env.STORE_CORS  ?? 'http://localhost:3000',
      adminCors:  process.env.ADMIN_CORS  ?? 'http://localhost:7001',
      authCors:   process.env.AUTH_CORS   ?? 'http://localhost:3000,http://localhost:7001',
      jwtSecret:  process.env.JWT_SECRET  ?? 'supersecret-change-me',
      cookieSecret: process.env.COOKIE_SECRET ?? 'supersecret-change-me',
    },
  },

  admin: {
    // Disable built-in admin in production if using a custom admin UI
    disable: process.env.DISABLE_MEDUSA_ADMIN === 'true',
    backendUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://localhost:9000',
  },

  modules: [
    // ── Stripe Payment Provider ────────────────────────────────────────────
    {
      resolve: '@medusajs/payment-stripe',
      options: {
        apiKey:        process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        capture:       true,
      },
    },
  ],
})
