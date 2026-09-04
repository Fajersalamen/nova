import { Reveal } from './Reveal';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
}: SectionHeadingProps) {
  const isCenter = align === 'center';
  const isLight = tone === 'light';
  return (
    <div className={isCenter ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <Reveal>
        <div
          className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] ${
            isLight ? 'text-fc-cream/70' : 'text-fc-gold'
          } ${isCenter ? 'justify-center' : ''}`}
        >
          <span className="h-px w-8 bg-current" />
          {eyebrow}
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={`mt-5 font-fc-serif text-[clamp(2.1rem,5vw,3.6rem)] font-medium leading-[1.05] tracking-tight ${
            isLight ? 'text-fc-cream' : 'text-fc-cocoa'
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.16}>
          <p
            className={`mt-5 text-[15px] leading-relaxed ${
              isLight ? 'text-fc-cream/75' : 'text-fc-cocoa-light'
            } ${isCenter ? 'mx-auto max-w-md' : 'max-w-md'}`}
          >
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
