import Image from 'next/image';
import { WhatsAppButton } from './WhatsAppButton';

interface Props {
  restaurantName: string;
  logoUrl: string | null;
  address: string | null;
  phoneWhatsapp: string;
  hasMenu: boolean;
  hasReviews: boolean;
  hasMap: boolean;
}

const NAV_LINKS = [
  { href: '#hero', label: 'الرئيسية' },
  { href: '#menu-heading', label: 'القائمة' },
  { href: '#reviews-heading', label: 'آراء الزبائن' },
  { href: '#map-heading', label: 'موقعنا' },
] as const;

export function SiteHeader({
  restaurantName,
  logoUrl,
  address,
  phoneWhatsapp,
  hasMenu,
  hasReviews,
  hasMap,
}: Props) {
  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.href === '#menu-heading') return hasMenu;
    if (link.href === '#reviews-heading') return hasReviews;
    if (link.href === '#map-heading') return hasMap;
    return true;
  });

  return (
    <header className="sticky top-0 z-30 border-b-2 border-accent-500 bg-brand-600">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={restaurantName}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border-2 border-white/70 object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/70 bg-white/10 text-lg font-bold text-white"
            >
              {restaurantName.charAt(0)}
            </div>
          )}
          <div className="leading-tight">
            <p className="font-bold text-accent-400">{restaurantName}</p>
            {address && <p className="text-xs text-white/80">{address}</p>}
          </div>
        </div>

        <nav aria-label="روابط الموقع" className="hidden gap-6 md:flex">
          {visibleLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90 transition hover:text-accent-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <WhatsAppButton
          phoneWhatsapp={phoneWhatsapp}
          restaurantName={restaurantName}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-400 px-4 py-2 text-sm font-bold text-brand-900 transition hover:bg-accent-500"
        >
          اطلب الآن
        </WhatsAppButton>
      </div>
    </header>
  );
}
