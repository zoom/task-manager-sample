const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
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
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000;'
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff"
                    },
                    {
                        key: "Content-Security-Policy",
                        value: `default-src 'self' 'unsafe-inline' 'unsafe-eval' ${supabaseURL};connect-src https://donte-backend.ngrok.io;`
                    },
                    {
                        key: "Referrer-Policy",
                        value: "same-origin"
                    }
                ]
            }
        ];
    }
};

module.exports = nextConfig;