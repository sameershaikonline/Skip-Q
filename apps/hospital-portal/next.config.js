/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@healthcare/shared', '@healthcare/ui'],
};

module.exports = nextConfig;
