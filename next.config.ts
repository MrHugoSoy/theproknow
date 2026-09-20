import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite compilar (`NEXT_DIST_DIR=.next-build next build`) sin pisar el `.next` de `next dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
