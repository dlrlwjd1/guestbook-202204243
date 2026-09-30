import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  serverExternalPackages: ['@electric-sql/pglite'],
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
};
export default nextConfig;
