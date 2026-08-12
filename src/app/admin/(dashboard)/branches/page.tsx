import { requireAdminSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { BranchManager } from '@/components/admin/BranchManager';
import type { RestaurantBranch } from '@/types/database.types';

export default async function AdminBranchesPage() {
  const session = await requireAdminSession();
  const supabase = await createClient();

  const { data } = await supabase
    .from('restaurant_branches')
    .select('*')
    .eq('restaurant_id', session.restaurant.id)
    .order('display_order', { ascending: true });

  return <BranchManager branches={(data ?? []) as RestaurantBranch[]} />;
}
