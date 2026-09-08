import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const STATUSES = ["pending", "accepted", "rejected", "ready_for_pickup", "active", "returned", "completed", "cancelled"];

async function updateStatus(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  await supabaseAdmin.from("rentals").update({ status }).eq("id", id);
  revalidatePath("/rentals");
}

export default async function RentalsPage() {
  const { data: rentals } = await supabaseAdmin
    .from("rentals")
    .select(
      "*, items(title), renter:profiles!rentals_renter_id_fkey(full_name), owner:profiles!rentals_owner_id_fkey(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">جميع الحجوزات</h1>
      <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-3 text-right">الغرض</th>
              <th className="p-3 text-right">المستأجر</th>
              <th className="p-3 text-right">المالك</th>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">المجموع</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">تعديل</th>
            </tr>
          </thead>
          <tbody>
            {(rentals ?? []).map((rental) => (
              <tr key={rental.id} className="border-t border-neutral-100">
                <td className="p-3">{(rental as any).items?.title}</td>
                <td className="p-3 text-neutral-500">{(rental as any).renter?.full_name}</td>
                <td className="p-3 text-neutral-500">{(rental as any).owner?.full_name}</td>
                <td className="p-3 text-neutral-500">{rental.start_date} → {rental.end_date}</td>
                <td className="p-3">{rental.total_amount} د.أ</td>
                <td className="p-3">{rental.status}</td>
                <td className="p-3">
                  <form action={updateStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={rental.id} />
                    <select name="status" defaultValue={rental.status} className="rounded-lg border border-neutral-300 px-2 py-1">
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button className="rounded-lg border border-neutral-300 px-3 py-1 hover:bg-neutral-50">حفظ</button>
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
