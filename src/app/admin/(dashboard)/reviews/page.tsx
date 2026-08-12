import { requireAdminSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReviewModeration } from '@/components/admin/ReviewModeration';
import type { Review } from '@/types/database.types';

export default async function AdminReviewsPage() {
  const session = await requireAdminSession();
  const supabase = await createClient();

  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('restaurant_id', session.restaurant.id)
    .order('created_at', { ascending: false });

  return (
    <ReviewModeration
      reviews={(data ?? []) as Review[]}
      usingGoogleReviews={Boolean(session.restaurant.google_place_id)}
    />
  );
}
