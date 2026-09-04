'use client';

import { motion } from 'framer-motion';
import { LOADER_TOTAL_S } from '@/lib/frankies-cake/timing';
import { easeLuxe, staggerChildren, wordReveal } from '@/lib/frankies-cake/motion';
import { FloatingIcon } from '../ui/FloatingIcon';
import { Button } from '../ui/Button';
import { FlowerMark, PistachioMark, StrawberryMark } from '../ui/ingredient-icons';

const HEADLINE = 'Handcrafted Happiness';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-[var(--fc-header-h)]"
    >
      {/* ambient backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: easeLuxe }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,#f1e6d3_0%,transparent_55%),radial-gradient(circle_at_10%_85%,#efe0cc_0%,transparent_50%)]"
      />
      <div className="fc-grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-0">
        <div className="order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeLuxe, delay: LOADER_TOTAL_S }}
            className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-fc-gold"
          >
            <span className="h-px w-8 bg-current" />
            Amman&apos;s Handcrafted Cake Studio
          </motion.div>

          <h1 className="mt-6 font-fc-serif text-[clamp(2.8rem,7.5vw,5.6rem)] font-medium leading-[0.98] tracking-tight text-fc-cocoa">
            <motion.span
              initial="hidden"
              animate="show"
              variants={staggerChildren(0.12, LOADER_TOTAL_S + 0.15)}
              className="block"
            >
              {HEADLINE.split(' ').map((word, i) => (
                <span key={word} className="mr-4 inline-block overflow-hidden pb-2 align-bottom last:mr-0">
                  <motion.span
                    variants={wordReveal}
                    className={`inline-block ${i === 1 ? 'italic text-fc-gold' : ''}`}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLuxe, delay: LOADER_TOTAL_S + 0.55 }}
            className="mt-7 max-w-md text-[15px] leading-relaxed text-fc-cocoa-light"
          >
            Beautiful cakes, made with love for your sweetest moments — handcrafted in small batches
            in AlJubiha, Amman.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLuxe, delay: LOADER_TOTAL_S + 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button size="lg" onClick={() => scrollToId('cakes')}>
              Explore Cakes
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToId('custom')}>
              Order Now
            </Button>
          </motion.div>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: easeLuxe, delay: LOADER_TOTAL_S }}
            className="relative aspect-square w-[min(78vw,440px)]"
          >
            <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle,#f6ead4_0%,transparent_70%)] blur-2xl" />
            <div
              className="fc-float absolute inset-0"
              style={{ '--fc-tilt': '-2deg' } as React.CSSProperties}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[40%_60%_55%_45%/50%_45%_55%_50%] shadow-[0_50px_90px_-30px_rgba(58,42,32,0.45)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/cakes/pistachio-royale.webp"
                  alt="Pistachio Royale — mirror-glazed signature cake"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <FloatingIcon className="left-[-8%] top-[8%] h-10 w-10 text-fc-blush/70" duration={7}>
              <StrawberryMark className="h-full w-full" />
            </FloatingIcon>
            <FloatingIcon className="bottom-[10%] right-[-6%] h-9 w-9 text-fc-sage/70" duration={8.5} delay={1}>
              <PistachioMark className="h-full w-full" />
            </FloatingIcon>
            <FloatingIcon className="right-[6%] top-[-4%] h-7 w-7 text-fc-gold/70" duration={6.5} delay={0.5}>
              <FlowerMark className="h-full w-full" />
            </FloatingIcon>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: LOADER_TOTAL_S + 1.1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-fc-cocoa-light/60 lg:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-current" />
      </motion.div>
    </section>
  );
}
