import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { configErrorMessage, missingSupabaseEnv } from '@/lib/env';
import { getAllActiveSlugs, getRestaurantSiteData } from '@/lib/restaurant-site-data';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { LocaleProvider } from '@/components/public/LocaleProvider';

// Static-with-revalidation instead of per-request SSR: the menu changes a
// few times a week at most, but the page is hit by every visitor. Serving
// a cached copy and refreshing it in the background keeps TTFB at CDN
// speed. Admin edits don't wait for this window — the menu/settings server
// actions call revalidatePath('layout') on this segment as soon as a save
// succeeds.
export const revalidate = 120;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

// Prerenders every active restaurant at build time. Restaurants added
// afterwards still work: dynamicParams defaults to true, so an unknown
// slug is rendered on first request and then cached like the rest.
export async function generateStaticParams() {
  const slugs = await getAllActiveSlugs();
  return slugs.map((slug) => ({ slug }));
}

// The browser tab icon for a restaurant's whole site is its own uploaded
// logo, not a shared platform icon — falls back to the default favicon
// when a restaurant hasn't uploaded one yet.
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data || 'configError' in data || !data.restaurant.logo_url) return {};
  return { icons: { icon: data.restaurant.logo_url } };
}

export default async function RestaurantLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data) notFound();

  // A misconfigured deployment is an operator problem, not a missing page —
  // say so plainly instead of rendering a misleading 404.
  if ('configError' in data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-2xl font-bold text-neutral-900">إعدادات الموقع غير مكتملة</h1>
        <pre className="whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700">
          {configErrorMessage(missingSupabaseEnv())}
        </pre>
      </main>
    );
  }

  const { restaurant } = data;

  return (
    <LocaleProvider>
      <div className="flex min-h-screen flex-col bg-cream">
        <SiteHeader
          slug={slug}
          restaurantName={restaurant.name}
          logoUrl={restaurant.logo_url}
          phone={restaurant.phone_whatsapp}
          hoursLabel={restaurant.hours_label}
        />
        <div className="flex-1">{children}</div>
        <SiteFooter
          slug={slug}
          restaurantName={restaurant.name}
          logoUrl={restaurant.logo_url}
          address={restaurant.address}
          phone={restaurant.phone_whatsapp}
          hoursLabel={restaurant.hours_label}
          mapsUrl={
            restaurant.address
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`
              : null
          }
        />
      </div>
    </LocaleProvider>
  );
}
