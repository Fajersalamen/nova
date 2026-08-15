import Image from 'next/image';
import { LazyVideo } from './LazyVideo';
import { formatPrice } from '@/lib/utils';
import type { MenuItem } from '@/types/database.types';

interface Props {
  item: MenuItem;
}

export function MenuItemCard({ item }: Props) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-shadow hover:shadow-xl">
      <div className="relative overflow-hidden">
        {item.image_url && (
          <Image
            src={item.image_url}
            alt={item.name}
            width={800}
            height={800}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {item.video_url && (
          <div className="aspect-square w-full">
            <LazyVideo src={item.video_url} poster={item.image_url} label={item.name} />
          </div>
        )}
        {item.tag && (
          <span className="absolute right-4 top-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-black text-white shadow">
            {item.tag}
          </span>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-black text-ink">{item.name}</h3>
          <span className="shrink-0 rounded-full bg-accent-400 px-3 py-1 text-sm font-black text-accent-900">
            {formatPrice(item.price)}
          </span>
        </div>
        {item.description && (
          <p className="mt-2 text-sm font-semibold leading-relaxed text-neutral-600">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}

export function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <li className="flex items-center justify-between gap-4 px-6 py-4">
      <div>
        <h3 className="font-black text-ink">{item.name}</h3>
        {item.description && (
          <p className="text-sm font-semibold text-neutral-600">{item.description}</p>
        )}
      </div>
      <span className="shrink-0 rounded-full bg-accent-400 px-3 py-1 text-sm font-black text-accent-900">
        {formatPrice(item.price)}
      </span>
    </li>
  );
}
