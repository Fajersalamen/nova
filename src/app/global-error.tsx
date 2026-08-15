'use client';

import { Cairo } from 'next/font/google';
import { ErrorFallback } from '@/components/ErrorFallback';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-sans' });

/**
 * Catches errors thrown by the root layout itself (below this, error.tsx
 * boundaries handle everything else). Next.js requires this file to render
 * its own <html>/<body> since the root layout that would normally provide
 * them is what may have failed.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-sans">
        <ErrorFallback reset={reset} />
      </body>
    </html>
  );
}
