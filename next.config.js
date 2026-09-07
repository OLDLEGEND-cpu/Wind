/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'mysql2'],
    serverActions: { bodySizeLimit: '2mb' }
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3', 'mysql2'];
    }
    return config;
  }
};

module.exports = nextConfig;
