/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  // Build configuration
  typescript: {
    // Type errors must be fixed before deployment
    ignoreBuildErrors: false,
  },

  // External packages
  serverExternalPackages: ['mongoose'],

  // Turbopack configuration (Next.js 16+)
  turbopack: {},

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Security Notes:
  // - Request size limits: Handled in src/lib/request-validation.ts
  // - Security headers: Applied dynamically in middleware.ts
  // - CSRF protection: Implemented in src/lib/csrf.ts
  // - Body parsing limits: Handled by Next.js Route Handlers (default 4MB)
}

module.exports = nextConfig
