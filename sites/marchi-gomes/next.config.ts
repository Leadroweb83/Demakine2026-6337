import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Previews e enderecos .vercel.app ficam fora do Google; so o dominio oficial indexa.
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  images: { qualities: [75, 80], formats: ["image/avif", "image/webp"] },
  turbopack: { root: path.resolve(".") },
};

export default config;
