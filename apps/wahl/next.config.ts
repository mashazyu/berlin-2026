import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "berlin-2026.de" }],
        destination: "https://www.berlin-2026.de/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "wahl.kompass.berlin" }],
        destination: "https://www.wahl.kompass.berlin/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
