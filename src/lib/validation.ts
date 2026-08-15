import { z } from 'zod';

export const menuCategorySchema = z.object({
  name: z.string().trim().min(1, 'الاسم مطلوب').max(80),
  display_order: z.coerce.number().int().default(0),
});

export const menuItemSchema = z.object({
  category_id: z.string().uuid('اختر فئة'),
  name: z.string().trim().min(1, 'الاسم مطلوب').max(120),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  price: z.coerce.number().positive('السعر يجب أن يكون رقمًا موجبًا'),
  image_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
  is_available: z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
  tag: z.string().trim().max(40).optional().or(z.literal('')),
  is_featured: z.coerce.boolean().default(false),
});

export const restaurantSettingsSchema = z.object({
  name: z.string().trim().min(1, 'اسم المطعم مطلوب').max(120),
  phone_whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/, 'رقم واتساب غير صحيح (مثال: +962791234567)'),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  google_maps_embed_url: z
    .string()
    .trim()
    .url('رابط غير صحيح')
    .optional()
    .or(z.literal('')),
  google_place_id: z.string().trim().max(200).optional().or(z.literal('')),
  logo_url: z.string().url().optional().or(z.literal('')),
  tagline: z.string().trim().max(120).optional().or(z.literal('')),
  hero_description: z.string().trim().max(300).optional().or(z.literal('')),
  hours_label: z.string().trim().max(80).optional().or(z.literal('')),
  has_dine_in: z.coerce.boolean().default(true),
  has_delivery: z.coerce.boolean().default(false),
  has_drive_thru: z.coerce.boolean().default(false),
  about_title: z.string().trim().max(120).optional().or(z.literal('')),
  about_body: z.string().trim().max(4000).optional().or(z.literal('')),
  about_image_url: z.string().url().optional().or(z.literal('')),
});

export const branchSchema = z.object({
  name: z.string().trim().min(1, 'اسم الفرع مطلوب').max(120),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  phone_whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/, 'رقم غير صحيح (مثال: +962791234567)'),
  google_maps_embed_url: z
    .string()
    .trim()
    .url('رابط غير صحيح')
    .optional()
    .or(z.literal('')),
  display_order: z.coerce.number().int().default(0),
});

export const reviewSchema = z.object({
  customer_name: z.string().trim().min(1, 'الاسم مطلوب').max(80),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal('')),
});

export type MenuCategoryInput = z.infer<typeof menuCategorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type BranchInput = z.infer<typeof branchSchema>;
export type RestaurantSettingsInput = z.infer<typeof restaurantSettingsSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
