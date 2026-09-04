'use client';

import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { navLinks } from '@/data/frankies-cake/content';
import { useCart } from '../cart/CartProvider';
import { useSiteUI } from '../ui/SiteUIProvider';
import { Button } from '../ui/Button';
import { easeLuxe } from '@/lib/frankies-cake/motion';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { count, openDrawer, cartIconRef } = useCart();
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, mobileMenuOpen, setMobileMenuOpen } = useSiteUI();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24));

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: easeLuxe }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500 ${
        scrolled ? 'bg-fc-cream/90 shadow-[0_1px_0_rgba(58,42,32,0.08)] backdrop-blur-md' : 'bg-fc-cream/40 backdrop-blur-sm'
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-[height] duration-500 sm:px-8 ${
          scrolled ? 'h-[68px]' : 'h-[84px]'
        }`}
      >
        <button
          onClick={() => scrollToId('home')}
          className="font-fc-serif text-2xl italic tracking-tight text-fc-cocoa"
        >
          Frankies
        </button>

        <nav className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToId(link.href.replace('#', ''))}
              className="relative text-[13px] font-medium uppercase tracking-[0.14em] text-fc-cocoa/75 transition hover:text-fc-cocoa"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center sm:flex">
            <motion.div
              animate={{ width: searchOpen ? 200 : 0, opacity: searchOpen ? 1 : 0 }}
              transition={{ duration: 0.35, ease: easeLuxe }}
              className="overflow-hidden"
            >
              <input
                autoFocus={searchOpen}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
                placeholder="Search cakes…"
                className="w-[200px] border-b border-fc-cocoa/20 bg-transparent px-1 py-1.5 text-sm text-fc-cocoa placeholder:text-fc-cocoa-light/50 focus:border-fc-cocoa"
              />
            </motion.div>
            <button
              aria-label="Search"
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (searchOpen) setSearchQuery('');
              }}
              className="flex h-10 w-10 items-center justify-center text-fc-cocoa/70 transition hover:text-fc-cocoa"
            >
              {searchOpen ? <X className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />}
            </button>
          </div>

          <button
            ref={cartIconRef as React.RefObject<HTMLButtonElement>}
            aria-label="Open cart"
            onClick={openDrawer}
            className="relative flex h-10 w-10 items-center justify-center text-fc-cocoa/70 transition hover:text-fc-cocoa"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {count > 0 ? (
              <motion.span
                key={count}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="absolute right-0 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-fc-gold text-[10px] font-semibold text-fc-cocoa"
              >
                {count}
              </motion.span>
            ) : null}
          </button>

          <div className="hidden lg:block">
            <Button size="md" onClick={() => scrollToId('cakes')}>
              Order Now
            </Button>
          </div>

          <button
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center text-fc-cocoa lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
