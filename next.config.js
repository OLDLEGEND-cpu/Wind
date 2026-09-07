/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'mysql2'],
    serverActions: { bodySizeLimit: '2mb' }
  }
};

module.exports = nextConfig;
