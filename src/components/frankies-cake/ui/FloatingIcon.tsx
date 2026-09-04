'use client';

import { motion } from 'framer-motion';

type FloatingIconProps = {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  distance?: number;
};

/** A single slow-drifting decorative mark. Purely ambient — never interactive. */
export function FloatingIcon({
  children,
  className = '',
  duration = 8,
  delay = 0,
  distance = 12,
}: FloatingIconProps) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute select-none ${className}`}
      animate={{ y: [0, -distance, 0], rotate: [0, 4, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
