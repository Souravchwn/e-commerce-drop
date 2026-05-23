import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  // Allow the Medusa backend URL for server-side fetches
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
}

export default nextConfig
