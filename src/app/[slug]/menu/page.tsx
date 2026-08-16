import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';
import { getRestaurantSiteData } from '@/lib/restaurant-site-data';
import { MenuList } from '@/components/public/MenuList';
import { CtaBand } from '@/components/public/CtaBand';
import { DonerLoop } from '@/components/public/DonerLoop';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data || 'configError' in data) return {};
  return { title: `القائمة | ${data.restaurant.name}` };
}

export default async function MenuPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data || 'configError' in data) notFound();

  const { restaurant, categories, items } = data;

  return (
    <main>
      {/* Black to match the footage's own backdrop, so the spit reads as
          floating rather than sitting in a visible video box. */}
      <section className="relative flex h-[88vh] min-h-[560px] flex-col items-center overflow-hidden bg-black">
        <div className="z-10 shrink-0 px-4 pt-8 text-center text-white sm:pt-10">
          <h1 className="text-5xl font-black tracking-tight drop-shadow-lg sm:text-6xl">القائمة</h1>
          <p className="mt-2 font-display text-xs tracking-[0.35em] text-accent-400">
            {restaurant.name}
          </p>
          {restaurant.hours_label && (
            <p className="mt-3 text-sm font-bold text-white/70">{restaurant.hours_label}</p>
          )}
        </div>

        <DonerLoop className="min-h-0 w-auto flex-1 object-contain py-2" />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent"
          aria-hidden
        />
        <ChevronDown className="absolute bottom-6 h-6 w-6 animate-bounce text-accent-400" aria-hidden />
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16">
        <MenuList categories={categories} items={items} />
      </div>

      <CtaBand
        phone={restaurant.phone_whatsapp}
        heading={restaurant.menu_cta_heading ?? 'جاهز تطلب؟ اتصل فينا.'}
      />
    </main>
  );
}
