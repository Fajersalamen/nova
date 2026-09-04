type IconProps = { className?: string };

/** Hand-simplified line-art ingredient marks — deliberately restrained, not clip-art. */

export function StrawberryMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M24 14c-6 0-11.5 6.4-11.5 14.2C12.5 34.9 17.6 40 24 40s11.5-5.1 11.5-11.8C35.5 20.4 30 14 24 14Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M24 14c-2.4-3.4-5-5-8.4-5.6M24 14c2.4-3.4 5-5 8.4-5.6M24 14V9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M18 22.5l.9 2M24 21v2.4M30 22.5l-.9 2M20.5 29l.7 1.8M27.5 29l-.7 1.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function ChocolateChunkMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <rect x="11" y="15" width="26" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M11 22h26M20 15v20M28 15v20" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function PistachioMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M16 30c-3-3-3.6-9.4 1.6-13.6C21 13.8 24 14 24 14s3-.2 6.4 2.4C35.6 20.6 35 27 32 30c-2.6 2.6-5.4 3.4-8 3.4s-5.4-.8-8-3.4Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M24 14v19.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function FlowerMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="3.2" stroke="currentColor" strokeWidth="1.1" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="24"
          cy="14.5"
          rx="3.2"
          ry="6.4"
          stroke="currentColor"
          strokeWidth="1"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
    </svg>
  );
}
