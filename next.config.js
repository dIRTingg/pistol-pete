/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Clickjacking-Schutz — App darf nicht in iframes eingebettet werden
          { key: 'X-Frame-Options', value: 'DENY' },
          // MIME-Sniffing verhindern
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer auf gleiche Origin beschränken
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Kamera, Mikrofon, Standort deaktivieren
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Content Security Policy — frame-ancestors verhindert Clickjacking auch in modernen Browsern
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
