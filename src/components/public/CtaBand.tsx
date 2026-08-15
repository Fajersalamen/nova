import { Flame, Phone } from 'lucide-react';

interface Props {
  phone: string;
  heading: React.ReactNode;
  showFlame?: boolean;
}

export function CtaBand({ phone, heading, showFlame }: Props) {
  return (
    <section className="bg-ink py-20 text-center text-cream">
      <div className="mx-auto max-w-6xl px-4">
        {showFlame && <Flame className="mx-auto h-10 w-10 text-accent-400" aria-hidden />}
        <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{heading}</h2>
        <a
          href={`tel:${phone.replace(/[^\d+]/g, '')}`}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-10 py-4 text-lg font-black text-white shadow-lg transition-transform hover:scale-105"
        >
          <Phone className="h-5 w-5" aria-hidden />
          <span dir="ltr">{phone}</span>
        </a>
      </div>
    </section>
  );
}
