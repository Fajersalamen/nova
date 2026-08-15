'use client';

import { useState, useTransition } from 'react';
import { submitReview } from '@/lib/actions/public-reviews';

interface Props {
  restaurantId: string;
}

export function ReviewForm({ restaurantId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitReview(formData);
      if (!result.ok) {
        setError(result.error ?? 'حدث خطأ غير متوقع.');
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        شكرًا لك! سيظهر تقييمك بعد مراجعته.
      </p>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-3xl border border-border bg-white p-8 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <h3 className="text-2xl font-black text-ink">شاركنا رأيك</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="review-name" className="block text-sm font-medium text-neutral-700">
            الاسم
          </label>
          <input
            id="review-name"
            name="customer_name"
            required
            maxLength={80}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="review-rating" className="block text-sm font-medium text-neutral-700">
            التقييم
          </label>
          <select
            id="review-rating"
            name="rating"
            defaultValue="5"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} من 5
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="review-comment" className="block text-sm font-medium text-neutral-700">
          تعليقك (اختياري)
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={3}
          maxLength={1000}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? 'جارٍ الإرسال…' : 'إرسال التقييم'}
      </button>
    </form>
  );
}
