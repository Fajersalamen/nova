'use server';

import { z } from 'zod';
import { createPublicClientOrNull } from '@/lib/supabase/public';
import { reviewSchema } from '@/lib/validation';
import { ACTION_OK, actionError, type ActionResult } from './types';

/**
 * Submitted by anonymous visitors on a restaurant's public page. The RLS
 * policy only permits inserts with is_approved = false, so a submission
 * can never publish itself — an admin has to approve it first.
 */
export async function submitReview(formData: FormData): Promise<ActionResult> {
  const restaurantId = z.string().uuid().safeParse(formData.get('restaurant_id'));
  if (!restaurantId.success) return actionError('مطعم غير صالح');

  const parsed = reviewSchema.safeParse({
    customer_name: formData.get('customer_name'),
    rating: formData.get('rating'),
    comment: formData.get('comment') ?? '',
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.');
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return actionError('تحقق من الحقول المدخلة', fieldErrors);
  }

  const supabase = createPublicClientOrNull();
  if (!supabase) return actionError('تعذّر إرسال التقييم. حاول مرة أخرى.');
  const { error } = await supabase.from('reviews').insert({
    restaurant_id: restaurantId.data,
    customer_name: parsed.data.customer_name,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null,
    is_approved: false,
  });

  if (error) return actionError('تعذّر إرسال التقييم. حاول مرة أخرى.');

  return ACTION_OK;
}
