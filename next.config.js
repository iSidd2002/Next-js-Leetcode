/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  // Build configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // External packages
  serverExternalPackages: ['mongoose'],

  // Webpack configuration
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }

    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // API configuration - Request size limits for security
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Limit request body size to 1MB
    },
    responseLimit: '4mb', // Limit response size to 4MB
    externalResolver: true,
  },

  // Headers moved to middleware.ts for more flexibility
  // Security headers are now applied dynamically in middleware
}

module.exports = nextConfig
