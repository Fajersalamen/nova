import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Phone } from 'lucide-react';

interface Props {
  slug: string;
  restaurantName: string;
  logoUrl: string | null;
  address: string | null;
  phone: string;
  hoursLabel: string | null;
  mapsUrl: string | null;
}

export function SiteFooter({
  slug,
  restaurantName,
  logoUrl,
  address,
  phone,
  hoursLabel,
  mapsUrl,
}: Props) {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={restaurantName}
                width={64}
                height={64}
                className="h-16 w-auto"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-xl font-bold"
              >
                {restaurantName.charAt(0)}
              </div>
            )}
            <span className="block text-sm font-bold">{restaurantName}</span>
          </div>
        </div>

        <nav aria-label="Quick links">
          <h3 className="mb-4 text-sm font-black tracking-wide text-accent-400">روابط سريعة</h3>
          <ul className="space-y-2 text-sm font-bold">
            <li>
              <Link href={`/${slug}`} className="opacity-80 transition-opacity hover:opacity-100">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link href={`/${slug}/menu`} className="opacity-80 transition-opacity hover:opacity-100">
                القائمة
              </Link>
            </li>
            <li>
              <Link href={`/${slug}/about`} className="opacity-80 transition-opacity hover:opacity-100">
                من نحن
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/contact`}
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                اتصل بنا
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 text-sm font-black tracking-wide text-accent-400">تواصل معنا</h3>
          <ul className="space-y-3 text-sm font-bold">
            <li>
              <a
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                className="flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100"
              >
                <Phone className="h-4 w-4 text-accent-400" aria-hidden />
                <span dir="ltr">{phone}</span>
              </a>
            </li>
            {address && (
              <li>
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                    {address}
                  </a>
                ) : (
                  <span className="flex items-center gap-2 opacity-80">
                    <MapPin className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                    {address}
                  </span>
                )}
              </li>
            )}
            {hoursLabel && (
              <li className="flex items-center gap-2 opacity-80">
                <Clock className="h-4 w-4 text-accent-400" aria-hidden />
                {hoursLabel}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 py-5 text-center text-xs font-bold opacity-70">
        © {new Date().getFullYear()} {restaurantName}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
