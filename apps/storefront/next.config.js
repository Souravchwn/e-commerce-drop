/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig
