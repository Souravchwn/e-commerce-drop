import { defineMiddlewares } from '@medusajs/medusa'
import { authenticate } from '@medusajs/framework/http'

export default defineMiddlewares({
  routes: [
    // Protect all /admin/* routes with Medusa's built-in bearer token auth
    {
      matcher: '/admin/*',
      middlewares: [authenticate('user', ['bearer', 'session'])],
    },
    // Allow unauthenticated access to /store/* (storefront SDK uses publishable key)
    {
      matcher: '/store/*',
      middlewares: [],
    },
  ],
})
