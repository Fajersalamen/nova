import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nova — منصة مواقع المطاعم',
  description: 'موقع جاهز لمطعمك: منيو، واتساب، خرائط، وتقييمات.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
