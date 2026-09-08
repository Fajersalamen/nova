import Link from "next/link";
import { redirect } from "next/navigation";
import { clearAdminSession, isAdminAuthenticated } from "@/lib/auth";

const NAV = [
  { href: "/", label: "نظرة عامة" },
  { href: "/users", label: "المستخدمون" },
  { href: "/items", label: "الأغراض" },
  { href: "/rentals", label: "الحجوزات" },
  { href: "/categories", label: "الفئات" },
  { href: "/reports", label: "البلاغات" },
];

async function logout() {
  "use server";
  await clearAdminSession();
  redirect("/login");
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-l border-neutral-200 bg-white p-4 flex flex-col">
        <div className="mb-6 px-2">
          <p className="text-lg font-bold">عندي</p>
          <p className="text-xs text-neutral-500">لوحة الإدارة</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm hover:bg-neutral-100">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button className="w-full rounded-lg px-3 py-2 text-sm text-right text-red-600 hover:bg-red-50">
            تسجيل الخروج
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
