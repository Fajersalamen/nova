'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LOADER_EXIT_MS, LOADER_HOLD_MS } from '@/lib/frankies-cake/timing';

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), LOADER_HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: LOADER_EXIT_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center gap-5 bg-fc-cream"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-fc-serif text-4xl italic text-fc-cocoa"
          >
            Frankies
          </motion.span>
          <div className="h-px w-28 overflow-hidden bg-fc-cocoa/10">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: LOADER_HOLD_MS / 1000, ease: [0.45, 0, 0.15, 1] }}
              className="h-full w-full bg-fc-gold"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
