import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@prisma/client",
    "bcryptjs",
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "@prisma/adapter-mariadb",
  ],
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
}

export default nextConfig
