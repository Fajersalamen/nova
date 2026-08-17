'use client';

import { useEffect, useRef } from 'react';

/**
 * Each layer's resting position (percent of the layer's own height, so the
 * stack keeps its proportions at any size), how big it sits relative to the
 * others, and where in the scroll it starts dropping in.
 */
const LAYERS = [
  { key: 'box', label: null, y: 15, scale: 1.16, start: 0.0 },
  { key: 'bun', label: 'خبز طازج', y: 10.5, scale: 0.98, start: 0.07 },
  { key: 'sauce', label: 'صوصنا الخاص', y: 7, scale: 0.72, start: 0.17 },
  { key: 'lettuce', label: 'خس', y: 3.5, scale: 0.9, start: 0.27 },
  { key: 'tomato', label: 'بندورة', y: 0.5, scale: 0.84, start: 0.37 },
  { key: 'onion', label: 'بصل', y: -2.5, scale: 0.8, start: 0.47 },
  { key: 'patty', label: 'لحمة على الفحم', y: -7, scale: 0.9, start: 0.57 },
  { key: 'cheese', label: 'جبنة ذايبة', y: -11, scale: 0.94, start: 0.67 },
] as const;

const WINDOW = 0.26; // how much scroll each layer takes to land
const DROP_FROM = -60; // percent above its resting spot

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * The burger builds itself as the visitor scrolls: every ingredient drops
 * into the box in turn, each on its own slice of the scroll range.
 *
 * Positions are written straight to the elements inside a rAF callback
 * rather than through state, so a scroll never triggers a React render.
 */
export function BurgerStack() {
  const hostRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    function apply(progress: number) {
      let topLabel: string | null = null;

      LAYERS.forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (!el) return;

        const raw = (progress - layer.start) / WINDOW;
        const t = easeOut(Math.min(1, Math.max(0, raw)));
        const y = layer.y + DROP_FROM * (1 - t);

        el.style.opacity = String(t);
        el.style.transform = `translate3d(0, ${y}%, 0) scale(${layer.scale})`;

        if (t > 0.55 && layer.label) topLabel = layer.label;
      });

      if (labelRef.current) {
        labelRef.current.textContent = topLabel ?? '';
        labelRef.current.style.opacity = topLabel ? '1' : '0';
      }
    }

    function update() {
      raf = 0;
      const el = hostRef.current;
      const pin = pinRef.current;
      if (!el || !pin) return;
      const rect = el.getBoundingClientRect();
      // The stack is pinned from the moment the section's top meets the
      // header until its bottom clears the pinned frame, so measure against
      // those two, not the viewport — otherwise the last ingredient lands
      // early by exactly the header's height.
      const headerH =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header')) || 0;
      const span = Math.max(1, rect.height - pin.offsetHeight);
      apply(Math.min(1, Math.max(0, (headerH - rect.top) / span)));
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }

    if (reduced) {
      apply(1); // show the finished burger, no animation
      return;
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={hostRef} className="relative h-[300vh] bg-black">
      <div
        ref={pinRef}
        className="sticky top-[var(--site-header)] flex h-[calc(100vh-var(--site-header))] flex-col items-center justify-center overflow-hidden"
      >
        {/* Warm pool of light behind the stack. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[75vmin] w-[75vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,140,40,0.22),transparent_65%)]"
          aria-hidden
        />

        <h2 className="relative z-10 shrink-0 px-4 pt-6 text-center text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-5xl">
          مصنوع طبقة طبقة
        </h2>

        <div className="relative mx-auto aspect-square w-full max-w-[520px] flex-1">
          {LAYERS.map((layer, i) => (
            <div
              key={layer.key}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              className="absolute inset-0 flex items-center justify-center opacity-0 will-change-transform"
            >
              {/* Plain img: these are pre-sized transparent cut-outs, and
                  next/image's loader is a passthrough here anyway. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/burger/${layer.key}.webp`}
                alt=""
                className="h-auto w-full select-none object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>

        <span
          ref={labelRef}
          className="z-10 mb-6 h-7 shrink-0 text-lg font-black text-accent-400 opacity-0 transition-opacity duration-300"
        />
      </div>
    </section>
  );
}
