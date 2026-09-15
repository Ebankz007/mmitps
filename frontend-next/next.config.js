const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: path.join(__dirname, '../'),
    experimental: {},
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    // Proxy all /api/* calls to the Express backend
    async rewrites() {
        return [
            // AI Analysis Engines (Python FastAPI - Port 8000)
            {
                source: '/api/seasonality/:path*',
                destination: 'http://localhost:8000/api/seasonality/:path*',
            },
            {
                source: '/api/geometry/:path*',
                destination: 'http://localhost:8000/api/geometry/:path*',
            },
            {
                source: '/api/volume/:path*',
                destination: 'http://localhost:8000/api/volume/:path*',
            },
            {
                source: '/api/v1/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5066'}/api/v1/:path*`,
            },
        ];
    },
    // Image domains for external images - Next.js 15 compliant
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'cdn.simpleicons.org' },
            { protocol: 'https', hostname: 'mmitps.com' },
        ],
    },
    // Production optimization: output standalone for smaller Docker images
    output: 'standalone',
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname),
        };
        return config;
    },
};

module.exports = nextConfig;
