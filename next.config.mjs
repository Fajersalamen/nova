/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // next/image's default optimizer needs a Node.js server and isn't
    // available on Cloudflare Pages, so images are served pre-optimized
    // from R2/CDN instead and this loader just passes the URL through.
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
  },
};

export default nextConfig;
