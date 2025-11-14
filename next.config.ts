import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set the application root directory for Turbopack
    // This ensures consistent module resolution across dev and build
    root: __dirname,
  },
};

export default nextConfig;
