'use client';

import { useState } from 'react';
import { MediaUploader } from './MediaUploader';
import type { MenuCategory, MenuItem } from '@/types/database.types';

interface Props {
  categories: MenuCategory[];
  item?: MenuItem;
  isPending: boolean;
  fieldErrors: Record<string, string>;
  onSubmit: (formData: FormData) => void;
  onCancel?: () => void;
}

export function MenuItemForm({
  categories,
  item,
  isPending,
  fieldErrors,
  onSubmit,
  onCancel,
}: Props) {
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '');
  const [videoUrl, setVideoUrl] = useState(item?.video_url ?? '');

  return (
    <form action={onSubmit} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />
      <input type="hidden" name="video_url" value={videoUrl} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">اسم الصنف</label>
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={item?.name}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {fieldErrors.name && <p className="text-xs text-red-700">{fieldErrors.name}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">الفئة</label>
          <select
            name="category_id"
            required
            defaultValue={item?.category_id ?? categories[0]?.id ?? ''}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {fieldErrors.category_id && (
            <p className="text-xs text-red-700">{fieldErrors.category_id}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">السعر</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={item?.price}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {fieldErrors.price && <p className="text-xs text-red-700">{fieldErrors.price}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">ترتيب العرض</label>
          <input
            name="display_order"
            type="number"
            defaultValue={item?.display_order ?? 0}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-700">الوصف</label>
        <textarea
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={item?.description ?? ''}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MediaUploader
          kind="image"
          value={imageUrl}
          onChange={setImageUrl}
          label="صورة الصنف"
          hint="تُضغط تلقائيًا وتُحوَّل لصيغة WebP قبل الرفع."
        />
        <MediaUploader
          kind="video"
          value={videoUrl}
          onChange={setVideoUrl}
          label="فيديو قصير (اختياري)"
          hint="يفضَّل 5-10 ثوانٍ، بدون صوت، وأقل من 25 ميجابايت."
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="is_available"
          defaultChecked={item?.is_available ?? true}
          className="h-4 w-4 rounded border-neutral-300"
        />
        متوفر حاليًا (يظهر على الموقع)
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending || categories.length === 0}
          className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? 'جارٍ الحفظ…' : item ? 'حفظ التعديلات' : 'إضافة الصنف'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-neutral-300 px-4 py-2 font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
