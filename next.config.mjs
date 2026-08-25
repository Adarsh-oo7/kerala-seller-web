/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      {
        source: '/store/:path*',
        destination: '/shop/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
