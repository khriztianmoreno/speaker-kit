import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js the monorepo root so it doesn't warn about multiple lockfiles
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
