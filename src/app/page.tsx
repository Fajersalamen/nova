import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Nova</h1>
        <p className="mt-4 text-lg text-neutral-600">
          منصة مواقع مطاعم جاهزة. كل مطعم يحصل على صفحة عامة سريعة تعرض المنيو، زر واتساب مباشر،
          خريطة الموقع، والتقييمات — مع لوحة تحكم خاصة لإدارة كل ذلك.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="font-semibold text-neutral-900">للزوار</h2>
        <p className="mt-2 text-sm text-neutral-600">
          افتح موقع أي مطعم عبر الرابط المخصص له:{' '}
          <code className="rounded bg-white px-1.5 py-0.5 text-neutral-800">/اسم-المطعم</code>
        </p>
      </div>

      <div>
        <Link
          href="/admin"
          className="inline-flex rounded-md bg-brand-600 px-5 py-3 font-medium text-white transition hover:bg-brand-700"
        >
          دخول أصحاب المطاعم
        </Link>
      </div>
    </main>
  );
}
