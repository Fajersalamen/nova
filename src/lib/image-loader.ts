interface LoaderArgs {
  src: string;
}

/**
 * Passthrough loader: next/image's built-in optimizer needs a Node.js
 * server, which isn't available on Cloudflare Workers, so images are
 * served as uploaded (already compressed to WebP client-side before
 * upload — see MediaUploader). Cloudflare's /cdn-cgi/image/ resizing path
 * only works on a proper Cloudflare-proxied zone, not on the free
 * pub-*.r2.dev bucket URL, so it isn't used here.
 */
export default function r2ImageLoader({ src }: LoaderArgs): string {
  return src;
}
