import { MapPin, Phone } from 'lucide-react';
import { brand, navLinks } from '@/data/frankies-cake/content';

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-fc-cocoa text-fc-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 py-20 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr] lg:py-24">
        <div>
          <span className="font-fc-serif text-3xl italic">Frankies</span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-fc-cream/60">
            Handcrafted cakes for your sweetest moments — baked to order in AlJubiha, Amman.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {brand.services.map((s) => (
              <span
                key={s}
                className="rounded-full border border-fc-cream/15 px-3 py-1 text-[11px] uppercase tracking-wide text-fc-cream/60"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-fc-gold">Explore</p>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-fc-cream/70 transition hover:text-fc-cream"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-fc-gold">Visit &amp; Order</p>
          <ul className="mt-5 space-y-4 text-sm text-fc-cream/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fc-cream/40" strokeWidth={1.5} />
              {brand.address}
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-fc-cream/40" strokeWidth={1.5} />
              <a href={brand.phoneHref} className="transition hover:text-fc-cream">
                {brand.phone}
              </a>
            </li>
            <li className="pl-7 text-fc-cream/50">{brand.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-fc-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-4 px-6 py-6 text-xs text-fc-cream/40 sm:flex-row sm:px-8">
          <span>&copy; {new Date().getFullYear()} Frankies Cake. All rights reserved.</span>
          <span>Handcrafted in Amman, Jordan.</span>
        </div>
      </div>
    </footer>
  );
}
