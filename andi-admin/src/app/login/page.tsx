import { redirect } from "next/navigation";
import { setAdminSession } from "@/lib/auth";

async function login(formData: FormData) {
  "use server";
  const password = formData.get("password");
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect("/login?error=1");
  }
  await setAdminSession();
  redirect("/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form action={login} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-neutral-200">
        <h1 className="text-xl font-bold mb-1">عندي — لوحة الإدارة</h1>
        <p className="text-sm text-neutral-500 mb-6">للفريق الداخلي فقط</p>
        <input
          type="password"
          name="password"
          placeholder="كلمة المرور"
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 mb-3 text-right"
          autoFocus
        />
        {error ? <p className="text-red-600 text-sm mb-3">كلمة المرور غير صحيحة</p> : null}
        <button className="w-full rounded-lg bg-brand text-white py-3 font-semibold" type="submit">
          دخول
        </button>
      </form>
    </main>
  );
}
