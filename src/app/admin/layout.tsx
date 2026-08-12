import type { ReactNode } from 'react';

export const metadata = { title: 'لوحة التحكم' };

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-neutral-50">{children}</div>;
}
