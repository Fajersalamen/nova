import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app lives inside the nova monorepo, which has its own root
  // package-lock.json — pin the trace root here so Next.js doesn't guess.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
