import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function toggleVerified(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const current = formData.get("current") === "true";
  await supabaseAdmin.from("profiles").update({ is_verified: !current }).eq("id", id);
  revalidatePath("/users");
}

async function toggleBanned(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const current = formData.get("current") === "true";
  await supabaseAdmin.from("profiles").update({ is_banned: !current }).eq("id", id);
  revalidatePath("/users");
}

export default async function UsersPage() {
  const { data: users } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">المستخدمون</h1>
      <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">الهاتف</th>
              <th className="p-3 text-right">التقييم</th>
              <th className="p-3 text-right">موثّق؟</th>
              <th className="p-3 text-right">محظور؟</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id} className="border-t border-neutral-100">
                <td className="p-3">{user.full_name}</td>
                <td className="p-3 text-neutral-500">{user.phone ?? "—"}</td>
                <td className="p-3">⭐ {user.rating_avg} ({user.rating_count})</td>
                <td className="p-3">{user.is_verified ? "✅" : "—"}</td>
                <td className="p-3">{user.is_banned ? "🚫" : "—"}</td>
                <td className="p-3 flex gap-2">
                  <form action={toggleVerified}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="current" value={String(user.is_verified)} />
                    <button className="rounded-lg border border-neutral-300 px-3 py-1 hover:bg-neutral-50">
                      {user.is_verified ? "إلغاء التوثيق" : "توثيق"}
                    </button>
                  </form>
                  <form action={toggleBanned}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="current" value={String(user.is_banned)} />
                    <button className="rounded-lg border border-red-200 text-red-600 px-3 py-1 hover:bg-red-50">
                      {user.is_banned ? "رفع الحظر" : "حظر"}
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
