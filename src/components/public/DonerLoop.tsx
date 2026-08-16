'use client';

import { useEffect, useRef } from 'react';

/**
 * The döner spit turning on its own loop. Plain autoplaying video — the
 * browser decodes it on the GPU, which is easier on the battery than
 * repainting frames ourselves, and `poster` keeps the frame filled until
 * the first video frame is ready.
 *
 * The only thing needing JS: a visitor who asked for reduced motion gets
 * the poster instead of a spinning spit.
 */
export function DonerLoop({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.removeAttribute('autoplay');
      video.pause();
    }
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster="/media/doner-poster.webp"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    >
      {/* H.264 first: every phone and mainstream browser plays it, and it
          encodes this footage roughly half the size of the VP9 build. The
          WebM is only reached by builds shipped without proprietary codecs,
          which would otherwise fall back to the still poster. */}
      <source src="/media/doner-spin.mp4" type="video/mp4" />
      <source src="/media/doner-spin.webm" type="video/webm" />
    </video>
  );
}
