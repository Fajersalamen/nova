'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from './CartProvider';
import { useLockBodyScroll } from '@/lib/frankies-cake/useLockBodyScroll';
import { useEscapeKey } from '@/lib/frankies-cake/useEscapeKey';
import { Button } from '../ui/Button';
import { easeLuxe } from '@/lib/frankies-cake/motion';
import { CheckoutView } from './CheckoutView';

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, lines, subtotal, updateQty } = useCart();
  const [stage, setStage] = useState<'cart' | 'checkout' | 'success'>('cart');

  useLockBodyScroll(isDrawerOpen);
  useEscapeKey(() => handleClose(), isDrawerOpen);

  function handleClose() {
    closeDrawer();
    setTimeout(() => setStage('cart'), 300);
  }

  return (
    <AnimatePresence>
      {isDrawerOpen ? (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-fc-cocoa/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: easeLuxe }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-fc-paper shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-fc-cocoa/10 px-6 py-5 sm:px-8">
              <h2 className="font-fc-serif text-2xl text-fc-cocoa">
                {stage === 'checkout' ? 'Checkout' : 'Your Bag'}
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full text-fc-cocoa/60 transition hover:bg-fc-cocoa/5 hover:text-fc-cocoa"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </header>

            <AnimatePresence mode="wait">
              {stage === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-fc-sage/15 text-fc-sage">
                    <Check className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-fc-serif text-2xl text-fc-cocoa">Order request received</h3>
                  <p className="max-w-xs text-sm text-fc-cocoa-light">
                    Thank you — our team will call you shortly to confirm delivery timing and payment.
                  </p>
                  <Button variant="outline" onClick={handleClose} className="mt-2">
                    Continue Browsing
                  </Button>
                </motion.div>
              ) : stage === 'checkout' ? (
                <motion.div
                  key="checkout"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: easeLuxe }}
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  <CheckoutView
                    subtotal={subtotal}
                    onBack={() => setStage('cart')}
                    onSubmit={() => setStage('success')}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.35, ease: easeLuxe }}
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  {lines.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                      <p className="font-fc-serif text-xl text-fc-cocoa">Your bag is empty</p>
                      <p className="text-sm text-fc-cocoa-light">
                        Browse our cakes and add your first flavor.
                      </p>
                      <Button variant="outline" onClick={handleClose} className="mt-2">
                        Explore Cakes
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ul className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-8">
                        {lines.map((line) => (
                          <li key={line.id} className="flex gap-4">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-fc-cream-dark">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={line.image} alt={line.flavorName} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-1 flex-col">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-fc-serif text-base text-fc-cocoa">{line.flavorName}</p>
                                  <p className="text-xs uppercase tracking-wide text-fc-cocoa-light/70">
                                    {line.sizeCode} · {line.sizeInches}&quot;
                                  </p>
                                </div>
                                <p className="whitespace-nowrap text-sm font-medium text-fc-cocoa">
                                  {(line.unitPrice * line.qty).toFixed(2)} JD
                                </p>
                              </div>
                              <div className="mt-2 flex items-center gap-3">
                                <div className="flex items-center gap-3 rounded-full border border-fc-cocoa/15 px-2 py-1">
                                  <button
                                    onClick={() => updateQty(line.id, line.qty - 1)}
                                    aria-label="Decrease quantity"
                                    className="text-fc-cocoa/70 transition hover:text-fc-cocoa"
                                  >
                                    <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
                                  </button>
                                  <span className="w-4 text-center text-sm">{line.qty}</span>
                                  <button
                                    onClick={() => updateQty(line.id, line.qty + 1)}
                                    aria-label="Increase quantity"
                                    className="text-fc-cocoa/70 transition hover:text-fc-cocoa"
                                  >
                                    <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                                  </button>
                                </div>
                                <button
                                  onClick={() => updateQty(line.id, 0)}
                                  className="text-xs text-fc-cocoa-light/60 underline-offset-2 transition hover:text-fc-cocoa hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-fc-cocoa/10 px-6 py-6 sm:px-8">
                        <div className="mb-4 flex items-center justify-between text-sm">
                          <span className="text-fc-cocoa-light">Subtotal</span>
                          <span className="font-fc-serif text-lg text-fc-cocoa">{subtotal.toFixed(2)} JD</span>
                        </div>
                        <Button className="w-full" size="lg" onClick={() => setStage('checkout')} showArrow>
                          Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
