'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdminSession } from '@/lib/auth';
import { restaurantSettingsSchema } from '@/lib/validation';
import { ACTION_OK, actionError, type ActionResult } from './types';

export async function updateRestaurantSettings(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const parsed = restaurantSettingsSchema.safeParse({
    name: formData.get('name'),
    phone_whatsapp: formData.get('phone_whatsapp'),
    address: formData.get('address') ?? '',
    google_maps_embed_url: formData.get('google_maps_embed_url') ?? '',
    google_place_id: formData.get('google_place_id') ?? '',
    logo_url: formData.get('logo_url') ?? '',
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.');
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return actionError('تحقق من الحقول المدخلة', fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('restaurants')
    .update({
      name: parsed.data.name,
      phone_whatsapp: parsed.data.phone_whatsapp,
      address: parsed.data.address || null,
      google_maps_embed_url: parsed.data.google_maps_embed_url || null,
      google_place_id: parsed.data.google_place_id || null,
      logo_url: parsed.data.logo_url || null,
    })
    .eq('id', session.restaurant.id);

  if (error) return actionError('تعذّر حفظ الإعدادات.');

  revalidatePath(`/${session.restaurant.slug}`);
  revalidatePath('/admin/settings');
  return ACTION_OK;
}

export async function moderateReview(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const id = z.string().uuid().safeParse(formData.get('id'));
  const approve = formData.get('is_approved') === 'true';
  if (!id.success) return actionError('تقييم غير صالح');

  const supabase = await createClient();
  const { error } = await supabase
    .from('reviews')
    .update({ is_approved: approve })
    .eq('id', id.data)
    .eq('restaurant_id', session.restaurant.id);

  if (error) return actionError('تعذّر تحديث حالة التقييم.');

  revalidatePath(`/${session.restaurant.slug}`);
  revalidatePath('/admin/reviews');
  return ACTION_OK;
}

export async function deleteReview(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const id = z.string().uuid().safeParse(formData.get('id'));
  if (!id.success) return actionError('تقييم غير صالح');

  const supabase = await createClient();
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id.data)
    .eq('restaurant_id', session.restaurant.id);

  if (error) return actionError('تعذّر حذف التقييم.');

  revalidatePath(`/${session.restaurant.slug}`);
  revalidatePath('/admin/reviews');
  return ACTION_OK;
}
