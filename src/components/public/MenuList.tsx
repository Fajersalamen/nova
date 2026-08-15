import { MenuItemCard } from './MenuItemCard';
import type { MenuCategory, MenuItem } from '@/types/database.types';

interface Props {
  categories: MenuCategory[];
  items: MenuItem[];
  phone: string;
}

export function MenuList({ categories, items, phone }: Props) {
  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const item of items) {
    const bucket = itemsByCategory.get(item.category_id);
    if (bucket) bucket.push(item);
    else itemsByCategory.set(item.category_id, [item]);
  }

  const populated = categories.filter((c) => (itemsByCategory.get(c.id)?.length ?? 0) > 0);

  if (populated.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
        المنيو قيد التحديث حاليًا.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {populated.map((category) => {
        const categoryItems = itemsByCategory.get(category.id) ?? [];
        // Dishes with a photo read best as an image grid; plain extras
        // (drinks, sauces, sides with no photo) read best as a compact
        // list — mixing the two into one grid would stretch text rows to
        // card width or shrink photos to list height.
        const withMedia = categoryItems.filter((item) => item.image_url || item.video_url);
        const withoutMedia = categoryItems.filter((item) => !item.image_url && !item.video_url);

        return (
          <section key={category.id} id={`category-${category.id}`} className="space-y-5">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-neutral-900">
              <span aria-hidden="true" className="h-6 w-1.5 rounded-full bg-brand-600" />
              {category.name}
            </h2>

            {withMedia.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {withMedia.map((item) => (
                  <MenuItemCard key={item.id} item={item} phone={phone} />
                ))}
              </div>
            )}

            {withoutMedia.length > 0 && (
              <div className="space-y-3">
                {withoutMedia.map((item) => (
                  <MenuItemCard key={item.id} item={item} phone={phone} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
