import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Use this app as Turbopack root when a parent folder has another package-lock.json.
  turbopack: {
    root: configDir,
  },
};

export default nextConfig;
