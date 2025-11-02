/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporairement désactivé pour debug Realtime
  typescript: {
    ignoreBuildErrors: true, // Temporaire pour déploiement rapide
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignorer ESLint pendant le build
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
