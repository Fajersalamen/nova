import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { MapIllustration } from './MapIllustration';
import type { RestaurantBranch } from '@/types/database.types';

interface Location {
  key: string;
  name: string;
  address: string | null;
  phone: string;
}

interface Props {
  restaurantName: string;
  address: string | null;
  phone: string;
  hoursLabel: string | null;
  branches: RestaurantBranch[];
}

function directionsUrl(address: string | null): string | null {
  return address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;
}

/**
 * One location (just the main address) renders as a single text+illustration
 * spread. Once branches exist, the section becomes "فروعنا" and every
 * location — the main one plus each branch — gets an identical card, all
 * using the same decorative illustration instead of a real (and often
 * broken/unconfigured) map embed.
 */
export function LocationsSection({ restaurantName, address, phone, hoursLabel, branches }: Props) {
  const locations: Location[] = [
    ...(address ? [{ key: 'main', name: restaurantName, address, phone }] : []),
    ...branches.map((b) => ({ key: b.id, name: b.name, address: b.address, phone: b.phone_whatsapp })),
  ];

  if (locations.length === 0) return null;

  const heading = branches.length > 0 ? 'فروعنا' : 'موقعنا';

  if (locations.length === 1 && locations[0]) {
    const location = locations[0];
    const dirUrl = directionsUrl(location.address);
    return (
      <section aria-labelledby="locations-heading" className="bg-secondary-600 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-sm font-black text-accent-400">
              <MapPin className="h-4 w-4" aria-hidden />
              {heading}
            </p>
            <h2 id="locations-heading" className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              {location.name}
            </h2>
            <ul className="mt-8 space-y-4 text-base font-bold">
              {location.address && (
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-accent-400" aria-hidden />
                  {location.address}
                </li>
              )}
              {hoursLabel && (
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-accent-400" aria-hidden />
                  {hoursLabel}
                </li>
              )}
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-accent-400" aria-hidden />
                <a
                  href={`tel:${location.phone.replace(/[^\d+]/g, '')}`}
                  className="underline-offset-4 hover:underline"
                  dir="ltr"
                >
                  {location.phone}
                </a>
              </li>
            </ul>
            {dirUrl && (
              <a
                href={dirUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-400 px-8 py-3.5 text-base font-black text-accent-900 shadow-lg transition-transform hover:scale-105"
              >
                <Navigation className="h-5 w-5" aria-hidden />
                احصل على الاتجاهات
              </a>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border-4 border-accent-400 shadow-2xl">
            <MapIllustration />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="locations-heading" className="bg-secondary-600 text-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 id="locations-heading" className="text-center text-4xl font-black tracking-tight sm:text-5xl">
          {heading}
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location, i) => {
            const dirUrl = directionsUrl(location.address);
            return (
              <article
                key={location.key}
                className="overflow-hidden rounded-3xl border-4 border-accent-400 bg-white text-ink shadow-2xl"
              >
                <MapIllustration variant={i} />
                <div className="p-6">
                  <h3 className="text-xl font-black">{location.name}</h3>
                  {location.address && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-neutral-600">
                      <MapPin className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                      {location.address}
                    </p>
                  )}
                  <a
                    href={`tel:${location.phone.replace(/[^\d+]/g, '')}`}
                    className="mt-2 flex items-center gap-2 text-sm font-bold text-neutral-600"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                    <span dir="ltr">{location.phone}</span>
                  </a>
                  {dirUrl && (
                    <a
                      href={dirUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-400 px-5 py-2.5 text-sm font-black text-accent-900 transition-transform hover:scale-105"
                    >
                      <Navigation className="h-4 w-4" aria-hidden />
                      احصل على الاتجاهات
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
