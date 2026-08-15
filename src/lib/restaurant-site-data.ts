import { cache } from 'react';
import { createPublicClientOrNull } from '@/lib/supabase/public';
import type {
  MenuCategory,
  MenuItem,
  Restaurant,
  RestaurantBranch,
  Review,
} from '@/types/database.types';

// Distinguishes "this deployment is misconfigured" from "no such
// restaurant", so a missing env var doesn't masquerade as a 404.
export const CONFIG_ERROR = { configError: true } as const;

export interface RestaurantSiteData {
  restaurant: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
  internalReviews: Review[];
  branches: RestaurantBranch[];
}

// Wrapped in React's cache() so the layout and every page under it can
// call this with the same slug and hit Supabase exactly once per request
// — App Router re-renders layout.tsx and page.tsx as siblings in the same
// tree, so without this each navigation would double the query count.
export const getRestaurantSiteData = cache(
  async (slug: string): Promise<RestaurantSiteData | typeof CONFIG_ERROR | null> => {
    const supabase = createPublicClientOrNull();
    if (!supabase) return CONFIG_ERROR;

    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!restaurant || restaurant.subscription_status === 'canceled') return null;

    const [categoriesResult, itemsResult, reviewsResult, branchesResult] = await Promise.all([
      supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_available', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(24),
      supabase
        .from('restaurant_branches')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('display_order', { ascending: true }),
    ]);

    return {
      restaurant: restaurant as Restaurant,
      categories: (categoriesResult.data ?? []) as MenuCategory[],
      items: (itemsResult.data ?? []) as MenuItem[],
      internalReviews: (reviewsResult.data ?? []) as Review[],
      branches: (branchesResult.data ?? []) as RestaurantBranch[],
    };
  },
);

export async function getAllActiveSlugs(): Promise<string[]> {
  const supabase = createPublicClientOrNull();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('slug')
      .neq('subscription_status', 'canceled');

    if (error || !data) return [];
    return data.map(({ slug }) => slug);
  } catch {
    return [];
  }
}

/** Real rating data only — Google's when linked, otherwise the average of
 * the site's own approved reviews. Never a placeholder count. */
export function computeRating(
  google: { averageRating: number | null; totalRatings: number | null },
  internalReviews: Review[],
): { value: number | null; count: number | null } {
  const value =
    google.averageRating ??
    (internalReviews.length > 0
      ? internalReviews.reduce((sum, r) => sum + r.rating, 0) / internalReviews.length
      : null);
  const count = google.totalRatings ?? (internalReviews.length > 0 ? internalReviews.length : null);
  return { value, count };
}
