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
    tagline: formData.get('tagline') ?? '',
    hero_description: formData.get('hero_description') ?? '',
    hours_label: formData.get('hours_label') ?? '',
    has_dine_in: formData.get('has_dine_in') === 'on',
    has_delivery: formData.get('has_delivery') === 'on',
    has_drive_thru: formData.get('has_drive_thru') === 'on',
    about_title: formData.get('about_title') ?? '',
    about_body: formData.get('about_body') ?? '',
    about_image_url: formData.get('about_image_url') ?? '',
    home_cta_heading: formData.get('home_cta_heading') ?? '',
    menu_cta_heading: formData.get('menu_cta_heading') ?? '',
    contact_cta_heading: formData.get('contact_cta_heading') ?? '',
    about_hero_title: formData.get('about_hero_title') ?? '',
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
      tagline: parsed.data.tagline || null,
      hero_description: parsed.data.hero_description || null,
      hours_label: parsed.data.hours_label || null,
      has_dine_in: parsed.data.has_dine_in,
      has_delivery: parsed.data.has_delivery,
      has_drive_thru: parsed.data.has_drive_thru,
      about_title: parsed.data.about_title || null,
      about_body: parsed.data.about_body || null,
      about_image_url: parsed.data.about_image_url || null,
      home_cta_heading: parsed.data.home_cta_heading || null,
      menu_cta_heading: parsed.data.menu_cta_heading || null,
      contact_cta_heading: parsed.data.contact_cta_heading || null,
      about_hero_title: parsed.data.about_hero_title || null,
    })
    .eq('id', session.restaurant.id);

  if (error) return actionError('تعذّر حفظ الإعدادات.');

  revalidatePath(`/${session.restaurant.slug}`, 'layout');
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

  revalidatePath(`/${session.restaurant.slug}`, 'layout');
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

  revalidatePath(`/${session.restaurant.slug}`, 'layout');
  revalidatePath('/admin/reviews');
  return ACTION_OK;
}
