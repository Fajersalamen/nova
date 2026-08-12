import { MenuItemCard } from './MenuItemCard';
import type { MenuCategory, MenuItem } from '@/types/database.types';

interface Props {
  categories: MenuCategory[];
  items: MenuItem[];
  restaurantName: string;
  phoneWhatsapp: string;
}

export function MenuList({ categories, items, restaurantName, phoneWhatsapp }: Props) {
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
      {populated.map((category) => (
        <section key={category.id} id={`category-${category.id}`} className="space-y-5">
          <h2 className="border-b border-neutral-200 pb-2 text-2xl font-bold text-neutral-900">
            {category.name}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {itemsByCategory.get(category.id)?.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                restaurantName={restaurantName}
                phoneWhatsapp={phoneWhatsapp}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
