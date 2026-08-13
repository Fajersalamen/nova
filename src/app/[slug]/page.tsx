import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createPublicClientOrNull } from '@/lib/supabase/public';
import { configErrorMessage, missingSupabaseEnv } from '@/lib/env';
import { fetchGoogleReviews } from '@/lib/google-places';
import { MenuList } from '@/components/public/MenuList';
import { MapEmbed } from '@/components/public/MapEmbed';
import { WhatsAppButton } from '@/components/public/WhatsAppButton';
import { CallButton } from '@/components/public/CallButton';
import { ReviewsSection } from '@/components/public/ReviewsSection';
import { ReviewForm } from '@/components/public/ReviewForm';
import { BranchesSection } from '@/components/public/BranchesSection';
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

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-b from-brand-600 via-brand-500 to-brand-600 pb-14 pt-12 text-white sm:pb-20 sm:pt-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          {restaurant.logo_url ? (
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              width={112}
              height={112}
              priority
              className="h-28 w-28 rounded-full border-4 border-white/80 object-cover shadow-lg"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/80 bg-white/10 text-4xl font-bold shadow-lg"
            >
              {restaurant.name.charAt(0)}
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{restaurant.name}</h1>
          {restaurant.address && <p className="text-white/90">{restaurant.address}</p>}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <WhatsAppButton
              phoneWhatsapp={restaurant.phone_whatsapp}
              restaurantName={restaurant.name}
            />
            <CallButton
              phone={restaurant.phone_whatsapp}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            />
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <nav
          aria-label="فئات المنيو"
          className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur"
        >
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#category-${category.id}`}
                className="shrink-0 rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-brand-400 hover:text-brand-700"
              >
                {category.name}
              </a>
            ))}
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 sm:pb-10">
        <div className="space-y-14">
          <section aria-labelledby="menu-heading" className="space-y-8">
            <h2 id="menu-heading" className="sr-only">
              المنيو
            </h2>
            <MenuList
              categories={categories}
              items={items}
              restaurantName={restaurant.name}
              phoneWhatsapp={restaurant.phone_whatsapp}
            />
          </section>

          <div className="space-y-6">
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

          {restaurant.google_maps_embed_url && (
            <MapEmbed
              embedUrl={restaurant.google_maps_embed_url}
              restaurantName={restaurant.name}
            />
          )}

          <BranchesSection branches={branches} restaurantName={restaurant.name} />
        </div>

        <footer className="mt-16 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} {restaurant.name}
        </footer>
      </main>

      {/* Always-reachable contact bar on mobile, where scrolling the hero
          buttons out of view would otherwise cost a real order. */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-neutral-200 bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:hidden">
        <WhatsAppButton
          phoneWhatsapp={restaurant.phone_whatsapp}
          restaurantName={restaurant.name}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white transition hover:bg-[#1da851]"
        />
        <CallButton
          phone={restaurant.phone_whatsapp}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-3 font-semibold text-neutral-800 transition hover:bg-neutral-100"
        />
      </div>
    </>
  );
}
