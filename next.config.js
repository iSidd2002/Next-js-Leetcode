/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  // Build configuration
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
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
