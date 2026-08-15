import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchGoogleReviews } from '@/lib/google-places';
import { computeRating, getRestaurantSiteData } from '@/lib/restaurant-site-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data || 'configError' in data) return {};
  return { title: `من نحن | ${data.restaurant.name}` };
}

export default async function AboutPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data || 'configError' in data) notFound();

  const { restaurant, internalReviews, branches } = data;

  const google = restaurant.google_place_id
    ? await fetchGoogleReviews(restaurant.google_place_id)
    : { reviews: [], averageRating: null, totalRatings: null };
  const rating = computeRating(google, internalReviews);

  const stats = [
    rating.value !== null && { value: rating.value.toFixed(1), label: 'تقييم' },
    rating.count !== null && { value: String(rating.count), label: 'تقييم من زبائننا' },
    branches.length > 0 && { value: String(branches.length + 1), label: 'فروع' },
  ].filter((s): s is { value: string; label: string } => Boolean(s));

  const hasStory = Boolean(restaurant.about_title || restaurant.about_body);

  return (
    <main>
      <section className="bg-brand-600 py-16 text-center text-white">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">قصتنا</h1>
        <p className="mt-4 text-sm font-bold opacity-90">{restaurant.name}</p>
      </section>

      {hasStory ? (
        <section
          className={`mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 ${restaurant.about_image_url ? 'lg:grid-cols-2' : ''}`}
        >
          {restaurant.about_image_url && (
            <div className="relative">
              <Image
                src={restaurant.about_image_url}
                alt={restaurant.name}
                width={1200}
                height={900}
                className="w-full rotate-1 rounded-3xl border-4 border-ink object-cover shadow-2xl"
              />
            </div>
          )}
          <div>
            {restaurant.about_title && (
              <h2 className="text-4xl font-black leading-snug tracking-tight text-ink sm:text-5xl">
                {restaurant.about_title}
              </h2>
            )}
            {restaurant.about_body && (
              <div className="mt-6 space-y-4 text-base font-semibold leading-relaxed text-neutral-600">
                {restaurant.about_body.split('\n').filter(Boolean).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-2xl px-4 py-20 text-center">
          <p className="text-lg font-semibold leading-relaxed text-neutral-600">
            {restaurant.name}
            {restaurant.address ? ` — ${restaurant.address}` : ''}
          </p>
        </section>
      )}

      {stats.length > 0 && (
        <section className="bg-secondary-600 py-14 text-white">
          <div
            className={`mx-auto grid max-w-6xl gap-8 px-4 text-center ${
              stats.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-black text-accent-400 sm:text-5xl">{s.value}</p>
                <p className="mt-2 text-sm font-bold opacity-90">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
