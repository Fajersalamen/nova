'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock } from 'lucide-react';
import { useT } from './LocaleProvider';
import { LanguageToggle } from './LanguageToggle';
import type { StringKey } from '@/lib/i18n';

interface Props {
  slug: string;
  restaurantName: string;
  logoUrl: string | null;
  phone: string;
  hoursLabel: string | null;
}

export function SiteHeader({ slug, restaurantName, logoUrl, phone, hoursLabel }: Props) {
  const pathname = usePathname();
  const t = useT();
  const navItems: { href: string; key: StringKey }[] = [
    { href: `/${slug}`, key: 'navHome' },
    { href: `/${slug}/menu`, key: 'navMenu' },
    { href: `/${slug}/about`, key: 'navAbout' },
    { href: `/${slug}/contact`, key: 'navContact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-4 border-accent-400 bg-brand-600 text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={`/${slug}`} className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${t('logoAlt')} ${restaurantName}`}
              width={48}
              height={48}
              className="h-12 w-auto drop-shadow-md"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/70 bg-white/10 text-lg font-bold"
            >
              {restaurantName.charAt(0)}
            </div>
          )}
          <span className="block text-sm font-bold leading-tight">{restaurantName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-bold transition-colors hover:text-accent-400 ${
                pathname === item.href ? 'text-accent-400' : ''
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {hoursLabel && (
            <span className="hidden items-center gap-1.5 text-xs font-bold lg:flex">
              <Clock className="h-4 w-4 text-accent-400" aria-hidden />
              {hoursLabel}
            </span>
          )}
          <LanguageToggle className="rounded-full border border-white/40 px-2.5 py-1 text-xs font-bold transition-colors hover:border-accent-400 hover:text-accent-400" />
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="rounded-full bg-accent-400 px-4 py-2 text-sm font-black text-accent-900 shadow transition-transform hover:scale-105"
          >
            {t('orderNow')}
          </a>
        </div>
      </div>

      <nav
        className="flex items-center justify-center gap-5 border-t border-white/15 py-2 md:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-xs font-bold transition-colors hover:text-accent-400 ${
              pathname === item.href ? 'text-accent-400' : ''
            }`}
          >
            {t(item.key)}
          </Link>
        ))}
      </nav>
    </header>
  );
}
