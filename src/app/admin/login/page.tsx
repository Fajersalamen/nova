import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata = { title: 'تسجيل الدخول — لوحة التحكم' };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900">لوحة تحكم المطعم</h1>
        <p className="mt-2 text-sm text-neutral-600">سجّل الدخول لإدارة المنيو ومعلومات مطعمك.</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
