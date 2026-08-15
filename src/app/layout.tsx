import type { Metadata } from 'next';
import Script from 'next/script';
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
      <body className="font-sans">
        {/* A stale cached page (a redeploy invalidates the previous
            build's file hashes) can reference a stylesheet/script that no
            longer exists, which the page loads with visibly no styling
            applied. beforeInteractive runs this ahead of hydration so it
            catches that failure even if React itself never gets a chance
            to run, and self-heals with a single reload. */}
        <Script id="asset-watchdog" strategy="beforeInteractive">
          {`(function(){try{document.addEventListener('error',function(e){var t=e.target;if(!t||!t.tagName)return;var isStatic=(t.tagName==='LINK'&&t.rel==='stylesheet'&&t.href&&t.href.indexOf('/_next/')!==-1)||(t.tagName==='SCRIPT'&&t.src&&t.src.indexOf('/_next/')!==-1);if(!isStatic)return;if(sessionStorage.getItem('nova-asset-retry'))return;sessionStorage.setItem('nova-asset-retry','1');window.location.reload();},true);}catch(err){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
