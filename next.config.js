/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript-Fehler beim Build ignorieren
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
