'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { navLinks } from '@/data/frankies-cake/content';
import { useSiteUI } from '../ui/SiteUIProvider';
import { Button } from '../ui/Button';
import { easeLuxe } from '@/lib/frankies-cake/motion';
import { useLockBodyScroll } from '@/lib/frankies-cake/useLockBodyScroll';
import { useEscapeKey } from '@/lib/frankies-cake/useEscapeKey';

export function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useSiteUI();
  useLockBodyScroll(mobileMenuOpen);
  useEscapeKey(() => setMobileMenuOpen(false), mobileMenuOpen);

  function go(id: string) {
    setMobileMenuOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }

  return (
    <AnimatePresence>
      {mobileMenuOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-fc-cocoa/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: easeLuxe }}
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex h-full w-4/5 max-w-xs flex-col justify-center gap-2 bg-fc-cream px-10"
          >
            {navLinks.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: easeLuxe }}
                onClick={() => go(link.href.replace('#', ''))}
                className="py-3 text-left font-fc-serif text-3xl italic text-fc-cocoa"
              >
                {link.label}
              </motion.button>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5, ease: easeLuxe }}
              className="mt-6"
            >
              <Button className="w-full" onClick={() => go('cakes')}>
                Order Now
              </Button>
            </motion.div>
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
