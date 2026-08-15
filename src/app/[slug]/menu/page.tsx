import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRestaurantSiteData } from '@/lib/restaurant-site-data';
import { MenuList } from '@/components/public/MenuList';
import { CtaBand } from '@/components/public/CtaBand';
import { T } from '@/components/public/T';

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
      <section className="bg-brand-600 py-16 text-center text-white">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
          <T k="menuPageTitle" />
        </h1>
        {restaurant.hours_label && (
          <p className="mt-4 text-sm font-bold opacity-90">{restaurant.hours_label}</p>
        )}
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16">
        <MenuList categories={categories} items={items} />
      </div>

      <CtaBand phone={restaurant.phone_whatsapp} heading={<T k="menuCta" />} />
    </main>
  );
}
