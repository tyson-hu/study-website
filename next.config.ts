import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.blooket.com",
        pathname: "/image/**",
      },
    ],
  },
};

export default nextConfig;
