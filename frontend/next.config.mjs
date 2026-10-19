/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Prevents vendor-chunks/@mui.js ENOENT crash on Fast Refresh full reloads
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Ignore source-map-loader warnings for framer-motion and the specific missing map file
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/framer-motion/ },
      { file: /LayoutGroupContext\.mjs\.map/ },
    ];
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

