import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { CartProvider } from '@/components/frankies-cake/cart/CartProvider';
import { MotionRoot } from '@/components/frankies-cake/ui/MotionRoot';
import { SiteUIProvider } from '@/components/frankies-cake/ui/SiteUIProvider';
import './frankies.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fc-serif',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-fc-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Frankies Cake — Handcrafted Happiness',
  description:
    'Beautiful cakes, made with love for your sweetest moments. Handcrafted in Amman, delivered with care.',
};

export default function FrankiesCakeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      dir="ltr"
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} fc-scope relative isolate bg-fc-cream font-fc-sans text-fc-cocoa antialiased`}
    >
      <MotionRoot>
        <SiteUIProvider>
          <CartProvider>{children}</CartProvider>
        </SiteUIProvider>
      </MotionRoot>
    </div>
  );
}
