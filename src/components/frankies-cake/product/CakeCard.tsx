'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { Category, Flavor } from '@/data/frankies-cake/menu';
import { priceFrom } from '@/data/frankies-cake/menu';
import { useCart } from '../cart/CartProvider';
import { easeLuxe } from '@/lib/frankies-cake/motion';

type CakeCardProps = {
  category: Category;
  flavor: Flavor;
  onOpen: () => void;
  layoutId: string;
};

export function CakeCard({ category, flavor, onOpen, layoutId }: CakeCardProps) {
  const { addLine } = useCart();
  const imgRef = useRef<HTMLImageElement>(null);
  const startingSize = category.sizes[0]!;

  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addLine(
      {
        categorySlug: category.slug,
        categoryName: category.name,
        flavorSlug: flavor.slug,
        flavorName: flavor.name,
        image: flavor.image,
        sizeCode: startingSize.code,
        sizeInches: startingSize.inches,
        unitPrice: startingSize.price,
        qty: 1,
      },
      imgRef.current,
    );
  }

  return (
    <motion.div
      layoutId={layoutId}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen();
      }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: easeLuxe }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[28px] bg-fc-paper text-left shadow-[0_1px_0_rgba(58,42,32,0.06)] transition-shadow duration-500 hover:shadow-[0_36px_60px_-24px_rgba(58,42,32,0.35)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-fc-cream-dark">
        <motion.img
          layoutId={`${layoutId}-image`}
          ref={imgRef}
          src={flavor.image}
          alt={flavor.name}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-fc-cream/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-fc-cocoa backdrop-blur">
          {category.shortName}
        </span>

        <motion.button
          onClick={handleQuickAdd}
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.05 }}
          className="absolute bottom-4 right-4 flex translate-y-2 items-center gap-2 rounded-full bg-fc-cocoa px-4 py-2.5 text-xs font-medium text-fc-cream opacity-0 shadow-lg transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Add to Cart
        </motion.button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-5 py-5">
        <h3 className="font-fc-serif text-xl text-fc-cocoa">{flavor.name}</h3>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-fc-cocoa-light">{flavor.blurb}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-medium text-fc-cocoa">From {priceFrom(category)} JD</span>
          <span className="text-[11px] uppercase tracking-wide text-fc-cocoa-light/60">{category.name}</span>
        </div>
      </div>
    </motion.div>
  );
}
