import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Enable experimental features if needed
  experimental: {
    optimizePackageImports: ['lucide-react', 'leaflet'],
  },
};

export default nextConfig;
