'use client';

import { useEffect, useRef } from 'react';

/**
 * Top of the burger down to the plate. `stacked` is where each layer sits
 * when the burger is whole, `apart` where it drifts once the visitor has
 * scrolled through. Both are percentages of a layer's own box, which is
 * uniform across layers, so the spacing holds at any screen size.
 */
const LAYERS = [
  { key: 'buntop', label: 'خبز بريوش', stacked: -13, apart: -96, scale: 0.9 },
  { key: 'patty', label: 'لحمة فحم', stacked: -7.5, apart: -67, scale: 0.84 },
  { key: 'cheese', label: 'جبنة شيدر', stacked: -4.5, apart: -44, scale: 0.88 },
  { key: 'lettuce', label: 'خس طازج', stacked: -1, apart: -17, scale: 0.86 },
  { key: 'tomato', label: 'بندورة', stacked: 2, apart: 9, scale: 0.8 },
  { key: 'onion', label: 'بصل أحمر', stacked: 5, apart: 35, scale: 0.76 },
  { key: 'sauce', label: 'صوص خاص', stacked: 7.5, apart: 60, scale: 0.7 },
  { key: 'bun', label: 'قاعدة الخبز', stacked: 11, apart: 90, scale: 0.9 },
] as const;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The hero burger arrives whole and pulls itself apart as the visitor
 * scrolls, naming each layer as it separates.
 *
 * Transforms are written straight to the nodes in a rAF callback, so
 * scrolling never costs a React render. Each layer's fixed scale lives on
 * the image itself rather than the wrapper, so the labels stay one size.
 */
export function BurgerHero() {
  const hostRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const promptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    function apply(progress: number) {
      LAYERS.forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (!el) return;

        // Each layer opens on its own slightly staggered beat, so the
        // burger peels apart from the top rather than all at once.
        const start = i * 0.045;
        const t = easeOut(Math.min(1, Math.max(0, (progress - start) / (1 - start))));
        const y = lerp(layer.stacked, layer.apart, t);
        // The -50% centres the layer on the stage; it has to ride in the
        // same transform, because an inline one replaces Tailwind's.
        el.style.transform = `translate3d(0, ${y - 50}%, 0)`;

        const label = labelRefs.current[i];
        if (label) {
          label.style.opacity = String(Math.min(1, Math.max(0, (t - 0.4) / 0.3)));
          label.style.transform = `translate3d(${lerp(-12, 0, t)}px, -50%, 0)`;
        }
      });

      if (promptRef.current) {
        promptRef.current.style.opacity = String(Math.max(0, 1 - progress * 4));
      }
    }

    function update() {
      raf = 0;
      const el = hostRef.current;
      const pin = pinRef.current;
      if (!el || !pin) return;
      const rect = el.getBoundingClientRect();
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
      apply(1); // show it already open, no scroll choreography
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
    <div ref={hostRef} className="relative h-[260vh] bg-[#140d08]">
      <div
        ref={pinRef}
        className="sticky top-[var(--site-header)] h-[calc(100vh-var(--site-header))] overflow-hidden"
      >
        {/* Warm pool of light, brightest behind the burger. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[110vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,104,32,0.30),rgba(20,13,8,0)_62%)]"
          aria-hidden
        />

        <div className="relative mx-auto h-full w-full max-w-[520px] px-3">
          {LAYERS.map((layer, i) => (
            <div
              key={layer.key}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              className="absolute inset-x-0 top-1/2 will-change-transform"
              style={{ zIndex: LAYERS.length - i }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/burger/${layer.key}.webp`}
                alt=""
                className="mx-auto w-[58%] select-none object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
                style={{ transform: `scale(${layer.scale})` }}
                draggable={false}
              />
              <div
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="pointer-events-none absolute end-2 top-1/2 flex items-center whitespace-nowrap text-[11px] font-black tracking-wide text-accent-400 opacity-0 sm:text-xs"
              >
                <span className="me-2 inline-block h-px w-4 bg-accent-400/50 sm:w-6" />
                {layer.label}
              </div>
            </div>
          ))}
        </div>

        <div ref={promptRef} className="pointer-events-none absolute inset-x-0 bottom-8 text-center">
          <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">برجر البيت</p>
          <p className="mt-2 text-[11px] font-black tracking-[0.35em] text-accent-400">
            مرّر لتشوف المكوّنات
          </p>
        </div>
      </div>
    </div>
  );
}
