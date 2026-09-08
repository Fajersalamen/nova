# خطة النشر — عندي

خطة كاملة من "مشروع على الجهاز" إلى "تطبيق منشور فعليًا". مقسّمة على مراحل، وكل خطوة
معلّم عليها مين ينفذها: **[أنت]** تحتاج حساب/دفعة ما أقدر أعملها بدالك، أو **[أنا]** أقدر
أنفذها بجلسة عمل معك لو عطيتني المعلومات/الصلاحيات اللازمة.

---

## المرحلة 0 — الحسابات المطلوبة (خطوة أولى لازمة قبل أي شي)

| الحساب | التكلفة | ليش لازمه |
| --- | --- | --- |
| Supabase | مجاني للبداية | قاعدة البيانات، Auth، Storage، Realtime |
| Expo (EAS) | مجاني (Build مدفوع لو احتجت أولوية) | بناء التطبيق كملف iOS/Android حقيقي |
| Apple Developer Program | $99/سنة | نشر على App Store — **إلزامي حتى لـ TestFlight** |
| Google Play Console | $25 مرة وحدة | نشر على Google Play |
| مزود SMS (Twilio أو MessageBird) | حسب الاستخدام (~ سنتات لكل رسالة) | إرسال رمز OTP فعلي لأرقام أردنية حقيقية |
| Vercel (أو Cloudflare) | مجاني للبداية | استضافة لوحة الإدارة `andi-admin` |
| دومين (اختياري بالبداية) | ~10-15$/سنة | مثلاً `andi.app` — يمكن تأجيله ويشتغل بدومين Vercel المجاني مؤقتًا |

**[أنت]** أنشئ هاي الحسابات. ما أقدر أنشئها نيابة عنك لأنها تحتاج بيانات دفع وهوية شخصية.

---

## المرحلة 1 — تجهيز Backend (Supabase)

1. **[أنت]** أنشئ مشروع Supabase جديد — اختر منطقة قريبة (Frankfurt/eu-central الأقرب للأردن).
2. **[أنا]** بمجرد ما تعطيني الـ Project URL + service role key (بشكل آمن، مو بالچات — حطهم
   بمتغيرات بيئة)، أقدر أشغّل ملفات الـ migrations بالترتيب:
   ```
   supabase/migrations/0001_schema.sql
   supabase/migrations/0002_rls_policies.sql
   supabase/migrations/0003_functions.sql
   supabase/migrations/0004_storage.sql
   supabase/migrations/0005_realtime.sql
   ```
   (تقدر أيضًا تسوي هذا بنفسك من SQL Editor بلوحة Supabase مباشرة — نفس الملفات، بنفس
   الترتيب، نسخ-لصق وتشغيل).
3. **[أنت أو أنا]** شغّل `supabase/seed/seed.sql` — **بس على مشروع تجريبي/staging**، مو على
   قاعدة الإنتاج الحقيقية (فيه 20 مستخدم وهمي و~50 غرض للعرض، منطقي للتجربة مو للإطلاق
   الحقيقي).
4. **[أنت]** من Authentication → Providers → Phone: فعّل مزود SMS حقيقي (Twilio مثلاً) وحط
   مفاتيحه. بدون هالخطوة، الـ OTP يشتغل بس بوضع اختبار Supabase (أرقام تجريبية محدودة).
5. تأكد إن Storage buckets (`item-images`, `avatars`) انشأوا تلقائيًا من migration 0004 —
   تقدر تتأكد من Storage tab بلوحة Supabase.

---

## المرحلة 2 — تجربة التطبيق محليًا قبل أي بناء رسمي

1. **[أنت]** انسخ `andi/.env.example` إلى `andi/.env` واملأ:
   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```
2. **[أنت]** ثبّت تطبيق **Expo Go** على موبايلك (iOS/Android).
3. **[أنت أو أنا]**:
   ```bash
   cd andi
   npm install
   npx expo start
   ```
   امسح الـ QR بتطبيق Expo Go وجرّب المسار الكامل: تسجيل دخول برقم حقيقي → تصفح → إضافة
   غرض → حجز.
4. **جرّب كل شي قبل ما تروح لخطوة البناء الرسمي** — أي باگ نلقاه هسه أرخص نصلحه من باگ نلقاه
   بعد إرسال البناء لـ Apple/Google.

---

## المرحلة 3 — بناء التطبيق فعليًا (EAS Build)

ملف `andi/eas.json` جاهز فيه 3 بروفايلات: `development` (للتجربة بتطبيق مخصص)،
`preview` (APK مباشر تشاركه بدون متجر)، `production` (البناء النهائي للمتاجر).

1. **[أنت]** سوّي حساب على expo.dev، وسجّل دخول محليًا:
   ```bash
   npx eas login
   npx eas build:configure
   ```
2. **[أنت]** خزّن أسرار Supabase على EAS بدل ما تكون بملف محلي فقط:
   ```bash
   eas secret:create --name andi_supabase_url --value https://xxx.supabase.co
   eas secret:create --name andi_supabase_anon_key --value xxxxx
   ```
3. **بناء تجريبي أول (الأسرع، يعطيك APK تنزّله على أي موبايل أندرويد بدون متجر):**
   ```bash
   eas build --platform android --profile preview
   ```
4. **البناء الرسمي للمتجرين:**
   ```bash
   eas build --platform all --profile production
   ```
   أول مرة، EAS رح يسألك تسوي/تربط:
   - **iOS:** App Store Connect App ID (يحتاج حساب Apple Developer فعّال) — EAS يقدر يدير
     الشهادات (certificates/provisioning profiles) تلقائيًا.
   - **Android:** keystore — خلّي EAS يولّده ويديره (أسهل وأأمن من إدارته يدويًا).

**ملاحظة عن الأيقونة:** حطيت أيقونة placeholder بسيطة (حرف "ع" بلون البراند) في
`andi/assets/` حتى ما يفشل البناء. **[أنت]** قبل الإطلاق الحقيقي، بدّلها بتصميم احترافي —
هاي أول شي يشوفه المستخدم بالمتجر.

---

## المرحلة 4 — رفع التطبيق للمتاجر

### App Store (iOS)

1. **[أنت]** بحساب Apple Developer: أنشئ App بـ App Store Connect (Bundle ID:
   `com.andi.app` — نفسه المكتوب بـ `app.config.js`).
2. **[أنا]** أقدر أرفع البناء تلقائيًا بأمر واحد بعد ما يخلص:
   ```bash
   eas submit --platform ios --profile production
   ```
3. **[أنت]** جهّز بلوحة App Store Connect:
   - وصف التطبيق بالعربي + لقطات شاشة حقيقية (5.5" و6.5" على الأقل)
   - رابط سياسة الخصوصية → `https://<رابط andi-admin بعد نشره>/privacy` (جاهزة، شوف المرحلة 5)
   - تصنيف العمر (Age Rating) — على الأغلب 4+ ما فيه محتوى حساس
   - أول نسخة تروح **TestFlight** للمراجعة الداخلية قبل ما تطلب مراجعة App Store الكاملة

### Google Play (Android)

1. **[أنت]** أنشئ تطبيق جديد بـ Google Play Console.
2. **[أنا]**:
   ```bash
   eas submit --platform android --profile production
   ```
3. **[أنت]** ابدأ بمسار **Internal Testing** (فوري، بدون مراجعة) قبل **Production** — جرّب
   مع 5-10 أشخاص حقيقيين بعمّان قبل الإطلاق العام.

---

## المرحلة 5 — نشر لوحة الإدارة (andi-admin)

الأسهل: **Vercel** (مجاني لحجم كبير، ويدعم Server Actions بدون أي إعداد إضافي).

1. **[أنت]** اربط حساب Vercel بالريبو، واختر `andi-admin` كـ Root Directory عند الاستيراد.
2. **[أنت]** أضف متغيرات البيئة بلوحة Vercel:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ADMIN_PASSWORD=...
   ```
3. Deploy تلقائي عند كل push. صفحات `/privacy` و`/terms` عامة (بدون تسجيل دخول) — هذا
   الرابط تحطه بمتاجر Apple/Google.

**بديل:** لو تفضّل تبقى كل شي على Cloudflare متل مشروع المطاعم بنفس الريبو، نفس نمط
`opennextjs-cloudflare` يشتغل — بس Vercel أسرع للبداية لأنه صفر إعداد.

---

## المرحلة 6 — قبل ما تفتحه لمستخدمين حقيقيين بعمّان

هذا الجزء الأهم — تطبيق يشتغل تقنيًا مش نفس شي إنه جاهز لناس حقيقية تدفع فلوس:

1. **الدفع الحقيقي**: أبدل `MockPaymentProvider` بمزود حقيقي (CliQ عادة أسهل بداية بالأردن).
   البنية جاهزة لهذا (`src/lib/services/payment/`) — التنفيذ نفسه محادثة منفصلة لأنه يحتاج
   اتفاقية مع بنك/CliQ ووصول API حقيقي.
2. **احذف بيانات الـ seed** من مشروع الإنتاج (خليها بس بمشروع staging منفصل للتجربة).
3. **Push notifications حقيقية**: حاليًا الإشعارات تظهر جوا التطبيق بس (real-time)، مو push
   للموبايل وهو مسكر. ربط Expo Push Notifications خطوة تقنية صغيرة نضيفها بعدين.
4. **راجع سياسة الخصوصية والشروط** (`andi-admin/src/app/privacy` و`/terms`) — سويتها
   مسودة واقعية، بس لازم محامي يراجعها قبل الإطلاق الرسمي، خصوصًا لأنكم تتعاملون بفلوس
   وتأمينات بين أشخاص غرباء.
5. **راقب الأخطاء بالإنتاج**: أضف Sentry أو أي أداة مراقبة أخطاء — لسه ما موجودة.

---

## ترتيب مقترح إذا بديت اليوم

1. اليوم: سوّي حساب Supabase + Expo، ابعتلي المفاتيح، نشغّل الـ migrations ونجرب التطبيق
   محليًا بـ Expo Go (مراحل 1-2).
2. خلال أسبوع: `eas build --profile preview` وتوزيع APK على أصدقاء/عائلة للتجربة الحقيقية
   بعمّان.
3. بالتوازي: افتح حساب Apple Developer (يوخذ وقت للموافقة أحيانًا) وGoogle Play.
4. بعد ما تتأكد التجربة كويسة: نشر `andi-admin` (مرحلة 5)، ثم `eas build --profile
   production` + `eas submit` لكل المتجرين (مراحل 3-4).
5. قبل الإعلان العام: مرحلة 6 كاملة (دفع حقيقي، حذف بيانات وهمية، مراجعة قانونية).
