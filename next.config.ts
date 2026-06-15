import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/**" },
    ],
  },
  allowedDevOrigins: ['192.168.2.203', '192.168.2.28', 'localhost', '192.168.2.0/24'],
};

export default nextConfig;
