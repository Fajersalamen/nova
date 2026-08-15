'use client';

import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

interface Props {
  kind: 'image' | 'video';
  value: string;
  onChange: (url: string) => void;
  label: string;
  hint?: string;
}

const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

export function MediaUploader({ kind, value, onChange, label, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      let upload: File | Blob = file;

      if (kind === 'image') {
        // Compressing in the browser means R2 only ever stores
        // web-sized WebP, so no server-side transform step is needed.
        upload = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          fileType: 'image/webp',
          useWebWorker: true,
        });
      } else if (file.size > MAX_VIDEO_BYTES) {
        throw new Error('حجم الفيديو كبير جدًا (الحد الأقصى 25 ميجابايت).');
      }

      const contentType = kind === 'image' ? 'image/webp' : file.type;
      const fileName = kind === 'image' ? `${file.name.replace(/\.[^.]+$/, '')}.webp` : file.name;

      const presignResponse = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileName, contentType, sizeBytes: upload.size }),
      });

      if (!presignResponse.ok) {
        const body = (await presignResponse.json()) as { error?: string };
        throw new Error(body.error ?? 'تعذّر تجهيز الرفع.');
      }

      const { uploadUrl, publicUrl } = (await presignResponse.json()) as {
        uploadUrl: string;
        publicUrl: string;
      };

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        // Must match the headers the server signed into the presigned URL
        // exactly, or R2 rejects the upload with a signature mismatch.
        headers: { 'content-type': contentType, 'cache-control': 'public, max-age=31536000, immutable' },
        body: upload,
      });

      if (!uploadResponse.ok) throw new Error('فشل رفع الملف.');

      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الرفع.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">{label}</label>

      {value && (
        <div className="flex items-center gap-3">
          {kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-16 w-16 rounded-md object-cover" />
          ) : (
            <video src={value} muted className="h-16 w-16 rounded-md object-cover" />
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-sm text-red-700 hover:underline"
          >
            إزالة
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={kind === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm'}
        onChange={handleFile}
        disabled={isUploading}
        className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-neutral-200"
      />

      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      {isUploading && <p className="text-xs text-neutral-500">جارٍ الرفع…</p>}
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
