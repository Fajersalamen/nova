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
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {(item.image_url || item.video_url) && (
        // Explicit aspect ratio reserves the space before media loads,
        // which keeps CLS at zero.
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
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-neutral-900">{item.name}</h3>
          <span className="shrink-0 font-bold text-brand-700">{formatPrice(item.price)}</span>
        </div>

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
