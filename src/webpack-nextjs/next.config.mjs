import { AlphaTabWebPackPlugin } from '@coderline/alphatab/webpack'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.plugins.push(
      new AlphaTabWebPackPlugin()
    );
    return config;
  },
};

export default nextConfig;
