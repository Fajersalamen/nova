'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MediaUploader } from './MediaUploader';
import { updateRestaurantSettings } from '@/lib/actions/restaurant';
import type { Restaurant } from '@/types/database.types';

interface Props {
  restaurant: Restaurant;
}

export function RestaurantSettingsForm({ restaurant }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setFieldErrors({});
    setSaved(false);
    startTransition(async () => {
      const result = await updateRestaurantSettings(formData);
      if (!result.ok) {
        setError(result.error ?? 'حدث خطأ غير متوقع.');
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-bold text-neutral-900">إعدادات المطعم</h2>
      <p className="mt-1 text-sm text-neutral-600">
        هذه المعلومات تظهر مباشرة على صفحة مطعمك العامة.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          تم حفظ التعديلات.
        </p>
      )}

      <form action={handleSubmit} className="mt-6 space-y-5">
        <input type="hidden" name="logo_url" value={logoUrl} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700">اسم المطعم</label>
            <input
              name="name"
              required
              maxLength={120}
              defaultValue={restaurant.name}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {fieldErrors.name && <p className="text-xs text-red-700">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700">رقم واتساب</label>
            <input
              name="phone_whatsapp"
              required
              dir="ltr"
              placeholder="+962791234567"
              defaultValue={restaurant.phone_whatsapp}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-left outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <p className="text-xs text-neutral-500">بصيغة دولية مع رمز الدولة.</p>
            {fieldErrors.phone_whatsapp && (
              <p className="text-xs text-red-700">{fieldErrors.phone_whatsapp}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">العنوان</label>
          <input
            name="address"
            maxLength={300}
            defaultValue={restaurant.address ?? ''}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">
            رابط خريطة جوجل (embed)
          </label>
          <input
            name="google_maps_embed_url"
            dir="ltr"
            defaultValue={restaurant.google_maps_embed_url ?? ''}
            placeholder="https://www.google.com/maps/embed?pb=..."
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-left outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <p className="text-xs text-neutral-500">
            من خرائط جوجل: مشاركة ← تضمين خريطة ← انسخ الرابط الموجود داخل خاصية src.
          </p>
          {fieldErrors.google_maps_embed_url && (
            <p className="text-xs text-red-700">{fieldErrors.google_maps_embed_url}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">
            Google Place ID (اختياري)
          </label>
          <input
            name="google_place_id"
            dir="ltr"
            defaultValue={restaurant.google_place_id ?? ''}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-left outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <p className="text-xs text-neutral-500">
            عند تعبئته، تُعرض تقييمات جوجل الحقيقية بدل نظام التقييمات الداخلي.
          </p>
        </div>

        <MediaUploader kind="image" value={logoUrl} onChange={setLogoUrl} label="شعار المطعم" />

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? 'جارٍ الحفظ…' : 'حفظ الإعدادات'}
        </button>
      </form>
    </section>
  );
}
