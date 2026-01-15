import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/art',
  // Ensure assets are served from the correct path
  assetPrefix: '/art',
};

export default nextConfig;
