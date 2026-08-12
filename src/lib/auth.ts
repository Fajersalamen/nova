import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { AdminRole, Restaurant } from '@/types/database.types';

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
  restaurant: Restaurant;
}

/**
 * Resolves the logged-in admin and the single restaurant they administer.
 * Every admin page and server action goes through this, so a tenant id is
 * never taken from user-supplied input — it's derived from the session.
 * RLS then re-checks the same ownership at the database layer.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: membership } = await supabase
    .from('admin_users')
    .select('restaurant_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!membership) redirect('/admin/no-restaurant');

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', membership.restaurant_id)
    .maybeSingle();

  if (!restaurant) redirect('/admin/no-restaurant');

  return {
    userId: user.id,
    email: user.email ?? '',
    role: membership.role,
    restaurant: restaurant as Restaurant,
  };
}
