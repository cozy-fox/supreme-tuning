/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Enable standalone output for Docker
  output: 'standalone',

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Allow unoptimized images for local brand logos
    unoptimized: false,
  },

  // SEO: Trailing slashes for cleaner URLs
  trailingSlash: false,

  // Environment variables
  env: {
    SITE_URL: process.env.SITE_URL || 'https://supremetuning.nl',
    SITE_NAME: 'Supreme Tuning',
  },
};

module.exports = nextConfig;

