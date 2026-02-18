import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: 20 * 1024 * 1024,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'goodsco.com.co',
      },
    ],
  },
};

export default nextConfig;
