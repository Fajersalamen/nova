'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBranch, deleteBranch, updateBranch } from '@/lib/actions/branches';
import type { ActionResult } from '@/lib/actions/types';
import type { RestaurantBranch } from '@/types/database.types';

interface Props {
  branches: RestaurantBranch[];
}

interface BranchFieldsProps {
  branch?: RestaurantBranch;
}

function BranchFields({ branch }: BranchFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <label className="block text-xs text-neutral-500">اسم الفرع</label>
        <input
          name="name"
          required
          maxLength={120}
          defaultValue={branch?.name}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs text-neutral-500">رقم الهاتف</label>
        <input
          name="phone_whatsapp"
          required
          dir="ltr"
          placeholder="+962791234567"
          defaultValue={branch?.phone_whatsapp}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-left"
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className="block text-xs text-neutral-500">العنوان</label>
        <input
          name="address"
          maxLength={300}
          defaultValue={branch?.address ?? ''}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className="block text-xs text-neutral-500">رابط خريطة جوجل (embed)</label>
        <input
          name="google_maps_embed_url"
          dir="ltr"
          placeholder="https://www.google.com/maps/embed?pb=..."
          defaultValue={branch?.google_maps_embed_url ?? ''}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-left"
        />
      </div>
      <div className="w-28 space-y-1">
        <label className="block text-xs text-neutral-500">الترتيب</label>
        <input
          name="display_order"
          type="number"
          defaultValue={branch?.display_order ?? 0}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
    </div>
  );
}

export function BranchManager({ branches }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  function runAction(action: (fd: FormData) => Promise<ActionResult>, formData: FormData) {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error ?? 'حدث خطأ غير متوقع.');
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setEditingId(null);
      setIsAdding(false);
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">الفروع</h2>
          <p className="mt-1 text-sm text-neutral-600">
            كل فرع بيظهر بقسم &quot;فروعنا&quot; على موقعك، بعنوانه ورقمه وخريطته الخاصة.
          </p>
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
            }}
            className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700"
          >
            + فرع جديد
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isAdding && (
        <form
          action={(formData) => runAction(createBranch, formData)}
          className="mt-6 space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-5"
        >
          <h3 className="font-semibold text-neutral-900">فرع جديد</h3>
          <BranchFields />
          {Object.values(fieldErrors).map((message) => (
            <p key={message} className="text-xs text-red-700">
              {message}
            </p>
          ))}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {isPending ? 'جارٍ الحفظ…' : 'إضافة الفرع'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-md border border-neutral-300 px-4 py-2 font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <ul className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200">
        {branches.length === 0 && !isAdding && (
          <li className="py-4 text-sm text-neutral-500">
            لا توجد فروع إضافية بعد. عنوان ورقم المطعم الأساسي (من صفحة الإعدادات) يظهران دايمًا
            بأعلى الموقع بغض النظر عن الفروع هون.
          </li>
        )}

        {branches.map((branch) => (
          <li key={branch.id} className="py-4">
            {editingId === branch.id ? (
              <form
                action={(formData) => runAction(updateBranch, formData)}
                className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-5"
              >
                <input type="hidden" name="id" value={branch.id} />
                <h3 className="font-semibold text-neutral-900">تعديل: {branch.name}</h3>
                <BranchFields branch={branch} />
                {Object.values(fieldErrors).map((message) => (
                  <p key={message} className="text-xs text-red-700">
                    {message}
                  </p>
                ))}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-md border border-neutral-300 px-4 py-2 font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-neutral-900">{branch.name}</p>
                  <p className="text-xs text-neutral-500">
                    {branch.address ?? '—'} · {branch.phone_whatsapp}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(branch.id);
                      setIsAdding(false);
                    }}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 transition hover:bg-neutral-100"
                  >
                    تعديل
                  </button>
                  <form
                    action={(formData) => {
                      if (!confirm(`حذف فرع "${branch.name}"؟`)) return;
                      runAction(deleteBranch, formData);
                    }}
                  >
                    <input type="hidden" name="id" value={branch.id} />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
