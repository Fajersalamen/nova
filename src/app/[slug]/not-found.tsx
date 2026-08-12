import Link from 'next/link';

export default function RestaurantNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold text-neutral-900">المطعم غير موجود</h1>
      <p className="text-neutral-600">
        الرابط الذي فتحته غير صحيح، أو أن هذا المطعم لم يعد متاحًا على المنصة.
      </p>
      <Link href="/" className="font-medium text-brand-700 underline">
        العودة للصفحة الرئيسية
      </Link>
    </main>
  );
}
