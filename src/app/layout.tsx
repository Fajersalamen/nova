import type { Metadata } from 'next';
import { Anton, Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-sans' });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Nova — منصة مواقع المطاعم',
  description: 'موقع جاهز لمطعمك: منيو، واتساب، خرائط، وتقييمات.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${anton.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
