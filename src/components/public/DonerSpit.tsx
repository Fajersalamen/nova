'use client';

import { useEffect, useRef } from 'react';

// One tile of the meat surface. The whole strip is repeated across the body
// and slid sideways on scroll; with the fixed cylindrical shading painted on
// top, the sliding reads as the spit turning.
const TILE = 40;
// Narrow, uneven bands rather than a few wide ones — closer to the way roast
// meat actually reads, and the irregular rhythm keeps the tiling from
// looking like wallpaper as it slides.
const STRIPES: { x: number; w: number; fill: string }[] = [
  { x: 0, w: 3.5, fill: '#5c2c0e' },
  { x: 3.5, w: 2.5, fill: '#7c3f16' },
  { x: 6, w: 4, fill: '#a2551f' },
  { x: 10, w: 3, fill: '#8d4819' },
  { x: 13, w: 5, fill: '#c07333' },
  { x: 18, w: 3.5, fill: '#d68b45' },
  { x: 21.5, w: 3, fill: '#b26529' },
  { x: 24.5, w: 4.5, fill: '#8a4718' },
  { x: 29, w: 3, fill: '#a85a22' },
  { x: 32, w: 4, fill: '#6b3411' },
  { x: 36, w: 4, fill: '#4d240b' },
];

// Wet-looking vertical streaks that catch the light as the spit turns.
const GLISTEN = [
  { x: 14.5, w: 2.2, o: 0.20 },
  { x: 19.5, w: 1.4, o: 0.28 },
  { x: 30.5, w: 1.6, o: 0.14 },
];

// Charred flecks, positioned within a tile so they travel with the surface.
const CHAR = [
  { cx: 5, cy: 90, rx: 3, ry: 6 },
  { cx: 17, cy: 210, rx: 4, ry: 7 },
  { cx: 30, cy: 150, rx: 3, ry: 5 },
  { cx: 9, cy: 320, rx: 4, ry: 8 },
  { cx: 26, cy: 390, rx: 3, ry: 6 },
  { cx: 36, cy: 260, rx: 2, ry: 5 },
];

const TILE_COUNT = 9;
const TILE_START = -3; // so tiles cover x from -120 through 240

// Horizontal seams between the stacked slices of meat. Static — only the
// surface turns, the layers themselves stay put.
const SEAMS = [58, 96, 134, 172, 210, 248, 286, 324, 362, 396];

/**
 * A vertical döner spit drawn entirely in SVG. Nothing here is a photograph:
 * the body is a tiled stripe pattern that slides sideways as the visitor
 * scrolls, under a fixed cylindrical light/shade overlay that keeps the edges
 * dark — which is what makes a flat shape read as a round one turning.
 */
export function DonerSpit({ className }: { className?: string }) {
  const surfaceRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGEllipseElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // A visitor who asked for less motion gets the spit, just not spinning.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;

    function update() {
      frame = 0;
      const el = hostRef.current;
      const surface = surfaceRef.current;
      if (!el || !surface) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 as the spit enters from the bottom, 1 once it has left the top.
      const span = rect.height + vh;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / span));

      // Six turns across the whole pass, wrapped into a single tile so the
      // seam never shows.
      const offset = -(((progress * TILE * 6) % TILE) + TILE) % TILE;
      surface.setAttribute('transform', `translate(${offset} 0)`);

      if (glowRef.current) {
        // Coals breathe a little as the spit turns.
        const pulse = 0.55 + 0.45 * Math.abs(Math.sin(progress * Math.PI * 3));
        glowRef.current.setAttribute('opacity', pulse.toFixed(3));
      }
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={hostRef} className={className}>
      <svg viewBox="0 0 200 520" className="h-full w-full" aria-hidden>
        <defs>
          {/* Body outline — narrow at the carved top, bellying out, then
              tapering to a rounded tip like a real spit part-way through
              service. */}
          <clipPath id="doner-body">
            <path d="M100 22c33 0 59 24 63 72 6 58 4 128-2 193-6 66-25 137-61 171-36-34-55-105-61-171-6-65-8-135-2-193 4-48 30-72 63-72Z" />
          </clipPath>

          {/* Fixed cylindrical shading: dark rims, hot highlight off-centre. */}
          <linearGradient id="doner-round" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000" stopOpacity="0.92" />
            <stop offset="12%" stopColor="#000" stopOpacity="0.55" />
            <stop offset="30%" stopColor="#000" stopOpacity="0.12" />
            <stop offset="44%" stopColor="#ffd9a0" stopOpacity="0.22" />
            <stop offset="54%" stopColor="#fff0d0" stopOpacity="0.10" />
            <stop offset="70%" stopColor="#000" stopOpacity="0.20" />
            <stop offset="88%" stopColor="#000" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.95" />
          </linearGradient>

          {/* The crisped, darker crust at the very top and tip. */}
          <linearGradient id="doner-ends" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a1c08" stopOpacity="0.85" />
            <stop offset="14%" stopColor="#3a1c08" stopOpacity="0" />
            <stop offset="80%" stopColor="#2e1506" stopOpacity="0" />
            <stop offset="100%" stopColor="#2e1506" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="doner-skewer" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4b4b4b" />
            <stop offset="35%" stopColor="#d6d6d6" />
            <stop offset="60%" stopColor="#8f8f8f" />
            <stop offset="100%" stopColor="#3a3a3a" />
          </linearGradient>

          <radialGradient id="doner-coals">
            <stop offset="0%" stopColor="#ffb03a" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#e8571a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#e8571a" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="doner-grill">
            <stop offset="55%" stopColor="#ff6a12" stopOpacity="0" />
            <stop offset="82%" stopColor="#ff7a1e" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ff4d05" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Heat haze rising off the coals, well clear of the body so it never
            reads as part of the meat. */}
        <ellipse cx="100" cy="300" rx="92" ry="215" fill="url(#doner-grill)" opacity="0.5" />

        {/* Skewer, above and below the meat. */}
        <rect x="95" y="6" width="10" height="70" rx="5" fill="url(#doner-skewer)" />
        <rect x="95" y="430" width="10" height="76" rx="5" fill="url(#doner-skewer)" />
        <ellipse cx="100" cy="506" rx="30" ry="7" fill="#1a1a1a" opacity="0.65" />

        <g clipPath="url(#doner-body)">
          {/* The turning surface. */}
          <g ref={surfaceRef}>
            {Array.from({ length: TILE_COUNT }).map((_, tile) => {
              const dx = (TILE_START + tile) * TILE;
              return (
                <g key={tile} transform={`translate(${dx} 0)`}>
                  {STRIPES.map((s) => (
                    <rect key={s.x} x={s.x} y={0} width={s.w} height={520} fill={s.fill} />
                  ))}
                  {GLISTEN.map((g) => (
                    <rect
                      key={`g-${g.x}`}
                      x={g.x}
                      y={0}
                      width={g.w}
                      height={520}
                      fill="#ffd9a0"
                      opacity={g.o}
                    />
                  ))}
                  {CHAR.map((c) => (
                    <ellipse
                      key={`${c.cx}-${c.cy}`}
                      cx={c.cx}
                      cy={c.cy}
                      rx={c.rx}
                      ry={c.ry}
                      fill="#37190a"
                      opacity="0.75"
                    />
                  ))}
                </g>
              );
            })}
          </g>

          {/* Stacked-slice seams stay put while the surface moves. */}
          {SEAMS.map((y) => (
            <path
              key={y}
              d={`M20 ${y} Q100 ${y + 9} 180 ${y}`}
              fill="none"
              stroke="#42200c"
              strokeOpacity="0.55"
              strokeWidth="2.5"
            />
          ))}

          <rect x="0" y="0" width="200" height="520" fill="url(#doner-round)" />
          <rect x="0" y="0" width="200" height="520" fill="url(#doner-ends)" />
        </g>

        {/* Coals at the base. */}
        <ellipse ref={glowRef} cx="100" cy="470" rx="66" ry="26" fill="url(#doner-coals)" opacity="0.7" />
      </svg>
    </div>
  );
}
