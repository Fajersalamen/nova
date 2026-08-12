import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import { fetchGoogleReviews } from '@/lib/google-places';
import { MenuList } from '@/components/public/MenuList';
import { MapEmbed } from '@/components/public/MapEmbed';
import { WhatsAppButton } from '@/components/public/WhatsAppButton';
import { ReviewsSection } from '@/components/public/ReviewsSection';
import { ReviewForm } from '@/components/public/ReviewForm';
import type { MenuCategory, MenuItem, Restaurant, Review } from '@/types/database.types';

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
export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('restaurants')
    .select('slug')
    .neq('subscription_status', 'canceled');

  // A build should never fail because the database was briefly
  // unreachable — fall back to rendering every page on demand.
  if (error || !data) return [];

  return data.map(({ slug }) => ({ slug }));
}

async function getRestaurantData(slug: string) {
  const supabase = createPublicClient();

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!restaurant || restaurant.subscription_status === 'canceled') return null;

  const [categoriesResult, itemsResult, reviewsResult] = await Promise.all([
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
  ]);

  return {
    restaurant: restaurant as Restaurant,
    categories: (categoriesResult.data ?? []) as MenuCategory[],
    items: (itemsResult.data ?? []) as MenuItem[],
    internalReviews: (reviewsResult.data ?? []) as Review[],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRestaurantData(slug);
  if (!data) return { title: 'المطعم غير موجود' };

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

  const { restaurant, categories, items, internalReviews } = data;

  // Google reviews take precedence when the restaurant has linked a Place
  // ID; otherwise the internal moderated reviews are shown.
  const google = restaurant.google_place_id
    ? await fetchGoogleReviews(restaurant.google_place_id)
    : { reviews: [], averageRating: null, totalRatings: null };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-col items-center gap-4 text-center">
        {restaurant.logo_url && (
          <Image
            src={restaurant.logo_url}
            alt={restaurant.name}
            width={112}
            height={112}
            priority
            className="h-28 w-28 rounded-full border border-neutral-200 object-cover"
          />
        )}
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">{restaurant.name}</h1>
        {restaurant.address && <p className="text-neutral-600">{restaurant.address}</p>}
        <WhatsAppButton
          phoneWhatsapp={restaurant.phone_whatsapp}
          restaurantName={restaurant.name}
        />
      </header>

      <div className="mt-14 space-y-14">
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
          <MapEmbed embedUrl={restaurant.google_maps_embed_url} restaurantName={restaurant.name} />
        )}
      </div>

      <footer className="mt-16 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} {restaurant.name}
      </footer>
    </main>
  );
}
