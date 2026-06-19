import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "drizzle-orm"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/api/files/**",
      },
    ],
  },
};

export default nextConfig;
