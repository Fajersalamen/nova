// Four block layouts so a row of branch cards doesn't repeat the same
// illustration — still purely decorative, not a real map of anywhere.
const LAYOUTS = [
  [
    [8, 6, 34, 22],
    [50, 6, 30, 16],
    [8, 34, 22, 20],
    [38, 30, 26, 14],
    [72, 10, 22, 26],
    [10, 62, 26, 18],
    [44, 52, 20, 16],
    [72, 46, 22, 20],
    [8, 86, 30, 14],
    [46, 76, 24, 18],
    [78, 76, 18, 20],
    [58, 90, 22, 12],
  ],
  [
    [6, 10, 24, 24],
    [36, 8, 34, 14],
    [78, 8, 18, 30],
    [6, 42, 20, 18],
    [32, 38, 22, 24],
    [60, 34, 30, 16],
    [60, 56, 18, 22],
    [10, 68, 34, 16],
    [50, 62, 22, 14],
    [80, 60, 16, 26],
    [26, 84, 28, 12],
  ],
  [
    [10, 8, 20, 16],
    [38, 6, 20, 30],
    [66, 10, 28, 18],
    [10, 32, 22, 22],
    [66, 36, 26, 20],
    [38, 44, 20, 14],
    [8, 62, 30, 16],
    [46, 64, 18, 24],
    [72, 64, 22, 16],
    [10, 84, 26, 12],
    [44, 86, 34, 10],
  ],
  [
    [8, 8, 28, 18],
    [44, 10, 18, 26],
    [70, 6, 24, 20],
    [10, 34, 26, 14],
    [44, 42, 30, 18],
    [78, 32, 18, 28],
    [8, 56, 22, 24],
    [38, 66, 22, 16],
    [66, 64, 28, 14],
    [10, 86, 30, 10],
    [50, 88, 22, 10],
  ],
];

const PIN_COLORS = ['fill-brand-600', 'fill-secondary-600', 'fill-ink', 'fill-brand-700'];

/**
 * Decorative stand-in for a live map embed — purely stylistic (a
 * schematic street-grid pattern), not a real map of anywhere. The
 * "Get directions" button next to it is what actually sends visitors to
 * the restaurant's real, verified location.
 */
export function MapIllustration({ variant = 0 }: { variant?: number }) {
  const blocks = LAYOUTS[variant % LAYOUTS.length] ?? LAYOUTS[0]!;
  const pinColor = PIN_COLORS[variant % PIN_COLORS.length] ?? PIN_COLORS[0]!;

  return (
    <div className="relative aspect-[4/3] w-full bg-cream-100">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {blocks.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="1.5" fill="#ede5d8" stroke="#d8c9b3" strokeWidth="0.5" />
        ))}
        {/* compass */}
        <g transform="translate(88, 90)" className="text-brand-600">
          <circle r="7" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <path d="M0 -5 L1.5 0 L0 5 L-1.5 0 Z" fill="currentColor" />
          <text x="0" y="-9" textAnchor="middle" fontSize="4" fill="currentColor">
            N
          </text>
        </g>
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[85%]">
        <svg width="40" height="52" viewBox="0 0 40 52" className="drop-shadow-lg">
          <path
            d="M20 0C9 0 0 9 0 20c0 14 20 32 20 32s20-18 20-32C40 9 31 0 20 0Z"
            className={pinColor}
          />
          <circle cx="20" cy="20" r="8" className="fill-white" />
        </svg>
      </div>
    </div>
  );
}
