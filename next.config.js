const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['donte.ngrok.io', '*.donte.ngrok.io', 'local-origin.dev', '*.local-origin.dev'],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.zoom.us',
        pathname: '/p/v2/**',
      },
      {
        protocol: 'https',
        hostname: 'zoom.us',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images2.welcomesoftware.com',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000;',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              connect-src 'self' ${supabaseURL} ${supabaseURL.replace(/^https:\/\//), 'wss://' , 'https://top-monitor-23377.upstash.io'};
              img-src 'self' data: https:  https://images2.welcomesoftware.com,
              font-src 'self';
              frame-src 'self';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
