import { AwsClient } from 'aws4fetch';

/**
 * R2 is S3-compatible, and aws4fetch is a ~1.5kb signer built on the Fetch
 * API (no Node.js crypto/stream APIs) — that's what makes it work in the
 * Cloudflare Pages edge runtime, unlike the full @aws-sdk/client-s3.
 */
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not configured (see .env.example).');
  }

  return {
    client: new AwsClient({ accessKeyId, secretAccessKey, service: 's3', region: 'auto' }),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  };
}

export interface PresignUploadOptions {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}

/**
 * Returns a presigned PUT URL the browser can upload directly to, so
 * uploads never pass through our own server/functions.
 */
export async function presignUpload({
  key,
  contentType,
  expiresInSeconds = 300,
}: PresignUploadOptions): Promise<{ uploadUrl: string; publicUrl: string }> {
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!bucket || !publicBase) {
    throw new Error('R2 bucket/public URL are not configured (see .env.example).');
  }

  const { client, endpoint } = getR2Client();
  const url = new URL(`${endpoint}/${bucket}/${key}`);
  url.searchParams.set('X-Amz-Expires', String(expiresInSeconds));

  const signed = await client.sign(
    new Request(url, { method: 'PUT', headers: { 'content-type': contentType } }),
    { aws: { signQuery: true } },
  );

  return {
    uploadUrl: signed.url,
    publicUrl: `${publicBase.replace(/\/$/, '')}/${key}`,
  };
}

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25MB

export function assertAllowedMedia(contentType: string, sizeBytes: number) {
  if (ALLOWED_IMAGE_TYPES.has(contentType)) {
    if (sizeBytes > MAX_IMAGE_BYTES) {
      throw new Error('Image is too large (max 5MB).');
    }
    return 'image' as const;
  }
  if (ALLOWED_VIDEO_TYPES.has(contentType)) {
    if (sizeBytes > MAX_VIDEO_BYTES) {
      throw new Error('Video is too large (max 25MB).');
    }
    return 'video' as const;
  }
  throw new Error('Unsupported file type.');
}
