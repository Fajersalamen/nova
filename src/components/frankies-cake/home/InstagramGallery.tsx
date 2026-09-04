import { galleryImages } from '@/data/frankies-cake/content';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';

function PostGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function InstagramGallery() {
  return (
    <section className="bg-fc-paper py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Sweetness, Shared"
          title="Straight From Our Kitchen"
          description="A closer look at the cakes leaving our studio this season."
          align="center"
        />

        <div className="mt-14 columns-2 gap-4 sm:columns-3 lg:columns-4">
          {galleryImages.map((src, i) => (
            <Reveal key={src} delay={0.04 * i} className="mb-4 break-inside-avoid">
              <div className="group relative overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className={`w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110 ${
                    i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-fc-cocoa/0 text-fc-cream opacity-0 transition-all duration-400 group-hover:bg-fc-cocoa/45 group-hover:opacity-100">
                  <PostGlyph />
                  <span className="text-xs font-medium uppercase tracking-[0.18em]">View Post</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
