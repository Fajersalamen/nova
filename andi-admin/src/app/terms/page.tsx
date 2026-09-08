export default function Terms() {
  return (
    <main className="max-w-2xl mx-auto p-8 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">شروط الاستخدام — عندي</h1>
      <p className="text-sm text-neutral-500 mb-8">آخر تحديث: {new Date().toLocaleDateString("ar-JO")}</p>

      <Section title="طبيعة الخدمة">
        <p>
          عندي منصة تربط بين أشخاص يريدون تأجير أغراضهم غير المستخدمة وأشخاص يحتاجون
          استئجارها لفترة محددة. عندي وسيط بين الطرفين وليست طرفًا في اتفاقية الإيجار نفسها —
          المسؤولية عن حالة الغرض وصحة الوصف تقع على عاتق المالك، والمسؤولية عن الاستخدام
          السليم وإعادة الغرض بالحالة المتفق عليها تقع على عاتق المستأجر.
        </p>
      </Section>

      <Section title="الحسابات">
        <p>
          يجب أن يكون عمرك 18 سنة فأكثر لإنشاء حساب. أنت مسؤول عن دقة المعلومات اللي تقدمها
          وعن الحفاظ على أمان حسابك.
        </p>
      </Section>

      <Section title="التأمين والمبالغ">
        <p>
          مبلغ التأمين المذكور في كل غرض يُحجز عند تأكيد الحجز ويُرجّع للمستأجر بعد إعادة
          الغرض بحالة سليمة، إلا إذا أبلغ المالك عن ضرر موثّق. عمولة المنصة تُخصم من مبلغ
          المالك عند اكتمال عملية الإيجار.
        </p>
      </Section>

      <Section title="السلوك المقبول">
        <ul className="list-disc pr-5 space-y-1">
          <li>ممنوع عرض أغراض مخالفة للقانون أو خطيرة</li>
          <li>ممنوع تقديم معلومات كاذبة عن حالة الغرض</li>
          <li>ممنوع مضايقة أو إساءة معاملة الطرف الآخر</li>
          <li>أي انتهاك قد يؤدي لتعليق أو حظر الحساب</li>
        </ul>
      </Section>

      <Section title="النزاعات">
        <p>
          في حال وجود خلاف بين المستأجر والمالك (مثل ضرر بالغرض أو تأخير بالإرجاع)، يمكن رفع
          بلاغ عبر التطبيق وسيقوم فريق عندي بمراجعته والتوسط لحل مناسب.
        </p>
      </Section>

      <Section title="تواصل معنا">
        <p>لأي استفسار: support@andi.app</p>
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
