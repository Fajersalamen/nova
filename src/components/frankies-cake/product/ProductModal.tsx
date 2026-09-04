'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import type { Category, Flavor } from '@/data/frankies-cake/menu';
import { useCart } from '../cart/CartProvider';
import { Button } from '../ui/Button';
import { easeLuxe } from '@/lib/frankies-cake/motion';
import { useLockBodyScroll } from '@/lib/frankies-cake/useLockBodyScroll';
import { useEscapeKey } from '@/lib/frankies-cake/useEscapeKey';

type ProductModalProps = {
  category: Category;
  flavor: Flavor;
  layoutId: string;
  onClose: () => void;
};

export function ProductModal({ category, flavor: initialFlavor, layoutId, onClose }: ProductModalProps) {
  const { addLine } = useCart();
  const [flavor, setFlavor] = useState(initialFlavor);
  const [sizeCode, setSizeCode] = useState(category.sizes[0]!.code);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useLockBodyScroll(true);
  useEscapeKey(onClose);

  const size = category.sizes.find((s) => s.code === sizeCode) ?? category.sizes[0]!;

  function handleAdd() {
    addLine(
      {
        categorySlug: category.slug,
        categoryName: category.name,
        flavorSlug: flavor.slug,
        flavorName: flavor.name,
        image: flavor.image,
        sizeCode: size.code,
        sizeInches: size.inches,
        unitPrice: size.price,
        qty,
        notes: notes || undefined,
      },
      imgRef.current,
    );
    setJustAdded(true);
    setTimeout(onClose, 550);
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onClose}
        className="absolute inset-0 bg-fc-cocoa/50 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.5, ease: easeLuxe }}
        className="relative grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-[28px] bg-fc-paper shadow-2xl sm:grid-cols-2 sm:overflow-hidden"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-fc-paper/90 text-fc-cocoa shadow-md transition hover:bg-fc-cream"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="relative aspect-square bg-fc-cream-dark sm:aspect-auto">
          <AnimatePresence mode="wait">
            <motion.img
              key={flavor.slug}
              layoutId={`${layoutId}-image`}
              ref={imgRef}
              src={flavor.image}
              alt={flavor.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 sm:py-10">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-fc-gold">
              {category.name}
            </span>
            <h3 className="mt-2 font-fc-serif text-3xl text-fc-cocoa">{flavor.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fc-cocoa-light">{flavor.blurb}</p>
          </div>

          {category.flavors.length > 1 ? (
            <div>
              <Label>Flavor</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {category.flavors.map((f) => (
                  <button
                    key={f.slug}
                    onClick={() => setFlavor(f)}
                    className={`overflow-hidden rounded-xl border-2 transition ${
                      f.slug === flavor.slug ? 'border-fc-cocoa' : 'border-transparent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.image} alt={f.name} className="h-12 w-12 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <Label>Size</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {category.sizes.map((s) => (
                <button
                  key={s.code}
                  onClick={() => setSizeCode(s.code)}
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    s.code === sizeCode
                      ? 'border-fc-cocoa bg-fc-cocoa text-fc-cream'
                      : 'border-fc-cocoa/20 text-fc-cocoa-light hover:border-fc-cocoa/50'
                  }`}
                >
                  {s.code} · {s.inches}&quot; · {s.price} JD
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Happy Birthday Lina!"
              rows={2}
              className="mt-2 w-full resize-none rounded-lg border border-fc-cocoa/15 bg-fc-cream px-3 py-2.5 text-sm text-fc-cocoa placeholder:text-fc-cocoa-light/50 focus:border-fc-cocoa/40"
            />
          </div>

          <div className="mt-auto flex items-center gap-4 pt-2">
            <div className="flex items-center gap-4 rounded-full border border-fc-cocoa/15 px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="text-fc-cocoa/70 transition hover:text-fc-cocoa"
              >
                <Minus className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <span className="w-4 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                className="text-fc-cocoa/70 transition hover:text-fc-cocoa"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <Button className="flex-1" size="lg" onClick={handleAdd} disabled={justAdded}>
              {justAdded ? 'Added ✓' : `Add to Cart — ${(size.price * qty).toFixed(2)} JD`}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fc-cocoa-light/70">{children}</span>;
}
