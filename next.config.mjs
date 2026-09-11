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
      {
        source: '/solutions/instagram-sellers',
        destination: '/for/instagram-sellers',
        permanent: true,
      },
      {
        source: '/solutions/whatsapp-sellers',
        destination: '/for/whatsapp-sellers',
        permanent: true,
      },
      {
        source: '/solutions/home-businesses',
        destination: '/for/home-businesses',
        permanent: true,
      },
      {
        source: '/solutions/small-businesses',
        destination: '/for/small-businesses',
        permanent: true,
      },
      {
        source: '/solutions/social-media-sellers',
        destination: '/for/social-media-sellers',
        permanent: true,
      },
      {
        source: '/solutions',
        destination: '/features',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
