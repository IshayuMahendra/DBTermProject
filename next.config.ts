import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [ {
      protocol: 'https',
      hostname: 'pollster.s3.us-east-005.backblazeb2.com',
      pathname: '**',
    }]
  },
  reactStrictMode: false
};

export default nextConfig;
