/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode catches React bugs early
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Cloudinary — where all product/store images live
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Production backend (in case any images are served from VPS)
      {
        protocol: 'https',
        hostname: 'api.keralasellers.in',
        pathname: '/**',
      },
      // YouTube thumbnails (for tutorial embeds on landing page)
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
  },

  // Suppress noisy build warnings from known packages
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default nextConfig;
