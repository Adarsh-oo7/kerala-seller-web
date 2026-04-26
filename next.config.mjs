/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fix: Next.js 16 uses Turbopack by default.
  // Add empty turbopack config to silence the webpack/turbopack warning.
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.keralasellers.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
