'use client';

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Cloudflare Images resizing via the /cdn-cgi/image/ path prefix. When the
 * media host isn't a Cloudflare zone with Image Resizing enabled, the
 * original URL still works — the prefix is simply not applied.
 */
export default function cloudflareImageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicBase || !src.startsWith(publicBase)) return src;

  const path = src.slice(publicBase.replace(/\/$/, '').length);
  const params = [`width=${width}`, `quality=${quality ?? 80}`, 'format=auto', 'fit=cover'];
  return `${publicBase.replace(/\/$/, '')}/cdn-cgi/image/${params.join(',')}${path}`;
}
