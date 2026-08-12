export default function NoRestaurantPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">حسابك غير مرتبط بمطعم</h1>
      <p className="text-neutral-600">
        تم تسجيل دخولك بنجاح، لكن هذا الحساب غير مربوط بأي مطعم على المنصة بعد. تواصل مع مزوّد
        الخدمة لإتمام الربط.
      </p>
    </main>
  );
}
