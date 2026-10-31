import { AlphaTabWebPackPlugin } from '@coderline/alphatab-webpack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    config.plugins.push(
      new AlphaTabWebPackPlugin({
        // Next.js serves static files only from public/ (also in dev).
        assetOutputDir: 'public/alphatab'
      })
    );
    return config;
  }
};

export default nextConfig;
