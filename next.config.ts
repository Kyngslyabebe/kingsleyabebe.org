/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Completely disable static optimization
  experimental: {
    staticPageGenerationTimeout: 0,
  },
  // Skip static page generation entirely
  output: 'standalone',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Disable static optimization for all pages
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig