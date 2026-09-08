export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto p-8 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">سياسة الخصوصية — عندي</h1>
      <p className="text-sm text-neutral-500 mb-8">آخر تحديث: {new Date().toLocaleDateString("ar-JO")}</p>

      <Section title="المعلومات اللي بنجمعها">
        <ul className="list-disc pr-5 space-y-1">
          <li>رقم هاتفك (لتسجيل الدخول والتحقق عبر رمز OTP)</li>
          <li>اسمك وصورتك الشخصية (اختياري)</li>
          <li>المدينة والمنطقة اللي حددتها</li>
          <li>موقعك التقريبي (لعرض الأغراض القريبة منك — لا نخزّن عنوانك الدقيق)</li>
          <li>صور الأغراض اللي تعرضها للإيجار</li>
          <li>سجل الاستئجارات والرسائل داخل التطبيق والتقييمات</li>
        </ul>
      </Section>

      <Section title="كيف بنستخدم معلوماتك">
        <p>
          نستخدم معلوماتك لتشغيل الخدمة الأساسية: عرض الأغراض القريبة منك، تنفيذ عمليات
          الاستئجار، التواصل بين المستأجر والمالك، وحساب التقييمات. ما نبيع معلوماتك لأي طرف
          ثالث لأغراض تسويقية.
        </p>
      </Section>

      <Section title="مين يقدر يشوف معلوماتك">
        <p>
          اسمك وصورتك وتقييمك تظهر للمستخدمين الآخرين عند تصفح أغراضك أو ملفك الشخصي. رقم
          هاتفك ما يظهر لأي مستخدم آخر مباشرة — التواصل يصير عبر المحادثة داخل التطبيق. موقعك
          الدقيق ما يظهر لأحد؛ فقط المنطقة والمسافة التقريبية.
        </p>
      </Section>

      <Section title="الدفع">
        <p>
          نظام الدفع حاليًا في مرحلة تجريبية (Mock) لأغراض الاختبار ولا يتم خصم مبالغ حقيقية.
          عند تفعيل الدفع الفعلي (CliQ أو بطاقات بنكية) سنحدّث هذه السياسة لتوضيح كيف تتم
          معالجة معلومات الدفع عبر مزود الدفع.
        </p>
      </Section>

      <Section title="حقوقك">
        <p>
          تقدر تطلب حذف حسابك ومعلوماتك بالتواصل معنا على البريد أدناه. رح نحتفظ فقط بالسجلات
          اللي يتطلبها القانون (مثل سجلات معاملات مالية) للمدة المطلوبة قانونيًا.
        </p>
      </Section>

      <Section title="تواصل معنا">
        <p>لأي استفسار حول الخصوصية: privacy@andi.app</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="font-semibold mb-2">{title}</h2>
      <div className="text-neutral-700 text-sm">{children}</div>
    </section>
  );
}
