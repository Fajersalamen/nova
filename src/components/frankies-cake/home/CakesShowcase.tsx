'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getCategory, getFlavor, signatureCakes } from '@/data/frankies-cake/menu';
import { CakeCard } from '../product/CakeCard';
import { ProductModal } from '../product/ProductModal';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { useSiteUI } from '../ui/SiteUIProvider';

type Selection = { categorySlug: string; flavorSlug: string };

export function CakesShowcase() {
  const { searchQuery } = useSiteUI();
  const [selected, setSelected] = useState<Selection | null>(null);

  const items = useMemo(
    () =>
      signatureCakes.map((s) => ({
        category: getCategory(s.categorySlug),
        flavor: getFlavor(s.categorySlug, s.flavorSlug),
      })),
    [],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      ({ category, flavor }) =>
        flavor.name.toLowerCase().includes(q) ||
        category.name.toLowerCase().includes(q) ||
        flavor.blurb.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  const selectedItem = selected
    ? { category: getCategory(selected.categorySlug), flavor: getFlavor(selected.categorySlug, selected.flavorSlug) }
    : null;

  return (
    <section id="cakes" className="relative bg-fc-cream px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="The Menu"
            title="Made to Be Remembered"
            description="Every cake is handcrafted to make your celebration unforgettable."
          />
        </div>

        {filtered.length === 0 ? (
          <Reveal className="mt-20 text-center text-fc-cocoa-light">
            No cakes match &ldquo;{searchQuery}&rdquo; — try a different flavor or category.
          </Reveal>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map(({ category, flavor }, i) => {
              const layoutId = `cake-${category.slug}-${flavor.slug}`;
              return (
                <Reveal key={layoutId} delay={0.05 * (i % 4)}>
                  <CakeCard
                    category={category}
                    flavor={flavor}
                    layoutId={layoutId}
                    onOpen={() => setSelected({ categorySlug: category.slug, flavorSlug: flavor.slug })}
                  />
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem ? (
          <ProductModal
            category={selectedItem.category}
            flavor={selectedItem.flavor}
            layoutId={`cake-${selectedItem.category.slug}-${selectedItem.flavor.slug}`}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
