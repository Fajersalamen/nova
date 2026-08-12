'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MenuItemForm } from './MenuItemForm';
import {
  createMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  updateMenuItem,
} from '@/lib/actions/menu';
import { formatPrice } from '@/lib/utils';
import type { ActionResult } from '@/lib/actions/types';
import type { MenuCategory, MenuItem } from '@/types/database.types';

interface Props {
  categories: MenuCategory[];
  items: MenuItem[];
}

export function MenuItemManager({ categories, items }: Props) {
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

  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">أصناف المنيو</h2>
          <p className="mt-1 text-sm text-neutral-600">
            أضف الأصناف مع صورها وأسعارها. الأصناف غير المتوفرة تختفي من الموقع دون حذفها.
          </p>
        </div>
        {!isAdding && categories.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
            }}
            className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700"
          >
            + صنف جديد
          </button>
        )}
      </div>

      {categories.length === 0 && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          أضف فئة واحدة على الأقل قبل إضافة الأصناف.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isAdding && (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
          <h3 className="mb-4 font-semibold text-neutral-900">صنف جديد</h3>
          <MenuItemForm
            categories={categories}
            isPending={isPending}
            fieldErrors={fieldErrors}
            onSubmit={(formData) => runAction(createMenuItem, formData)}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      <ul className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200">
        {items.length === 0 && <li className="py-4 text-sm text-neutral-500">لا توجد أصناف بعد.</li>}

        {items.map((item) => (
          <li key={item.id} className="py-4">
            {editingId === item.id ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5">
                <h3 className="mb-4 font-semibold text-neutral-900">تعديل: {item.name}</h3>
                <MenuItemForm
                  categories={categories}
                  item={item}
                  isPending={isPending}
                  fieldErrors={fieldErrors}
                  onSubmit={(formData) => runAction(updateMenuItem, formData)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt=""
                      className="h-14 w-14 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-md bg-neutral-100" />
                  )}
                  <div>
                    <p className="font-medium text-neutral-900">
                      {item.name}
                      {!item.is_available && (
                        <span className="mr-2 rounded bg-neutral-200 px-1.5 py-0.5 text-xs text-neutral-600">
                          معطّل
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {categoryNames.get(item.category_id) ?? '—'} · {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <form action={(formData) => runAction(toggleMenuItemAvailability, formData)}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="is_available" value={String(!item.is_available)} />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-md border border-neutral-300 px-3 py-1.5 transition hover:bg-neutral-100 disabled:opacity-60"
                    >
                      {item.is_available ? 'تعطيل' : 'تفعيل'}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setIsAdding(false);
                    }}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 transition hover:bg-neutral-100"
                  >
                    تعديل
                  </button>

                  <form
                    action={(formData) => {
                      if (!confirm(`حذف "${item.name}" نهائيًا؟`)) return;
                      runAction(deleteMenuItem, formData);
                    }}
                  >
                    <input type="hidden" name="id" value={item.id} />
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
