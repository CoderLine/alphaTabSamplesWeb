import type { NextConfig } from 'next';

// Set to the sub-path the app is served from, e.g. '/sub'.
const basePath = '';

const nextConfig: NextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath }
};

export default nextConfig;
