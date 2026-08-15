import { MenuItemCard, MenuItemRow } from './MenuItemCard';
import { T } from './T';
import type { MenuCategory, MenuItem } from '@/types/database.types';

interface Props {
  categories: MenuCategory[];
  items: MenuItem[];
}

export function MenuList({ categories, items }: Props) {
  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const item of items) {
    const bucket = itemsByCategory.get(item.category_id);
    if (bucket) bucket.push(item);
    else itemsByCategory.set(item.category_id, [item]);
  }

  const populated = categories.filter((c) => (itemsByCategory.get(c.id)?.length ?? 0) > 0);

  if (populated.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border p-8 text-center font-semibold text-neutral-500">
        <T k="menuComingSoon" />
      </p>
    );
  }

  return (
    <div className="space-y-16">
      {populated.map((category) => {
        const categoryItems = itemsByCategory.get(category.id) ?? [];
        const withMedia = categoryItems.filter((item) => item.image_url || item.video_url);
        const withoutMedia = categoryItems.filter((item) => !item.image_url && !item.video_url);

        return (
          <section key={category.id} id={`category-${category.id}`}>
            <h2 className="mb-8 flex items-center gap-3 text-3xl font-black tracking-tight text-ink">
              <span aria-hidden="true" className="h-8 w-2 rounded-full bg-brand-600" />
              {category.name}
            </h2>

            {withMedia.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {withMedia.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {withoutMedia.length > 0 && (
              <ul
                className={`divide-y divide-border overflow-hidden rounded-3xl border border-border bg-white ${
                  withMedia.length > 0 ? 'mt-6' : ''
                }`}
              >
                {withoutMedia.map((item) => (
                  <MenuItemRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
