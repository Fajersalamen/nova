'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';

const values = [
  { title: 'Small-batch baking', body: 'Every order is baked to order — never frozen, never mass-produced.' },
  { title: 'Amman-based studio', body: 'Handcrafted in AlJubiha and delivered fresh across the city.' },
  { title: 'Designed, not just decorated', body: 'Every flavor pairing and finish is considered before it reaches you.' },
];

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section id="about" className="bg-fc-cream py-28 lg:py-36">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal as="scale">
          <div ref={ref} className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
            <motion.img
              style={{ y }}
              src="/images/cakes/strawberry-classic.webp"
              alt="Frankies Cake — handcrafted in Amman"
              className="h-[116%] w-full object-cover"
            />
          </div>
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="Our Story"
            title="Made by Hand. Made With Heart."
            description="Frankies Cake began with a simple belief: dessert should feel like a gift, not a transaction. Every cake that leaves our AlJubiha studio is shaped, filled, and finished by hand — built around the moment it's meant to celebrate."
          />

          <div className="mt-10 space-y-6">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={0.08 * i}>
                <div className="flex gap-4 border-t border-fc-cocoa/10 pt-6">
                  <span className="font-fc-serif text-lg text-fc-gold">0{i + 1}</span>
                  <div>
                    <p className="font-medium text-fc-cocoa">{v.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-fc-cocoa-light">{v.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
