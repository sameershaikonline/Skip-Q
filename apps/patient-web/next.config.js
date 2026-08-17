/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@healthcare/shared', '@healthcare/ui'],
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
};

module.exports = nextConfig;
