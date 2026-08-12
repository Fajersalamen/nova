'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, deleteCategory, updateCategory } from '@/lib/actions/menu';
import type { MenuCategory } from '@/types/database.types';

interface Props {
  categories: MenuCategory[];
}

export function CategoryManager({ categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function runAction(action: (fd: FormData) => Promise<{ ok: boolean; error?: string }>, formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error ?? 'حدث خطأ غير متوقع.');
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-bold text-neutral-900">فئات المنيو</h2>
      <p className="mt-1 text-sm text-neutral-600">
        الفئات تحدد ترتيب عرض المنيو على موقعك (مثال: مقبلات، أطباق رئيسية، حلويات).
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={(formData) => runAction(createCategory, formData)}
        className="mt-5 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 space-y-1">
          <label htmlFor="new-category-name" className="block text-sm font-medium text-neutral-700">
            اسم الفئة
          </label>
          <input
            id="new-category-name"
            name="name"
            required
            maxLength={80}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="w-28 space-y-1">
          <label htmlFor="new-category-order" className="block text-sm font-medium text-neutral-700">
            الترتيب
          </label>
          <input
            id="new-category-order"
            name="display_order"
            type="number"
            defaultValue={categories.length}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          إضافة فئة
        </button>
      </form>

      <ul className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200">
        {categories.length === 0 && (
          <li className="py-4 text-sm text-neutral-500">لا توجد فئات بعد.</li>
        )}

        {categories.map((category) => (
          <li key={category.id} className="py-3">
            {editingId === category.id ? (
              <form
                action={(formData) => runAction(updateCategory, formData)}
                className="flex flex-wrap items-end gap-3"
              >
                <input type="hidden" name="id" value={category.id} />
                <div className="flex-1 space-y-1">
                  <label className="block text-xs text-neutral-500">الاسم</label>
                  <input
                    name="name"
                    defaultValue={category.name}
                    required
                    maxLength={80}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2"
                  />
                </div>
                <div className="w-28 space-y-1">
                  <label className="block text-xs text-neutral-500">الترتيب</label>
                  <input
                    name="display_order"
                    type="number"
                    defaultValue={category.display_order}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                >
                  إلغاء
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-neutral-900">{category.name}</p>
                  <p className="text-xs text-neutral-500">ترتيب العرض: {category.display_order}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setEditingId(category.id)}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 transition hover:bg-neutral-100"
                  >
                    تعديل
                  </button>
                  <form
                    action={(formData) => {
                      if (
                        !confirm('حذف الفئة سيحذف كل الأصناف بداخلها. هل أنت متأكد؟')
                      ) {
                        return;
                      }
                      runAction(deleteCategory, formData);
                    }}
                  >
                    <input type="hidden" name="id" value={category.id} />
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
