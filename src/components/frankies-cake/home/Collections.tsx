'use client';

import { useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { collections } from '@/data/frankies-cake/content';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';

export function Collections() {
  const railRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(dir: 1 | -1) {
    railRef.current?.scrollBy({ left: dir * 420, behavior: 'smooth' });
  }

  return (
    <section id="collections" className="relative overflow-hidden bg-fc-paper py-28 lg:py-36">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 sm:flex-row sm:items-end sm:px-8">
        <SectionHeading
          eyebrow="Collections"
          title="A Cake for Every Occasion"
          description="Six ways to celebrate, each with its own character and flavor profile."
        />
        <div className="hidden gap-3 sm:flex">
          <RailButton onClick={() => scrollByAmount(-1)} direction="left" />
          <RailButton onClick={() => scrollByAmount(1)} direction="right" />
        </div>
      </div>

      <div
        ref={railRef}
        className="fc-no-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8"
      >
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={0.06 * i} className="snap-start">
            <a
              href="#cakes"
              className="group relative block h-[420px] w-[300px] shrink-0 overflow-hidden rounded-[24px] sm:h-[480px] sm:w-[340px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt={c.title}
                className="h-full w-full scale-105 object-cover brightness-[0.65] transition-all duration-[1200ms] ease-out group-hover:scale-115 group-hover:brightness-[0.45]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-fc-cocoa/80 via-fc-cocoa/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-6 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-fc-cream/70">
                  Collection
                </span>
                <h3 className="font-fc-serif text-2xl text-fc-cream">{c.title}</h3>
                <p className="max-h-0 overflow-hidden text-sm text-fc-cream/80 opacity-0 transition-all duration-500 ease-out group-hover:mt-1 group-hover:max-h-16 group-hover:opacity-100">
                  {c.description}
                </p>
              </div>
              <span className="absolute right-5 top-5 flex h-10 w-10 -translate-y-2 items-center justify-center rounded-full bg-fc-cream/90 text-fc-cocoa opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function RailButton({ onClick, direction }: { onClick: () => void; direction: 'left' | 'right' }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Scroll ${direction}`}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-fc-cocoa/15 text-fc-cocoa transition hover:border-fc-cocoa hover:bg-fc-cocoa hover:text-fc-cream"
    >
      <ArrowRight className={`h-4 w-4 ${direction === 'left' ? 'rotate-180' : ''}`} strokeWidth={1.5} />
    </button>
  );
}
