import type { Transition, Variants } from 'framer-motion';

/** A soft, editorial easing curve used across the site instead of default linear/ease. */
export const easeLuxe: Transition['ease'] = [0.22, 1, 0.36, 1];

export const springSnap: Transition = { type: 'spring', stiffness: 340, damping: 32, mass: 0.9 };
export const springSoft: Transition = { type: 'spring', stiffness: 120, damping: 20, mass: 1 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeLuxe, delay },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: (delay = 0) => ({ opacity: 1, transition: { duration: 0.9, ease: easeLuxe, delay } }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: easeLuxe, delay },
  }),
};

export const staggerChildren = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Split text into words for a staggered headline reveal. */
export function splitWords(text: string): string[] {
  return text.split(' ');
}

export const wordReveal: Variants = {
  hidden: { opacity: 0, y: '110%' },
  show: {
    opacity: 1,
    y: '0%',
    transition: { duration: 0.9, ease: easeLuxe },
  },
};

export const viewportOnce = { once: true, margin: '-80px 0px -80px 0px' } as const;
