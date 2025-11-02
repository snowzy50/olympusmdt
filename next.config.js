/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporairement désactivé pour debug Realtime
  output: 'export', // Static export pour déploiement OVH
  images: {
    unoptimized: true, // Nécessaire pour static export
  },
  // Désactiver les features incompatibles avec static export
  trailingSlash: true, // Génère /dashboard/index.html au lieu de /dashboard
  eslint: {
    ignoreDuringBuilds: true, // Ignorer ESLint pendant le build pour déploiement
  },
  typescript: {
    ignoreBuildErrors: true, // Ignorer temporairement pour tester le déploiement
  },
}

module.exports = nextConfig
