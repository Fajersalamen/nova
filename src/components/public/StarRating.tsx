interface Props {
  rating: number;
  className?: string;
}

export function StarRating({ rating, className }: Props) {
  const rounded = Math.round(rating);
  return (
    <span className={className ?? 'inline-flex gap-0.5'} aria-label={`${rating} من 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-4 w-4 ${star <= rounded ? 'fill-amber-400' : 'fill-neutral-300'}`}
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}
