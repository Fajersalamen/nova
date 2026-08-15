interface Props {
  embedUrl: string;
  restaurantName: string;
  address: string | null;
  phone: string;
}

/**
 * Google Maps iframe embed rather than the Maps JavaScript SDK: the SDK
 * pulls ~300kb+ of JS and blocks rendering, while a lazy iframe costs
 * nothing until it scrolls into view.
 */
export function MapEmbed({ embedUrl, restaurantName, address, phone }: Props) {
  const directionsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  return (
    <section aria-labelledby="map-heading" className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <iframe
            src={embedUrl}
            title={`خريطة موقع ${restaurantName}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-[340px] w-full border-0"
          />
        </div>

        <div className="space-y-4 text-center lg:text-right">
          <span className="text-sm font-semibold text-accent-400">موقعنا</span>
          <h2 id="map-heading" className="text-3xl font-bold sm:text-4xl">
            {address ?? restaurantName}
          </h2>
          <p dir="ltr" className="text-white/80">
            {phone}
          </p>
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent-400 px-6 py-3 font-semibold text-brand-900 transition hover:bg-accent-500"
            >
              احصل على الاتجاهات
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
