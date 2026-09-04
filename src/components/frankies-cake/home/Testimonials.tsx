'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { testimonials } from '@/data/frankies-cake/content';
import { SectionHeading } from '../ui/SectionHeading';
import { easeLuxe } from '@/lib/frankies-cake/motion';

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const current = testimonials[index]!;

  return (
    <section className="bg-fc-cream-dark/40 py-28 lg:py-36">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <SectionHeading eyebrow="Testimonials" title="Words From Our Guests" align="center" />

        <div
          className="relative mt-14 min-h-[240px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 font-fc-serif text-8xl text-fc-gold/20">
            &ldquo;
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: easeLuxe }}
              className="relative"
            >
              <div className="flex justify-center gap-1 text-fc-gold">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-6 font-fc-serif text-2xl italic leading-relaxed text-fc-cocoa sm:text-3xl">
                {current.quote}
              </p>
              <p className="mt-6 text-sm font-medium text-fc-cocoa">{current.name}</p>
              <p className="text-xs uppercase tracking-wide text-fc-cocoa-light/70">{current.role}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial from ${t.name}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-6 bg-fc-cocoa' : 'w-1.5 bg-fc-cocoa/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
