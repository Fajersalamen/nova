'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from './CartProvider';

/** Small toast confirming an add-to-cart — pairs with the fly/bump animation, never the button label itself. */
export function AddedToast() {
  const { lastAdded, bumpToken, openDrawer } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (bumpToken === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [bumpToken]);

  return (
    <AnimatePresence>
      {visible && lastAdded ? (
        <motion.button
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={openDrawer}
          className="fixed bottom-6 left-1/2 z-[150] flex -translate-x-1/2 items-center gap-3 rounded-full bg-fc-cocoa px-5 py-3 text-sm text-fc-cream shadow-[0_20px_45px_-15px_rgba(58,42,32,0.5)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-fc-gold" />
          <span>
            <strong className="font-medium">{lastAdded}</strong> added to your bag
          </span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
