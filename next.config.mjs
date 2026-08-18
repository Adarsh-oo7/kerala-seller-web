/** @type {import('next').NextConfig} */
const nextConfig = {
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
