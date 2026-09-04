'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from './CartProvider';

/** Renders the "product image flies to the cart icon" moment. Mounted once, near the root. */
export function FlyToCart() {
  const { flyRequest, clearFlyRequest, cartIconRef } = useCart();

  const target = flyRequest && cartIconRef.current ? cartIconRef.current.getBoundingClientRect() : null;

  return (
    <AnimatePresence>
      {flyRequest && target ? (
        <motion.img
          key={flyRequest.id}
          src={flyRequest.image}
          alt=""
          aria-hidden
          initial={{
            position: 'fixed',
            left: flyRequest.fromRect.x,
            top: flyRequest.fromRect.y,
            width: flyRequest.fromRect.width,
            height: flyRequest.fromRect.height,
            borderRadius: 16,
            opacity: 1,
            zIndex: 200,
          }}
          animate={{
            left: target.x + target.width / 2 - 14,
            top: target.y + target.height / 2 - 14,
            width: 28,
            height: 28,
            borderRadius: 999,
            opacity: 0.4,
          }}
          transition={{ duration: 0.7, ease: [0.32, 0, 0.2, 1] }}
          onAnimationComplete={clearFlyRequest}
          className="pointer-events-none object-cover shadow-lg"
        />
      ) : null}
    </AnimatePresence>
  );
}
