/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Prevents vendor-chunks/@mui.js ENOENT crash on Fast Refresh full reloads
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Strip //# sourceMappingURL comments from framer-motion so the browser
    // doesn't make 404 requests for .map files that don't exist in the package.
    config.module.rules.push({
      test: /node_modules[/\\]framer-motion[/\\].*\.m?js$/,
      enforce: 'pre',
      use: [{ loader: path.resolve(__dirname, 'strip-sourcemap-loader.cjs') }],
    });

    // Suppress webpack build-time source-map warnings
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


