# Nova — Multi-Tenant Restaurant SaaS

منصة تعطي كل مطعم موقعًا عامًا سريعًا (منيو، واتساب، خرائط، تقييمات) ولوحة تحكم خاصة به.
النظام multi-tenant من الأساس: إضافة مطعم جديد = صف جديد في جدول `restaurants` + حساب أدمن
مرتبط به، **بدون أي تعديل على الكود**.

## الستاك

| الطبقة | التقنية |
| --- | --- |
| الواجهة | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| الاستضافة | Cloudflare Workers عبر `@opennextjs/cloudflare` |
| البيانات والمصادقة | Supabase (Postgres + Auth + Row Level Security) |
| الوسائط | Cloudflare R2 + CDN |

## قرارات تقنية

**لماذا ISR بدل SSR؟** صفحة المطعم تُقرأ آلاف المرات وتُعدَّل مرات قليلة أسبوعيًا. مع
`revalidate = 120` تُخدَّم نسخة مخزّنة من الـ Edge بسرعة CDN، وتُحدَّث في الخلفية. التعديلات
من لوحة التحكم لا تنتظر هذه المهلة — كل server action يستدعي `revalidatePath` فورًا.

**لماذا العزل على مستوى قاعدة البيانات؟** كل جدول عليه RLS، وكل عملية كتابة تمر بدالة
`is_restaurant_admin()`. حتى لو وُجد خطأ في كود الواجهة، Postgres نفسه يرفض أي كتابة عبر
المستأجرين. الكود لا يأخذ `restaurant_id` من إدخال المستخدم إطلاقًا — يشتقّه من الجلسة
(`src/lib/auth.ts`).

**لماذا `aws4fetch` بدل AWS SDK؟** حجمه ~1.5 كيلوبايت ومبني على Fetch API فقط، وهو مناسب
لبيئة Workers. الرفع يتم مباشرة من المتصفح إلى R2 عبر presigned URL، فلا يمر أي ملف عبر
خوادمنا.

**لماذا OpenNext بدل `@cloudflare/next-on-pages`؟** الأخير أصبح deprecated رسميًا، ونطاق
الإصدارات المدعومة فيه يجبرك على نسخة Next فيها ثغرة أمنية معروفة (CVE-2025-66478).
`@opennextjs/cloudflare` هو المسار المدعوم حاليًا من Cloudflare، ويشغّل التطبيق بـ Node.js
runtime داخل Workers مع دعم كامل لـ ISR.

## خطوات الإعداد

### 1. Supabase

1. أنشئ مشروعًا جديدًا على [supabase.com](https://supabase.com).
2. طبّق ملفات الـ migrations بالترتيب من **SQL Editor**:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
3. من **Settings → API** انسخ `Project URL` و `anon key` و `service_role key`.

### 2. Cloudflare R2

نحتاج bucket‌ين:

```bash
# وسائط المنيو (صور وفيديو) — يجب أن يكون عامًا
npx wrangler r2 bucket create nova-restaurant-media

# كاش الـ ISR — خاص، اسمه مطابق لما في wrangler.jsonc
npx wrangler r2 bucket create nova-next-cache
```

1. فعّل الوصول العام لـ `nova-restaurant-media` عبر نطاق مخصص أو `r2.dev`.
2. من **R2 → Manage API Tokens** أنشئ توكن بصلاحية Object Read & Write وانسخ المفاتيح.

### 3. متغيرات البيئة

```bash
cp .env.example .env.local
```

ثم املأ القيم. عند النشر، أضف نفس المفاتيح كـ secrets:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put REVALIDATE_SECRET
```

أما المتغيرات العامة (`NEXT_PUBLIC_*`) فتُضبط من لوحة Cloudflare في
**Settings → Variables**، أو في قسم `vars` داخل `wrangler.jsonc`.

### 4. التشغيل محليًا

```bash
npm install
npm run dev
```

### 5. النشر على Cloudflare

```bash
npm run cf:preview   # تشغيل نسخة Workers محليًا للتجربة
npm run cf:deploy    # نشر
```

للنشر التلقائي عند كل push، اربط المستودع من **Workers & Pages → Create → Import a
repository** واضبط:

- **Build command:** `npm run cf:build`
- **Deploy command:** `npx wrangler deploy`

## إضافة مطعم جديد

نفّذ من Supabase SQL Editor (باستخدام صلاحية service role):

```sql
-- 1. أنشئ المطعم
insert into public.restaurants (slug, name, phone_whatsapp, address)
values ('my-restaurant', 'مطعمي', '+962791234567', 'عمّان، الأردن')
returning id;

-- 2. أنشئ حساب الأدمن من Authentication → Users في لوحة Supabase،
--    ثم اربطه بالمطعم (استبدل المعرّفات بالقيم الحقيقية):
insert into public.admin_users (id, restaurant_id, role)
values ('<auth-user-uuid>', '<restaurant-uuid>', 'owner');
```

الموقع يصبح متاحًا فورًا على `/my-restaurant`، ويستطيع صاحبه الدخول على `/admin`.

## إعدادات Cloudflare الموصى بها بعد النشر

هذه تُضبط من لوحة Cloudflare وليست جزءًا من الكود:

- **Cache Rules:** خزّن مسارات المطاعم العامة (`/*` عدا `/admin*` و `/api/*`) على الـ Edge.
- **Rate Limiting:** حدّ المحاولات على `/admin/login` (مثلًا 10 طلبات/دقيقة لكل IP) لمنع
  هجمات تخمين كلمات المرور، وعلى `/api/*` لحماية نقاط الرفع.
- **Bot Fight Mode:** فعّله لتقليل الرسائل المزعجة على نموذج التقييمات العام.

## بنية المشروع

```
src/
├── app/
│   ├── [slug]/              الموقع العام لكل مطعم (edge + ISR)
│   ├── admin/
│   │   ├── login/           تسجيل الدخول
│   │   └── (dashboard)/     لوحة التحكم المحمية
│   └── api/                 presign الرفع + revalidate
├── components/
│   ├── public/              مكونات الموقع العام
│   └── admin/               مكونات لوحة التحكم
├── lib/
│   ├── supabase/            عملاء المتصفح/السيرفر/الـ middleware
│   ├── actions/             server actions مع تحقق zod
│   ├── auth.ts              اشتقاق المطعم من الجلسة
│   └── r2.ts                توقيع روابط الرفع
└── types/database.types.ts  أنواع مطابقة للمخطط

supabase/migrations/         مخطط قاعدة البيانات + سياسات RLS
```
