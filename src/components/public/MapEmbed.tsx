interface Props {
  embedUrl: string;
  restaurantName: string;
}

/**
 * Google Maps iframe embed rather than the Maps JavaScript SDK: the SDK
 * pulls ~300kb+ of JS and blocks rendering, while a lazy iframe costs
 * nothing until it scrolls into view.
 */
export function MapEmbed({ embedUrl, restaurantName }: Props) {
  return (
    <section className="space-y-3" aria-labelledby="map-heading">
      <h2 id="map-heading" className="text-2xl font-bold text-neutral-900">
        موقعنا
      </h2>
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <iframe
          src={embedUrl}
          title={`خريطة موقع ${restaurantName}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="h-[340px] w-full border-0"
        />
      </div>
    </section>
  );
}
