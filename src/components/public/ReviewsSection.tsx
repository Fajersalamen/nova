import { StarRating } from './StarRating';
import type { GoogleReview } from '@/lib/google-places';
import type { Review } from '@/types/database.types';

interface Props {
  googleReviews: GoogleReview[];
  googleAverage: number | null;
  googleTotal: number | null;
  internalReviews: Review[];
}

export function ReviewsSection({
  googleReviews,
  googleAverage,
  googleTotal,
  internalReviews,
}: Props) {
  const usingGoogle = googleReviews.length > 0;
  const entries = usingGoogle
    ? googleReviews.map((r) => ({
        key: `${r.authorName}-${r.relativeTimeDescription}`,
        name: r.authorName,
        rating: r.rating,
        text: r.text,
        meta: r.relativeTimeDescription,
      }))
    : internalReviews.map((r) => ({
        key: r.id,
        name: r.customer_name,
        rating: r.rating,
        text: r.comment ?? '',
        meta: new Date(r.created_at).toLocaleDateString('ar'),
      }));

  if (entries.length === 0) return null;

  return (
    <section className="space-y-5" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-2">
        <h2 id="reviews-heading" className="text-2xl font-bold text-neutral-900">
          آراء الزبائن
        </h2>
        {usingGoogle && googleAverage !== null && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <StarRating rating={googleAverage} />
            <span>
              {googleAverage.toFixed(1)}
              {googleTotal !== null && ` (${googleTotal} تقييم على خرائط جوجل)`}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <figure
            key={entry.key}
            className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4"
          >
            <StarRating rating={entry.rating} />
            {entry.text && (
              <blockquote className="text-sm leading-relaxed text-neutral-700">
                {entry.text}
              </blockquote>
            )}
            <figcaption className="mt-auto pt-2 text-sm text-neutral-500">
              {entry.name} · {entry.meta}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
