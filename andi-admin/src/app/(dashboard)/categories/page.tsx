import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function addCategory(formData: FormData) {
  "use server";
  const slug = formData.get("slug") as string;
  const nameAr = formData.get("name_ar") as string;
  const icon = formData.get("icon") as string;
  if (!slug || !nameAr || !icon) return;
  await supabaseAdmin.from("categories").insert({ slug, name_ar: nameAr, icon, sort_order: 99 });
  revalidatePath("/categories");
}

async function toggleActive(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const current = formData.get("current") === "true";
  await supabaseAdmin.from("categories").update({ is_active: !current }).eq("id", id);
  revalidatePath("/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await supabaseAdmin.from("categories").delete().eq("id", id);
  revalidatePath("/categories");
}

export default async function CategoriesPage() {
  const { data: categories } = await supabaseAdmin.from("categories").select("*").order("sort_order");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">الفئات</h1>

      <form action={addCategory} className="rounded-2xl bg-white border border-neutral-200 p-5 mb-6 flex gap-3 items-end flex-wrap">
        <Field label="المعرّف (slug)" name="slug" />
        <Field label="الاسم بالعربي" name="name_ar" />
        <Field label="أيقونة (emoji)" name="icon" />
        <button className="rounded-lg bg-brand text-white px-4 py-2 h-fit">إضافة</button>
      </form>

      <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-3 text-right">الأيقونة</th>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">مفعّلة؟</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((category) => (
              <tr key={category.id} className="border-t border-neutral-100">
                <td className="p-3 text-xl">{category.icon}</td>
                <td className="p-3">{category.name_ar}</td>
                <td className="p-3">{category.is_active ? "✅" : "—"}</td>
                <td className="p-3 flex gap-2">
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="current" value={String(category.is_active)} />
                    <button className="rounded-lg border border-neutral-300 px-3 py-1 hover:bg-neutral-50">
                      {category.is_active ? "تعطيل" : "تفعيل"}
                    </button>
                  </form>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <button className="rounded-lg border border-red-200 text-red-600 px-3 py-1 hover:bg-red-50">حذف</button>
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

function Field({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-500">{label}</span>
      <input name={name} className="rounded-lg border border-neutral-300 px-3 py-2" required />
    </label>
  );
}
