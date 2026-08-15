'use client';

import { useEffect } from 'react';

interface Props {
  reset: () => void;
}

/**
 * A fresh deploy invalidates the previous build's JS chunk hashes. A
 * browser that already had a page open from before the deploy — in-app
 * browsers (WhatsApp, Instagram, etc.) are especially prone to this — can
 * throw trying to hydrate against a chunk that no longer exists. That's a
 * one-time condition: reloading once fetches the current build and the
 * visitor never needs to see an error at all. Guarded by sessionStorage so
 * a real, persistent error shows the retry button instead of loop-reloading.
 */
export function ErrorFallback({ reset }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sessionStorage.getItem('nova-error-retry')) {
      sessionStorage.setItem('nova-error-retry', '1');
      window.location.reload();
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">حدث خطأ غير متوقع</h1>
      <p className="text-neutral-600">صار في مشكلة مؤقتة بالتحميل. جرّب مرة ثانية.</p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700"
      >
        إعادة المحاولة
      </button>
    </main>
  );
}
