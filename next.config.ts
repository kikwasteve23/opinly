import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["pg"],
  async redirects() {
    return [
      { source: "/app/register", destination: "/register", permanent: false },
      { source: "/join/:code", destination: "/register?ref=:code", permanent: false },
      { source: "/share", destination: "/how-it-works", permanent: false },
    ];
  },
};

export default nextConfig;
