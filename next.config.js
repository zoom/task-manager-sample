/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;
