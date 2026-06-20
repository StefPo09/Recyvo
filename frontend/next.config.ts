import type { NextConfig } from "next";
import { resolve } from 'path';

// Set turbopack.root explicitly so Next/Turbopack uses the frontend folder
// as the workspace root. This avoids Turbopack inferring the workspace root
// from other lockfiles in the repository (which breaks module resolution).
const nextConfig: NextConfig = {
  turbopack: {
    // Absolute path to the frontend directory
    root: resolve(__dirname),
  },
  // Note: experimental.allowedDevOrigins is not a recognized option in this
  // Next version; omit it to avoid config warnings.
};

export default nextConfig;
