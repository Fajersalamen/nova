'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdminSession } from '@/lib/auth';
import { menuCategorySchema, menuItemSchema } from '@/lib/validation';
import { ACTION_OK, actionError, type ActionResult } from './types';

function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

// The restaurant's public page is cached; purge it as soon as the menu
// changes so admins see their edit live instead of waiting out the ISR
// window.
function refreshPublicPage(slug: string) {
  revalidatePath(`/${slug}`);
  revalidatePath('/admin/menu');
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const parsed = menuCategorySchema.safeParse({
    name: formData.get('name'),
    display_order: formData.get('display_order') ?? 0,
  });
  if (!parsed.success) {
    return actionError('تحقق من الحقول المدخلة', collectFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.from('menu_categories').insert({
    restaurant_id: session.restaurant.id,
    name: parsed.data.name,
    display_order: parsed.data.display_order,
  });

  if (error) return actionError('تعذّر إضافة الفئة. حاول مرة أخرى.');

  refreshPublicPage(session.restaurant.slug);
  return ACTION_OK;
}

export async function updateCategory(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const id = z.string().uuid().safeParse(formData.get('id'));
  if (!id.success) return actionError('فئة غير صالحة');

  const parsed = menuCategorySchema.safeParse({
    name: formData.get('name'),
    display_order: formData.get('display_order') ?? 0,
  });
  if (!parsed.success) {
    return actionError('تحقق من الحقول المدخلة', collectFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('menu_categories')
    .update({ name: parsed.data.name, display_order: parsed.data.display_order })
    .eq('id', id.data)
    // Redundant with RLS by design: scoping the query means a wrong id
    // matches zero rows instead of relying solely on the policy.
    .eq('restaurant_id', session.restaurant.id);

  if (error) return actionError('تعذّر تعديل الفئة.');

  refreshPublicPage(session.restaurant.slug);
  return ACTION_OK;
}

export async function deleteCategory(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const id = z.string().uuid().safeParse(formData.get('id'));
  if (!id.success) return actionError('فئة غير صالحة');

  const supabase = await createClient();
  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', id.data)
    .eq('restaurant_id', session.restaurant.id);

  if (error) return actionError('تعذّر حذف الفئة.');

  refreshPublicPage(session.restaurant.slug);
  return ACTION_OK;
}

function parseMenuItemForm(formData: FormData) {
  return menuItemSchema.safeParse({
    category_id: formData.get('category_id'),
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    price: formData.get('price'),
    image_url: formData.get('image_url') ?? '',
    video_url: formData.get('video_url') ?? '',
    is_available: formData.get('is_available') === 'on' || formData.get('is_available') === 'true',
    display_order: formData.get('display_order') ?? 0,
  });
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const parsed = parseMenuItemForm(formData);
  if (!parsed.success) {
    return actionError('تحقق من الحقول المدخلة', collectFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.from('menu_items').insert({
    restaurant_id: session.restaurant.id,
    category_id: parsed.data.category_id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    price: parsed.data.price,
    image_url: parsed.data.image_url || null,
    video_url: parsed.data.video_url || null,
    is_available: parsed.data.is_available,
    display_order: parsed.data.display_order,
  });

  if (error) return actionError('تعذّر إضافة الصنف. حاول مرة أخرى.');

  refreshPublicPage(session.restaurant.slug);
  return ACTION_OK;
}

export async function updateMenuItem(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const id = z.string().uuid().safeParse(formData.get('id'));
  if (!id.success) return actionError('صنف غير صالح');

  const parsed = parseMenuItemForm(formData);
  if (!parsed.success) {
    return actionError('تحقق من الحقول المدخلة', collectFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('menu_items')
    .update({
      category_id: parsed.data.category_id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      image_url: parsed.data.image_url || null,
      video_url: parsed.data.video_url || null,
      is_available: parsed.data.is_available,
      display_order: parsed.data.display_order,
    })
    .eq('id', id.data)
    .eq('restaurant_id', session.restaurant.id);

  if (error) return actionError('تعذّر تعديل الصنف.');

  refreshPublicPage(session.restaurant.slug);
  return ACTION_OK;
}

export async function toggleMenuItemAvailability(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const id = z.string().uuid().safeParse(formData.get('id'));
  const isAvailable = formData.get('is_available') === 'true';
  if (!id.success) return actionError('صنف غير صالح');

  const supabase = await createClient();
  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: isAvailable })
    .eq('id', id.data)
    .eq('restaurant_id', session.restaurant.id);

  if (error) return actionError('تعذّر تحديث حالة الصنف.');

  refreshPublicPage(session.restaurant.slug);
  return ACTION_OK;
}

export async function deleteMenuItem(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const id = z.string().uuid().safeParse(formData.get('id'));
  if (!id.success) return actionError('صنف غير صالح');

  const supabase = await createClient();
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id.data)
    .eq('restaurant_id', session.restaurant.id);

  if (error) return actionError('تعذّر حذف الصنف.');

  refreshPublicPage(session.restaurant.slug);
  return ACTION_OK;
}
