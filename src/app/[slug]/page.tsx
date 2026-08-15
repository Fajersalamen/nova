import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createPublicClientOrNull } from '@/lib/supabase/public';
import { configErrorMessage, missingSupabaseEnv } from '@/lib/env';
import { fetchGoogleReviews } from '@/lib/google-places';
import { MenuList } from '@/components/public/MenuList';
import { MapEmbed } from '@/components/public/MapEmbed';
import { CallButton } from '@/components/public/CallButton';
import { ReviewsSection } from '@/components/public/ReviewsSection';
import { ReviewForm } from '@/components/public/ReviewForm';
import { BranchesSection } from '@/components/public/BranchesSection';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { FeatureStrip } from '@/components/public/FeatureStrip';
import type {
  MenuCategory,
  MenuItem,
  Restaurant,
  RestaurantBranch,
  Review,
} from '@/types/database.types';

// Static-with-revalidation instead of per-request SSR: the menu changes a
// few times a week at most, but the page is hit by every visitor. Serving
// a cached copy and refreshing it in the background keeps TTFB at CDN
// speed. Admin edits don't wait for this window — the menu server actions
// call revalidatePath on this route as soon as a save succeeds.
export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Prerenders every active restaurant at build time. Restaurants added
// afterwards still work: dynamicParams defaults to true, so an unknown
// slug is rendered on first request and then cached like the rest.
//
// Prerendering is a pure optimization here, so every failure path below
// degrades to an empty list rather than failing the build — missing
// build-time credentials or an unreachable database just means pages get
// rendered on demand instead.
export async function generateStaticParams() {
  const supabase = createPublicClientOrNull();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('slug')
      .neq('subscription_status', 'canceled');

    if (error || !data) return [];

    return data.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

// Distinguishes "this deployment is misconfigured" from "no such
// restaurant", so a missing env var doesn't masquerade as a 404.
const CONFIG_ERROR = { configError: true } as const;

async function getRestaurantData(slug: string) {
  const supabase = createPublicClientOrNull();
  if (!supabase) return CONFIG_ERROR;

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!restaurant || restaurant.subscription_status === 'canceled') return null;

  const [categoriesResult, itemsResult, reviewsResult, branchesResult] = await Promise.all([
    supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('display_order', { ascending: true }),
    supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_available', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('reviews')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('restaurant_branches')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('display_order', { ascending: true }),
  ]);

  return {
    restaurant: restaurant as Restaurant,
    categories: (categoriesResult.data ?? []) as MenuCategory[],
    items: (itemsResult.data ?? []) as MenuItem[],
    internalReviews: (reviewsResult.data ?? []) as Review[],
    branches: (branchesResult.data ?? []) as RestaurantBranch[],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRestaurantData(slug);
  if (!data) return { title: 'المطعم غير موجود' };
  if ('configError' in data) return { title: 'إعدادات الموقع غير مكتملة' };

  const { restaurant } = data;
  return {
    title: restaurant.name,
    description: restaurant.address
      ? `${restaurant.name} — ${restaurant.address}`
      : `منيو وطلبات ${restaurant.name}`,
    openGraph: {
      title: restaurant.name,
      images: restaurant.logo_url ? [restaurant.logo_url] : undefined,
    },
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getRestaurantData(slug);
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

  const { restaurant, categories, items, internalReviews, branches } = data;

  // Google reviews take precedence when the restaurant has linked a Place
  // ID; otherwise the internal moderated reviews are shown.
  const google = restaurant.google_place_id
    ? await fetchGoogleReviews(restaurant.google_place_id)
    : { reviews: [], averageRating: null, totalRatings: null };

  const hasMenu = items.length > 0;
  const hasReviews = google.reviews.length > 0 || internalReviews.length > 0;
  const hasMap = Boolean(restaurant.google_maps_embed_url);

  // First photographed dish stands in for a hero shot — never a stock
  // image, since we only show media the restaurant actually uploaded.
  const heroImage = items.find((item) => item.image_url)?.image_url ?? null;

  // Real rating data only — Google's when linked, otherwise the average of
  // the site's own approved reviews. Never a placeholder count.
  const ratingValue =
    google.averageRating ??
    (internalReviews.length > 0
      ? internalReviews.reduce((sum, r) => sum + r.rating, 0) / internalReviews.length
      : null);
  const ratingCount =
    google.totalRatings ?? (internalReviews.length > 0 ? internalReviews.length : null);

  return (
    <>
      <SiteHeader
        restaurantName={restaurant.name}
        logoUrl={restaurant.logo_url}
        address={restaurant.address}
        phone={restaurant.phone_whatsapp}
        hasMenu={hasMenu}
        hasReviews={hasReviews}
        hasMap={hasMap}
      />

      <div className="bg-cream">
        <section id="hero" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className={`grid items-center gap-10 ${heroImage ? 'lg:grid-cols-2' : ''}`}>
            <div className="space-y-6 text-center lg:order-2 lg:text-right">
              <span className="inline-block rounded-full bg-brand-600/10 px-4 py-1.5 text-sm font-semibold text-brand-700">
                {restaurant.name}
                {restaurant.address ? ` — ${restaurant.address}` : ''}
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                <CallButton
                  phone={restaurant.phone_whatsapp}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-600 px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-600 hover:text-white"
                >
                  <span dir="ltr">{restaurant.phone_whatsapp}</span>
                </CallButton>
                {hasMenu && (
                  <a
                    href="#menu-heading"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
                  >
                    شاهد القائمة
                  </a>
                )}
              </div>
            </div>

            {heroImage && (
              <div className="relative mx-auto w-full max-w-md lg:order-1">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
                  <Image
                    src={heroImage}
                    alt={restaurant.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                {restaurant.logo_url && (
                  <Image
                    src={restaurant.logo_url}
                    alt={restaurant.name}
                    width={72}
                    height={72}
                    className="absolute -top-4 right-4 h-16 w-16 rounded-full border-4 border-cream object-cover shadow-lg sm:h-[72px] sm:w-[72px]"
                  />
                )}

                {ratingValue !== null && (
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-accent-400 px-3 py-1.5 text-sm font-bold text-brand-900 shadow">
                    ★ {ratingValue.toFixed(1)}
                    {ratingCount !== null && ` (${ratingCount} تقييم)`}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        <FeatureStrip branchCount={branches.length} />

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-12 sm:px-6 sm:pb-16">
          <div className="space-y-14">
            {hasMenu && (
              <section aria-labelledby="menu-heading" className="space-y-8">
                <h2 id="menu-heading" className="sr-only">
                  المنيو
                </h2>
                <MenuList categories={categories} items={items} phone={restaurant.phone_whatsapp} />
              </section>
            )}

            <div id="reviews-heading" className="space-y-6">
              <ReviewsSection
                googleReviews={google.reviews}
                googleAverage={google.averageRating}
                googleTotal={google.totalRatings}
                internalReviews={internalReviews}
              />
              {/* Google-linked restaurants collect reviews on Google itself,
                  so the in-site form is only shown for the internal system. */}
              {!restaurant.google_place_id && <ReviewForm restaurantId={restaurant.id} />}
            </div>

            <BranchesSection branches={branches} />
          </div>
        </main>
      </div>

      {restaurant.google_maps_embed_url && (
        <MapEmbed
          embedUrl={restaurant.google_maps_embed_url}
          restaurantName={restaurant.name}
          address={restaurant.address}
          phone={restaurant.phone_whatsapp}
        />
      )}

      <SiteFooter
        restaurantName={restaurant.name}
        address={restaurant.address}
        phone={restaurant.phone_whatsapp}
        hasMenu={hasMenu}
        hasMap={hasMap}
      />

      {/* Always-reachable contact bar on mobile, where scrolling the hero
          button out of view would otherwise cost a real order. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:hidden">
        <CallButton
          phone={restaurant.phone_whatsapp}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700"
        />
      </div>
    </>
  );
}
