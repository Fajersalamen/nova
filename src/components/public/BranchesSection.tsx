import { CallButton } from './CallButton';
import type { RestaurantBranch } from '@/types/database.types';

interface Props {
  branches: RestaurantBranch[];
}

export function BranchesSection({ branches }: Props) {
  if (branches.length === 0) return null;

  return (
    <section className="space-y-6" aria-labelledby="branches-heading">
      <h2
        id="branches-heading"
        className="border-b border-neutral-200 pb-2 text-2xl font-bold text-neutral-900"
      >
        فروعنا
      </h2>

      <div className="grid gap-8 sm:grid-cols-2">
        {branches.map((branch) => (
          <article key={branch.id} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">{branch.name}</h3>
            {branch.address && <p className="text-sm text-neutral-600">{branch.address}</p>}

            <CallButton
              phone={branch.phone_whatsapp}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            />

            {branch.google_maps_embed_url && (
              <div className="overflow-hidden rounded-lg border border-neutral-200">
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
