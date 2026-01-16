import type { NextConfig } from 'next';

// Only use /art basePath in production deployment
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/art' : '';

const nextConfig: NextConfig = {
  basePath: basePath,
  // Ensure assets are served from the correct path
  assetPrefix: basePath,
};

export default nextConfig;
