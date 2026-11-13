import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  poweredByHeader: false,
  images: { qualities: [75, 80], formats: ["image/avif", "image/webp"] },
  turbopack: { root: path.resolve(".") },
};

export default config;
