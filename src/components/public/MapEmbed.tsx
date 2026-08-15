'use client';

import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { MapIllustration } from './MapIllustration';
import { useT } from './LocaleProvider';

interface Props {
  restaurantName: string;
  address: string | null;
  phone: string;
  hoursLabel: string | null;
}

export function MapEmbed({ restaurantName, address, phone, hoursLabel }: Props) {
  const t = useT();
  const directionsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  return (
    <section aria-labelledby="map-heading" className="bg-secondary-600 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-accent-400">
            <MapPin className="h-4 w-4" aria-hidden />
            {t('ourLocation')}
          </p>
          <h2 id="map-heading" className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            {restaurantName}
          </h2>
          <ul className="mt-8 space-y-4 text-base font-bold">
            {address && (
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-accent-400" aria-hidden />
                {address}
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
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                className="underline-offset-4 hover:underline"
                dir="ltr"
              >
                {phone}
              </a>
            </li>
          </ul>
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-400 px-8 py-3.5 text-base font-black text-accent-900 shadow-lg transition-transform hover:scale-105"
            >
              <Navigation className="h-5 w-5" aria-hidden />
              {t('getDirections')}
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
