import { requireAdminSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { MenuItemManager } from '@/components/admin/MenuItemManager';
import type { MenuCategory, MenuItem } from '@/types/database.types';

export default async function AdminMenuPage() {
  const session = await requireAdminSession();
  const supabase = await createClient();

  const [categoriesResult, itemsResult] = await Promise.all([
    supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', session.restaurant.id)
      .order('display_order', { ascending: true }),
    supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', session.restaurant.id)
      .order('display_order', { ascending: true }),
  ]);

  const categories = (categoriesResult.data ?? []) as MenuCategory[];
  const items = (itemsResult.data ?? []) as MenuItem[];

  return (
    <div className="space-y-10">
      <CategoryManager categories={categories} />
      <MenuItemManager categories={categories} items={items} />
    </div>
  );
}
