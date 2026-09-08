import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function updateReportStatus(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  await supabaseAdmin.from("reports").update({ status }).eq("id", id);
  revalidatePath("/reports");
}

export default async function ReportsPage() {
  const { data: reports } = await supabaseAdmin
    .from("reports")
    .select("*, reporter:profiles!reports_reporter_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">البلاغات</h1>
      <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="p-3 text-right">النوع</th>
              <th className="p-3 text-right">المبلّغ</th>
              <th className="p-3 text-right">السبب</th>
              <th className="p-3 text-right">التفاصيل</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">تعديل</th>
            </tr>
          </thead>
          <tbody>
            {(reports ?? []).map((report) => (
              <tr key={report.id} className="border-t border-neutral-100 align-top">
                <td className="p-3">{report.target_type === "item" ? "غرض" : "مستخدم"}</td>
                <td className="p-3 text-neutral-500">{(report as any).reporter?.full_name}</td>
                <td className="p-3">{report.reason}</td>
                <td className="p-3 text-neutral-500 max-w-xs">{report.details}</td>
                <td className="p-3">{report.status}</td>
                <td className="p-3">
                  <form action={updateReportStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={report.id} />
                    <select name="status" defaultValue={report.status} className="rounded-lg border border-neutral-300 px-2 py-1">
                      <option value="pending">pending</option>
                      <option value="reviewed">reviewed</option>
                      <option value="resolved">resolved</option>
                      <option value="dismissed">dismissed</option>
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
