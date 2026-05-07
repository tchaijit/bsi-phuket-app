import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Enable experimental features if needed
  experimental: {
    optimizePackageImports: ['lucide-react', 'leaflet'],
  },

  // Webpack config for Leaflet
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

export default nextConfig;
