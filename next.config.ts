import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Disable static page generation to avoid SSR issues with Leaflet
  output: 'standalone',

  // Enable experimental features if needed
  experimental: {
    optimizePackageImports: ['lucide-react', 'leaflet'],
  },
};

export default nextConfig;
