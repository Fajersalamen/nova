import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Phone, Star } from 'lucide-react';
import { fetchGoogleReviews } from '@/lib/google-places';
import { computeRating, getRestaurantSiteData } from '@/lib/restaurant-site-data';
import { ServicesStrip } from '@/components/public/ServicesStrip';
import { MenuItemCard } from '@/components/public/MenuItemCard';
import { ReviewsMarquee, type MarqueeReview } from '@/components/public/ReviewsMarquee';
import { MapEmbed } from '@/components/public/MapEmbed';
import { CtaBand } from '@/components/public/CtaBand';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data || 'configError' in data) return {};

  const { restaurant } = data;
  return {
    title: restaurant.name,
    description: restaurant.hero_description ?? restaurant.address ?? `منيو وطلبات ${restaurant.name}`,
    openGraph: {
      title: restaurant.name,
      images: restaurant.logo_url ? [restaurant.logo_url] : undefined,
    },
  };
}

export default async function RestaurantHomePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data || 'configError' in data) notFound();

  const { restaurant, items, internalReviews } = data;

  const google = restaurant.google_place_id
    ? await fetchGoogleReviews(restaurant.google_place_id)
    : { reviews: [], averageRating: null, totalRatings: null };

  const rating = computeRating(google, internalReviews);

  const marqueeReviews: MarqueeReview[] =
    google.reviews.length > 0
      ? google.reviews.map((r) => ({ name: r.authorName, text: r.text, stars: r.rating }))
      : internalReviews.map((r) => ({ name: r.customer_name, text: r.comment ?? '', stars: r.rating }));

  const highlights = (
    items.some((i) => i.is_featured) ? items.filter((i) => i.is_featured) : items.filter((i) => i.image_url)
  ).slice(0, 3);

  const heroImage = items.find((item) => item.image_url)?.image_url ?? null;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-accent-400/50 blur-3xl"
          aria-hidden
        />
        <div
          className={`relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:py-24 ${heroImage ? 'lg:grid-cols-2' : ''}`}
        >
          <div className="text-center lg:order-2 lg:text-start">
            {restaurant.hours_label && (
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-black text-white shadow">
                <span className="h-2 w-2 animate-pulse rounded-full bg-open" aria-hidden />
                مفتوح الآن — {restaurant.hours_label}
              </span>
            )}
            <p className="mt-6 font-display text-sm tracking-[0.3em] text-secondary-600">
              {restaurant.name}
              {restaurant.address ? ` — ${restaurant.address}` : ''}
            </p>
            <h1 className="mt-3 text-5xl font-black leading-[1.15] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              {restaurant.tagline ?? restaurant.name}
            </h1>
            {restaurant.hero_description && (
              <p className="mx-auto mt-6 max-w-md text-lg font-semibold leading-relaxed text-neutral-600 lg:mx-0">
                {restaurant.hero_description}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href={`/${slug}/menu`}
                className="rounded-full bg-brand-600 px-8 py-3.5 text-base font-black text-white shadow-lg transition-transform hover:scale-105"
              >
                شاهد القائمة
              </Link>
              <a
                href={`tel:${restaurant.phone_whatsapp.replace(/[^\d+]/g, '')}`}
                className="flex items-center gap-2 rounded-full border-2 border-ink px-8 py-3.5 text-base font-black text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                <Phone className="h-5 w-5" aria-hidden />
                <span dir="ltr">{restaurant.phone_whatsapp}</span>
              </a>
            </div>
          </div>

          {heroImage && (
            <div className="relative mx-auto w-full max-w-lg lg:order-1">
              <Image
                src={heroImage}
                alt={restaurant.name}
                width={1200}
                height={900}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full rotate-2 rounded-3xl border-4 border-ink object-cover shadow-2xl"
              />
              {restaurant.logo_url && (
                <div className="absolute -top-10 right-4 h-28 w-28 -rotate-6 overflow-hidden rounded-full bg-white p-1.5 shadow-xl ring-4 ring-accent-400 sm:-right-8">
                  <Image
                    src={restaurant.logo_url}
                    alt={restaurant.name}
                    width={112}
                    height={112}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {rating.value !== null && (
                <div className="absolute -bottom-6 left-4 flex items-center gap-2 rounded-2xl bg-accent-400 px-4 py-2.5 font-black text-accent-900 shadow-lg sm:left-8">
                  <Star className="h-5 w-5 fill-accent-900" aria-hidden />
                  {rating.value.toFixed(1)}
                  {rating.count !== null && ` (${rating.count} تقييم)`}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <ServicesStrip
        hasDineIn={restaurant.has_dine_in}
        hasDelivery={restaurant.has_delivery}
        hasDriveThru={restaurant.has_drive_thru}
        hoursLabel={restaurant.hours_label}
      />

      {highlights.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">الأكثر طلبًا</h2>
            <Link
              href={`/${slug}/menu`}
              className="rounded-full border-2 border-ink px-6 py-2.5 text-sm font-black text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              القائمة الكاملة
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <ReviewsMarquee
        reviews={marqueeReviews}
        ratingValue={rating.value}
        ratingCount={rating.count}
        sourceLabel={google.reviews.length > 0 ? 'على Google' : 'من زبائننا'}
      />

      {restaurant.google_maps_embed_url && (
        <MapEmbed
          embedUrl={restaurant.google_maps_embed_url}
          restaurantName={restaurant.name}
          address={restaurant.address}
          phone={restaurant.phone_whatsapp}
          hoursLabel={restaurant.hours_label}
        />
      )}

      <CtaBand phone={restaurant.phone_whatsapp} heading="جعان؟ اتصل فينا." showFlame />
    </main>
  );
}
