'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdminSession } from '@/lib/auth';
import { branchSchema } from '@/lib/validation';
import { ACTION_OK, actionError, type ActionResult } from './types';

function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function parseBranchForm(formData: FormData) {
  return branchSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address') ?? '',
    phone_whatsapp: formData.get('phone_whatsapp'),
    google_maps_embed_url: formData.get('google_maps_embed_url') ?? '',
    display_order: formData.get('display_order') ?? 0,
  });
}

export async function createBranch(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const parsed = parseBranchForm(formData);
  if (!parsed.success) {
    return actionError('تحقق من الحقول المدخلة', collectFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.from('restaurant_branches').insert({
    restaurant_id: session.restaurant.id,
    name: parsed.data.name,
    address: parsed.data.address || null,
    phone_whatsapp: parsed.data.phone_whatsapp,
    google_maps_embed_url: parsed.data.google_maps_embed_url || null,
    display_order: parsed.data.display_order,
  });

  if (error) return actionError('تعذّر إضافة الفرع. حاول مرة أخرى.');

  revalidatePath(`/${session.restaurant.slug}`, 'layout');
  revalidatePath('/admin/branches');
  return ACTION_OK;
}

export async function updateBranch(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const id = z.string().uuid().safeParse(formData.get('id'));
  if (!id.success) return actionError('فرع غير صالح');

  const parsed = parseBranchForm(formData);
  if (!parsed.success) {
    return actionError('تحقق من الحقول المدخلة', collectFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('restaurant_branches')
    .update({
      name: parsed.data.name,
      address: parsed.data.address || null,
      phone_whatsapp: parsed.data.phone_whatsapp,
      google_maps_embed_url: parsed.data.google_maps_embed_url || null,
      display_order: parsed.data.display_order,
    })
    .eq('id', id.data)
    .eq('restaurant_id', session.restaurant.id);

  if (error) return actionError('تعذّر تعديل الفرع.');

  revalidatePath(`/${session.restaurant.slug}`, 'layout');
  revalidatePath('/admin/branches');
  return ACTION_OK;
}

export async function deleteBranch(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();

  const id = z.string().uuid().safeParse(formData.get('id'));
  if (!id.success) return actionError('فرع غير صالح');

  const supabase = await createClient();
  const { error } = await supabase
    .from('restaurant_branches')
    .delete()
    .eq('id', id.data)
    .eq('restaurant_id', session.restaurant.id);

  if (error) return actionError('تعذّر حذف الفرع.');

  revalidatePath(`/${session.restaurant.slug}`, 'layout');
  revalidatePath('/admin/branches');
  return ACTION_OK;
}
