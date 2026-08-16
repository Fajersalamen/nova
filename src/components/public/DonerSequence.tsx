'use client';

import { useEffect, useRef } from 'react';

const FRAME_COUNT = 32;
const FRAME_W = 420;
const FRAME_H = 736;

const frameSrc = (i: number) => `/doner/f${String(i).padStart(2, '0')}.webp`;

/**
 * A rotating döner spit scrubbed by scroll position — the frames of a real
 * rotation are drawn to a canvas, one per scroll step, so the spit turns
 * under the visitor's thumb instead of playing on its own.
 *
 * Frames load progressively: the first one paints immediately and the rest
 * stream in behind it, with `nearestLoaded` falling back to whatever is
 * already decoded. That keeps the hero usable on a slow connection instead
 * of blocking on ~1MB of imagery.
 */
export function DonerSequence({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frames: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    let disposed = false;
    let raf = 0;
    let drawn = -1;

    function nearestLoaded(i: number): HTMLImageElement | null {
      if (frames[i]) return frames[i];
      for (let d = 1; d <= FRAME_COUNT; d++) {
        const before = frames[(i - d + FRAME_COUNT) % FRAME_COUNT];
        if (before) return before;
        const after = frames[(i + d) % FRAME_COUNT];
        if (after) return after;
      }
      return null;
    }

    function paint(index: number) {
      const img = nearestLoaded(index);
      if (!img || !ctx || !canvas) return;
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      // Contain, so the spit is never cropped or stretched.
      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    function sizeCanvas() {
      if (!canvas || !host) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      paint(drawn < 0 ? 0 : drawn);
    }

    function frameForScroll(): number {
      if (!host) return 0;
      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const span = rect.height + vh;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / span));
      return Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
    }

    function update() {
      raf = 0;
      const index = frameForScroll();
      if (index === drawn) return;
      drawn = index;
      paint(index);
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }

    function load(i: number): Promise<void> {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (disposed) return resolve();
          frames[i] = img;
          // Repaint if this frame is the one currently wanted, or if nothing
          // has been painted yet.
          if (drawn < 0 || i === drawn) paint(drawn < 0 ? 0 : drawn);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameSrc(i);
      });
    }

    sizeCanvas();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // First frame up front so the hero is never empty, then the rest in the
    // background — two at a time to stay off the critical path.
    void (async () => {
      await load(0);
      if (disposed || reduced) return;
      for (let i = 1; i < FRAME_COUNT && !disposed; i += 2) {
        await Promise.all([load(i), i + 1 < FRAME_COUNT ? load(i + 1) : Promise.resolve()]);
      }
    })();

    const observer = new ResizeObserver(sizeCanvas);
    observer.observe(host);

    if (!reduced) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
