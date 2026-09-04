'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Global framer-motion config. reducedMotion="user" makes every animation in
 * the site collapse to instant opacity swaps when the OS-level
 * prefers-reduced-motion is set, without each component checking manually.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
