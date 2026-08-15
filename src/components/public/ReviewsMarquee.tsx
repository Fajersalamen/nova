import { Star } from 'lucide-react';

export interface MarqueeReview {
  name: string;
  text: string;
  stars: number;
}

interface Props {
  reviews: MarqueeReview[];
  ratingValue: number | null;
  ratingCount: number | null;
  isGoogleSourced: boolean;
}

/** Only real reviews already collected (Google or the site's own approved
 * ones) — the section is omitted entirely rather than showing placeholder
 * testimonials when none exist yet. */
export function ReviewsMarquee({ reviews, ratingValue, ratingCount, isGoogleSourced }: Props) {
  if (reviews.length === 0) return null;

  const looped = reviews.length < 4 ? [...reviews, ...reviews, ...reviews] : [...reviews, ...reviews];

  return (
    <section className="overflow-hidden border-y-4 border-ink bg-accent-400 py-14">
      <div className="mx-auto mb-8 max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-black tracking-tight text-accent-900 sm:text-4xl">
          شو بقولوا عنا؟
        </h2>
        {ratingValue !== null && (
          <p className="mt-2 flex items-center justify-center gap-2 text-sm font-black text-accent-900/80">
            <Star className="h-4 w-4 fill-accent-900" aria-hidden />
            {ratingValue.toFixed(1)}
            {ratingCount !== null && ` (${ratingCount})`}{' '}
            {isGoogleSourced ? 'على Google' : 'من زبائننا'}
          </p>
        )}
      </div>
      <div dir="ltr" className="relative">
        <div className="flex w-max animate-marquee gap-6 px-3">
          {looped.map((review, i) => (
            <figure key={`${review.name}-${i}`} className="w-72 shrink-0 rounded-2xl bg-white p-5 shadow-md">
              <div className="flex gap-0.5" aria-label={`${review.stars} من 5 نجوم`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s < review.stars ? 'fill-brand-600 text-brand-600' : 'text-border'}`}
                    aria-hidden
                  />
                ))}
              </div>
              <blockquote dir="rtl" className="mt-3 text-sm font-bold leading-relaxed text-ink">
                “{review.text}”
              </blockquote>
              <figcaption dir="rtl" className="mt-3 text-xs font-black text-neutral-600">
                — {review.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
