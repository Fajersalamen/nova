import Image from 'next/image';
import { LazyVideo } from './LazyVideo';
import { WhatsAppButton } from './WhatsAppButton';
import { formatPrice } from '@/lib/utils';
import type { MenuItem } from '@/types/database.types';

interface Props {
  item: MenuItem;
  restaurantName: string;
  phoneWhatsapp: string;
}

export function MenuItemCard({ item, restaurantName, phoneWhatsapp }: Props) {
  const hasMedia = Boolean(item.image_url || item.video_url);

  // Items with a photo get the full image-forward card; text-only items
  // (a very common case — drinks, extras, sides) get a compact list row
  // instead of an oversized card with a placeholder box.
  if (!hasMedia) {
    return (
      <article className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-brand-300">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-neutral-900">{item.name}</h3>
          {item.description && (
            <p className="mt-0.5 truncate text-sm text-neutral-600">{item.description}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-accent-400 px-3 py-1.5 text-sm font-bold text-brand-900">
          {formatPrice(item.price)}
        </span>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        {item.image_url && (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        )}
        {item.video_url && (
          <LazyVideo src={item.video_url} poster={item.image_url} label={item.name} />
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-accent-400 px-3 py-1.5 text-sm font-bold text-brand-900 shadow">
          {formatPrice(item.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-neutral-900">{item.name}</h3>

        {item.description && (
          <p className="text-sm leading-relaxed text-neutral-600">{item.description}</p>
        )}

        <div className="mt-auto pt-3">
          <WhatsAppButton
            phoneWhatsapp={phoneWhatsapp}
            restaurantName={restaurantName}
            itemName={item.name}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1da851]"
          >
            اطلب هذا الصنف
          </WhatsAppButton>
        </div>
      </div>
    </article>
  );
}
