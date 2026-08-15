interface Props {
  phone: string;
  className?: string;
}

/**
 * A tel: link works for any phone, landline or mobile — the only
 * contact channel the site uses.
 */
export function CallButton({ phone, className }: Props) {
  return (
    <a
      href={`tel:${phone.replace(/[^\d+]/g, '')}`}
      className={
        className ??
        'inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 font-semibold text-neutral-800 transition hover:bg-neutral-100'
      }
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01z" />
      </svg>
      اتصل الآن
    </a>
  );
}
