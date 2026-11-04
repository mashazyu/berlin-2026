import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@kompass/ui", "@kompass/landing", "@kompass/fonts"],
}

export default nextConfig
