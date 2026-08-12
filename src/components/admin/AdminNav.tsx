'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  restaurantName: string;
  restaurantSlug: string;
  email: string;
}

const LINKS = [
  { href: '/admin', label: 'نظرة عامة' },
  { href: '/admin/menu', label: 'المنيو' },
  { href: '/admin/reviews', label: 'التقييمات' },
  { href: '/admin/settings', label: 'إعدادات المطعم' },
];

export function AdminNav({ restaurantName, restaurantSlug, email }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <header className="space-y-4 border-b border-neutral-200 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{restaurantName}</h1>
          <p className="text-sm text-neutral-500">{email}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href={`/${restaurantSlug}`}
            target="_blank"
            className="font-medium text-brand-700 hover:underline"
          >
            عرض الموقع ↗
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            خروج
          </button>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1">
        {LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
