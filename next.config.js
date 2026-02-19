/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.b-cdn.net',
      },
    ],
  },
  
  // Security headers - protect against common vulnerabilities
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' iframe.mediadelivery.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: *.b-cdn.net",
              "font-src 'self' data:",
              "connect-src 'self' https://video.bunnycdn.com",
              "frame-src 'self' iframe.mediadelivery.net",
              "media-src 'self' *.b-cdn.net",
            ].join('; '),
          },
        ],
      },
      // Restrict sensitive paths
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },

  // Disable X-Powered-By header
  poweredByHeader: false,
}

module.exports = nextConfig
