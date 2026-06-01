import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

function supabaseStorageRemotePatterns(): URL[] {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return [];
  try {
    return [new URL(`${base}/storage/v1/object/**`)];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // Use this app as Turbopack root when a parent folder has another package-lock.json.
  turbopack: {
    root: configDir,
  },
  images: {
    remotePatterns: supabaseStorageRemotePatterns(),
  },
};

export default nextConfig;
