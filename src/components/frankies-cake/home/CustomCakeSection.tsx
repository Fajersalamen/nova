'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CustomCakeBuilder } from '../custom-builder/CustomCakeBuilder';
import { Reveal } from '../ui/Reveal';
import { Button } from '../ui/Button';
import { FloatingIcon } from '../ui/FloatingIcon';
import { ChocolateChunkMark, FlowerMark } from '../ui/ingredient-icons';

export function CustomCakeSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="custom" className="relative overflow-hidden bg-fc-cocoa py-28 text-fc-cream lg:py-36">
      <FloatingIcon className="left-[6%] top-[18%] h-16 w-16 text-fc-cream/10" duration={9}>
        <FlowerMark className="h-full w-full" />
      </FloatingIcon>
      <FloatingIcon className="bottom-[14%] right-[8%] h-20 w-20 text-fc-cream/10" duration={10} delay={1.2}>
        <ChocolateChunkMark className="h-full w-full" />
      </FloatingIcon>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-fc-gold">
            <span className="h-px w-8 bg-current" />
            Bespoke Orders
            <span className="h-px w-8 bg-current" />
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 font-fc-serif text-[clamp(2.4rem,6vw,4.2rem)] font-medium leading-[1.05] tracking-tight">
            Your Imagination, <em className="italic text-fc-gold">Our Cake.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-fc-cream/70">
            Have something specific in mind? Tell us the size, flavor, and finish you&apos;re dreaming
            of — our designers will bring it to life for your next celebration.
          </p>
        </Reveal>
        <Reveal delay={0.28}>
          <Button size="lg" variant="invert" onClick={() => setOpen(true)} className="mt-10" showArrow>
            Create Your Cake
          </Button>
        </Reveal>
      </div>

      <AnimatePresence>{open ? <CustomCakeBuilder onClose={() => setOpen(false)} /> : null}</AnimatePresence>
    </section>
  );
}
