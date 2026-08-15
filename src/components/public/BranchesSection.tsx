import { MapPin, Phone } from 'lucide-react';
import type { RestaurantBranch } from '@/types/database.types';

interface Props {
  branches: RestaurantBranch[];
}

export function BranchesSection({ branches }: Props) {
  if (branches.length === 0) return null;

  return (
    <section aria-labelledby="branches-heading" className="mx-auto max-w-6xl px-4 pb-20">
      <h2 id="branches-heading" className="mb-8 text-3xl font-black tracking-tight text-ink">
        فروعنا
      </h2>

      <div className="grid gap-8 sm:grid-cols-2">
        {branches.map((branch) => (
          <article
            key={branch.id}
            className="space-y-4 rounded-3xl border border-border bg-white p-8 shadow-sm"
          >
            <h3 className="text-xl font-black text-ink">{branch.name}</h3>
            {branch.address && (
              <p className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
                <MapPin className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                {branch.address}
              </p>
            )}
            <a
              href={`tel:${branch.phone_whatsapp.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-black text-white transition-transform hover:scale-105"
            >
              <Phone className="h-4 w-4" aria-hidden />
              <span dir="ltr">{branch.phone_whatsapp}</span>
            </a>

            {branch.google_maps_embed_url && (
              <div className="overflow-hidden rounded-2xl border border-border">
                <iframe
                  src={branch.google_maps_embed_url}
                  title={`خريطة ${branch.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[220px] w-full border-0"
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
