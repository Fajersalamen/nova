import Link from 'next/link';
import { requireAdminSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function AdminOverviewPage() {
  const session = await requireAdminSession();
  const supabase = await createClient();

  const [categoriesCount, itemsCount, unavailableCount, pendingReviewsCount] = await Promise.all([
    supabase
      .from('menu_categories')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', session.restaurant.id),
    supabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', session.restaurant.id),
    supabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', session.restaurant.id)
      .eq('is_available', false),
    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', session.restaurant.id)
      .eq('is_approved', false),
  ]);

  const stats = [
    { label: 'الفئات', value: categoriesCount.count ?? 0, href: '/admin/menu' },
    { label: 'الأصناف', value: itemsCount.count ?? 0, href: '/admin/menu' },
    { label: 'أصناف معطّلة', value: unavailableCount.count ?? 0, href: '/admin/menu' },
    { label: 'تقييمات بانتظار الموافقة', value: pendingReviewsCount.count ?? 0, href: '/admin/reviews' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-brand-300"
          >
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-semibold text-neutral-900">رابط موقعك</h2>
        <p className="mt-2 text-sm text-neutral-600">
          شارك هذا الرابط مع زبائنك — الصفحة تُحدَّث تلقائيًا مع كل تعديل تعمله هنا.
        </p>
        <Link
          href={`/${session.restaurant.slug}`}
          target="_blank"
          className="mt-3 inline-block font-mono text-sm text-brand-700 hover:underline"
        >
          /{session.restaurant.slug}
        </Link>
      </section>
    </div>
  );
}
