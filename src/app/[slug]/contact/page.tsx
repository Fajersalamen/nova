import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Clock, MapPin, Navigation, Phone, UtensilsCrossed } from 'lucide-react';
import { getRestaurantSiteData } from '@/lib/restaurant-site-data';
import { ReviewForm } from '@/components/public/ReviewForm';
import { CtaBand } from '@/components/public/CtaBand';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data || 'configError' in data) return {};
  return { title: `اتصل بنا | ${data.restaurant.name}` };
}

export default async function ContactPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getRestaurantSiteData(slug);
  if (!data || 'configError' in data) notFound();

  const { restaurant } = data;

  const directionsUrl = restaurant.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`
    : null;

  const services = [
    restaurant.has_dine_in && 'تناول في المطعم',
    restaurant.has_drive_thru && 'درايف ثرو',
    restaurant.has_delivery && 'توصيل بدون تلامس',
  ].filter((s): s is string => Boolean(s));

  return (
    <main>
      <section className="bg-brand-600 py-16 text-center text-white">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">اتصل بنا</h1>
        {restaurant.hours_label && <p className="mt-4 text-sm font-bold opacity-90">{restaurant.hours_label}</p>}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-8 md:grid-cols-2">
          <a
            href={`tel:${restaurant.phone_whatsapp.replace(/[^\d+]/g, '')}`}
            className="group rounded-3xl border border-border bg-white p-8 shadow-sm transition-shadow hover:shadow-xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white transition-transform group-hover:scale-110">
              <Phone className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="mt-5 text-2xl font-black text-ink">اطلب على الهاتف</h2>
            <p className="mt-2 text-sm font-semibold text-neutral-600">للطلبات والاستفسارات.</p>
            <p className="mt-4 text-2xl font-black text-brand-600" dir="ltr">
              {restaurant.phone_whatsapp}
            </p>
          </a>

          {restaurant.address && (
            <a
              href={directionsUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-3xl border border-border bg-white p-8 shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-600 text-white transition-transform group-hover:scale-110">
                <MapPin className="h-7 w-7" aria-hidden />
              </div>
              <h2 className="mt-5 text-2xl font-black text-ink">تفضل بزيارتنا</h2>
              <p className="mt-2 text-sm font-semibold text-neutral-600">{restaurant.address}</p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-400 px-5 py-2.5 text-sm font-black text-accent-900">
                <Navigation className="h-4 w-4" aria-hidden />
                احصل على الاتجاهات
              </p>
            </a>
          )}

          {restaurant.hours_label && (
            <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-400 text-accent-900">
                <Clock className="h-7 w-7" aria-hidden />
              </div>
              <h2 className="mt-5 text-2xl font-black text-ink">ساعات العمل</h2>
              <p className="mt-4 flex items-center gap-2 text-xl font-black text-ink">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-open" aria-hidden />
                {restaurant.hours_label}
              </p>
            </div>
          )}

          {services.length > 0 && (
            <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream">
                <UtensilsCrossed className="h-7 w-7" aria-hidden />
              </div>
              <h2 className="mt-5 text-2xl font-black text-ink">خدماتنا</h2>
              <ul className="mt-4 space-y-2.5 text-sm font-black text-ink">
                {services.map((s) => (
                  <li key={s} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Google-linked restaurants collect reviews on Google itself, so
            the in-site form is only shown for the internal system. */}
        {!restaurant.google_place_id && (
          <div className="mt-8">
            <ReviewForm restaurantId={restaurant.id} />
          </div>
        )}
      </section>

      <CtaBand
        phone={restaurant.phone_whatsapp}
        heading={restaurant.contact_cta_heading ?? 'جعان هلأ؟ خذ خطك واتصل.'}
      />
    </main>
  );
}
