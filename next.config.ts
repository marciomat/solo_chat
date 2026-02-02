import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Add empty turbopack config to suppress the error
  turbopack: {},
};

export default nextConfig;
