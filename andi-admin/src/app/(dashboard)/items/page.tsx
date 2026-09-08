import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function toggleHidden(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const current = formData.get("current") === "true";
  await supabaseAdmin.from("items").update({ is_hidden: !current }).eq("id", id);
  revalidatePath("/items");
}

async function deleteItem(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await supabaseAdmin.from("items").delete().eq("id", id);
  revalidatePath("/items");
}

export default async function ItemsPage() {
  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*, profiles!items_owner_id_fkey(full_name), categories(name_ar)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">جميع الأغراض</h1>
      <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">المالك</th>
              <th className="p-3 text-right">الفئة</th>
              <th className="p-3 text-right">السعر</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">مخفي؟</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((item) => (
              <tr key={item.id} className="border-t border-neutral-100">
                <td className="p-3">{item.title}</td>
                <td className="p-3 text-neutral-500">{(item as any).profiles?.full_name}</td>
                <td className="p-3">{(item as any).categories?.name_ar}</td>
                <td className="p-3">{item.price_per_day} د.أ</td>
                <td className="p-3">{item.status}</td>
                <td className="p-3">{item.is_hidden ? "🙈" : "—"}</td>
                <td className="p-3 flex gap-2">
                  <form action={toggleHidden}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="current" value={String(item.is_hidden)} />
                    <button className="rounded-lg border border-neutral-300 px-3 py-1 hover:bg-neutral-50">
                      {item.is_hidden ? "إظهار" : "إخفاء"}
                    </button>
                  </form>
                  <form action={deleteItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="rounded-lg border border-red-200 text-red-600 px-3 py-1 hover:bg-red-50">
                      حذف
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
