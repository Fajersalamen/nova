/**
 * Decorative stand-in for a live map embed — purely stylistic (a
 * schematic street-grid pattern), not a real map of anywhere. The
 * "Get directions" button next to it is what actually sends visitors to
 * the restaurant's real, verified location.
 */
export function MapIllustration() {
  const blocks = [
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
  ];

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
            className="fill-brand-600"
          />
          <circle cx="20" cy="20" r="8" className="fill-white" />
        </svg>
      </div>
    </div>
  );
}
