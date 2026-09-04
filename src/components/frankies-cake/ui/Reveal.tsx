'use client';

import { motion } from 'framer-motion';
import { fadeUp, scaleIn, viewportOnce } from '@/lib/frankies-cake/motion';

type RevealProps = {
  children: React.ReactNode;
  as?: 'fade-up' | 'scale';
  delay?: number;
  className?: string;
};

/** Scroll-triggered reveal used throughout the site — fires once, near the viewport edge. */
export function Reveal({ children, as = 'fade-up', delay = 0, className }: RevealProps) {
  const variants = as === 'scale' ? scaleIn : fadeUp;
  return (
    <motion.div
      data-fc-reveal
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      custom={delay}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
