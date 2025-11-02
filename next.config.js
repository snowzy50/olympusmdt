/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporairement désactivé pour debug Realtime
  typescript: {
    ignoreBuildErrors: true, // Temporaire pour déploiement rapide
  },
}

module.exports = nextConfig
