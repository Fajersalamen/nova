import { supabaseAdmin } from "@/lib/supabase-admin";

async function getStats() {
  const [{ count: userCount }, { count: itemCount }, { count: rentalCount }] = await Promise.all([
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("items").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("rentals").select("*", { count: "exact", head: true }),
  ]);

  const { data: completedRentals } = await supabaseAdmin
    .from("rentals")
    .select("subtotal, status")
    .eq("status", "completed");

  const gmv = (completedRentals ?? []).reduce((sum, r) => sum + Number(r.subtotal), 0);

  const { data: commissionRows } = await supabaseAdmin
    .from("transactions")
    .select("amount")
    .eq("type", "platform_commission");
  const commission = (commissionRows ?? []).reduce((sum, r) => sum + Number(r.amount), 0);

  const { data: itemsForBreakdown } = await supabaseAdmin
    .from("items")
    .select("categories(name_ar), areas(name_ar)");

  const categoryCounts = new Map<string, number>();
  const areaCounts = new Map<string, number>();
  for (const row of (itemsForBreakdown ?? []) as unknown as { categories: { name_ar: string } | null; areas: { name_ar: string } | null }[]) {
    if (row.categories?.name_ar) categoryCounts.set(row.categories.name_ar, (categoryCounts.get(row.categories.name_ar) ?? 0) + 1);
    if (row.areas?.name_ar) areaCounts.set(row.areas.name_ar, (areaCounts.get(row.areas.name_ar) ?? 0) + 1);
  }

  const topCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topAreas = [...areaCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    userCount: userCount ?? 0,
    itemCount: itemCount ?? 0,
    rentalCount: rentalCount ?? 0,
    gmv,
    commission,
    topCategories,
    topAreas,
  };
}

export default async function DashboardHome() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">نظرة عامة</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="المستخدمون" value={stats.userCount} />
        <StatCard label="الأغراض" value={stats.itemCount} />
        <StatCard label="الحجوزات" value={stats.rentalCount} />
        <StatCard label="GMV (مكتمل)" value={`${stats.gmv.toFixed(2)} د.أ`} />
        <StatCard label="عمولة المنصة" value={`${stats.commission.toFixed(2)} د.أ`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BreakdownCard title="أكثر الفئات نشاطًا" rows={stats.topCategories} />
        <BreakdownCard title="أكثر المناطق نشاطًا" rows={stats.topAreas} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-200 p-5">
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-200 p-5">
      <p className="font-semibold mb-3">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-400">لا توجد بيانات بعد</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(([name, count]) => (
            <li key={name} className="flex justify-between text-sm">
              <span className="text-neutral-500">{count}</span>
              <span>{name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
