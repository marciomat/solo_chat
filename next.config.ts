import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Add empty turbopack config to suppress the error
  // Serwist uses webpack, so we need to explicitly allow this
  turbopack: {},
};

export default withSerwist(nextConfig);
