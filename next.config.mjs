/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
