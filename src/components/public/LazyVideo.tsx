'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  poster: string | null;
  label: string;
}

/**
 * Only attaches the video source once the element enters the viewport, so
 * a menu with 40 dish videos doesn't start 40 downloads on page load.
 */
export function LazyVideo({ src, poster, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {isVisible ? (
        <video
          src={src}
          poster={poster ?? undefined}
          aria-label={label}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
