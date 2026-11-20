import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // Prisma usa binarios nativos: que no los empaquete el bundler.
  serverExternalPackages: ["@prisma/client", "cloudinary"],
};

export default nextConfig;
