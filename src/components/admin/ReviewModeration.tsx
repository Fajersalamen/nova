'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StarRating } from '@/components/public/StarRating';
import { deleteReview, moderateReview } from '@/lib/actions/restaurant';
import type { ActionResult } from '@/lib/actions/types';
import type { Review } from '@/types/database.types';

interface Props {
  reviews: Review[];
  usingGoogleReviews: boolean;
}

export function ReviewModeration({ reviews, usingGoogleReviews }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function runAction(action: (fd: FormData) => Promise<ActionResult>, formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error ?? 'حدث خطأ غير متوقع.');
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-bold text-neutral-900">التقييمات</h2>
      <p className="mt-1 text-sm text-neutral-600">
        التقييمات الجديدة لا تظهر على الموقع حتى توافق عليها.
      </p>

      {usingGoogleReviews && (
        <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
          مطعمك مربوط بتقييمات جوجل حاليًا، لذلك موقعك يعرض تقييمات جوجل بدل هذه التقييمات
          الداخلية. لإظهارها، احذف Google Place ID من صفحة الإعدادات.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200">
        {reviews.length === 0 && (
          <li className="py-4 text-sm text-neutral-500">لا توجد تقييمات بعد.</li>
        )}

        {reviews.map((review) => (
          <li key={review.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <StarRating rating={review.rating} />
                <span className="font-medium text-neutral-900">{review.customer_name}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    review.is_approved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {review.is_approved ? 'منشور' : 'بانتظار الموافقة'}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed text-neutral-700">{review.comment}</p>
              )}
              <p className="text-xs text-neutral-500">
                {new Date(review.created_at).toLocaleDateString('ar')}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <form action={(formData) => runAction(moderateReview, formData)}>
                <input type="hidden" name="id" value={review.id} />
                <input type="hidden" name="is_approved" value={String(!review.is_approved)} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 transition hover:bg-neutral-100 disabled:opacity-60"
                >
                  {review.is_approved ? 'إخفاء' : 'موافقة'}
                </button>
              </form>

              <form
                action={(formData) => {
                  if (!confirm('حذف هذا التقييم نهائيًا؟')) return;
                  runAction(deleteReview, formData);
                }}
              >
                <input type="hidden" name="id" value={review.id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                >
                  حذف
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
