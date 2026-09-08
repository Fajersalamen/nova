-- عندي (Andi) — demo seed data.
-- Run AFTER 0001-0004 migrations, on a fresh/dev Supabase project only.
-- Creates 9 Amman areas, 10 categories, 20 demo auth users (phone-based,
-- so the auto-profile trigger fires), and ~50 varied items with images.
-- Demo users are for browsing/demo purposes only — they cannot be logged
-- into from the app (no real OTP will match their placeholder phone).

begin;

-- ============================================================================
-- Areas (Amman)
-- ============================================================================
insert into public.areas (name_ar, name_en, lat, lng, sort_order) values
  ('الجبيهة', 'Jubeiha', 32.0089, 35.8726, 1),
  ('شفا بدران', 'Shafa Badran', 32.0333, 35.8833, 2),
  ('خلدا', 'Khalda', 31.9682, 35.8437, 3),
  ('صويلح', 'Sweileh', 32.0142, 35.8534, 4),
  ('الجامعة', 'Al Jamea', 32.0175, 35.8716, 5),
  ('المدينة الرياضية', 'Sports City', 31.9821, 35.9059, 6),
  ('عبدون', 'Abdoun', 31.9498, 35.8703, 7),
  ('الصويفية', 'Sweifieh', 31.9553, 35.8598, 8),
  ('تلاع العلي', 'Tla Al Ali', 31.9847, 35.8555, 9)
on conflict do nothing;

-- ============================================================================
-- Categories
-- ============================================================================
insert into public.categories (slug, name_ar, name_en, icon, sort_order) values
  ('tools', 'أدوات', 'Tools', '🔨', 1),
  ('camping', 'تخييم', 'Camping', '🏕️', 2),
  ('photography', 'تصوير', 'Photography', '📷', 3),
  ('parties', 'حفلات', 'Parties', '🎉', 4),
  ('home', 'منزل', 'Home', '🏠', 5),
  ('cars', 'سيارات', 'Cars', '🚗', 6),
  ('sports', 'رياضة', 'Sports', '🏋️', 7),
  ('games', 'ألعاب', 'Games', '🎮', 8),
  ('electronics', 'إلكترونيات', 'Electronics', '💻', 9),
  ('other', 'أخرى', 'Other', '✨', 10)
on conflict do nothing;

-- ============================================================================
-- Demo users (auth.users insert fires the handle_new_user trigger, which
-- creates the matching profiles row automatically).
-- ============================================================================
create temporary table _demo_users (idx int primary key, id uuid, area_id int);

do $$
declare
  v_names text[] := array[
    'محمد أحمد','سارة خالد','عمر ياسين','لينا فارس','خالد سامي','رنا عبدالله',
    'يزن حمدان','ديما نصر','حسام قاسم','نور الدين','ملك عيسى','فادي غنيم',
    'هبة الزعبي','طارق سلامة','ريم شاهين','باسل عودة','جود منصور','كريم درويش',
    'ياسمين حداد','عدنان طوقان'
  ];
  v_id uuid;
  v_area_id int;
  i int;
begin
  for i in 1..20 loop
    v_id := gen_random_uuid();
    select id into v_area_id from public.areas order by id offset ((i - 1) % 9) limit 1;

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, phone, phone_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      null, '',
      null, '+9627' || (80000000 + i)::text, now() - (i || ' days')::interval,
      '', '', '', '',
      '{"provider":"phone","providers":["phone"]}'::jsonb,
      jsonb_build_object('full_name', v_names[i]),
      now() - ((200 - i * 5) || ' days')::interval, now(),
      false, false
    );

    insert into _demo_users (idx, id, area_id) values (i, v_id, v_area_id);
  end loop;
end $$;

update public.profiles p set
  area_id = d.area_id,
  bio = 'عضو نشط في عندي',
  rating_avg = round((3.8 + random() * 1.2)::numeric, 2),
  rating_count = (5 + floor(random() * 40))::int,
  is_verified = (random() > 0.35)
from _demo_users d
where p.id = d.id;

-- ============================================================================
-- Items (~50, spread across all categories/areas/owners)
-- ============================================================================
with items_data (owner_idx, category_slug, area_name, title, description, price_per_day, price_per_week, deposit_amount) as (
  values
  (1,'tools','الجبيهة','دريل Bosch Professional','دريل بحالة ممتازة، مناسب للخشب والحديد، مع بطاريتين وشاحن.',3,18,10),
  (2,'tools','شفا بدران','سلم ألمنيوم 4 أمتار','سلم قوي وخفيف، مناسب لأعمال الصيانة والدهان.',2,12,5),
  (3,'tools','خلدا','مفك كهربائي Makita','طقم كامل مع رؤوس متنوعة.',2.5,15,8),
  (4,'tools','صويلح','منشار كهربائي دائري','مناسب لقص الخشب والألواح بدقة.',4,24,15),
  (5,'tools','الجامعة','جلاخة زاوية Bosch','للقص والتلميع، مع أقراص إضافية.',3,18,10),
  (6,'camping','المدينة الرياضية','خيمة 6 أشخاص','خيمة مقاومة للماء، سهلة التركيب، مناسبة للرحلات العائلية.',5,30,15),
  (7,'camping','عبدون','كيس نوم شتوي','دافئ ومريح، يتحمل درجات حرارة منخفضة.',2,12,5),
  (8,'camping','الصويفية','موقد غاز تخييم','موقد محمول مع أسطوانة غاز إضافية.',2,12,5),
  (9,'camping','تلاع العلي','طاولة وكراسي تخييم قابلة للطي','طقم كامل لـ 4 أشخاص.',3,18,10),
  (10,'camping','الجبيهة','فانوس LED للتخييم','إضاءة قوية تدوم طويلًا، شحن USB.',1.5,9,3),
  (11,'photography','شفا بدران','كاميرا Canon EOS 200D','مع عدسة 18-55mm وحقيبة حمل.',10,60,50),
  (12,'photography','خلدا','جهاز عرض (بروجكتر) Epson','مناسب للعروض التقديمية والأفلام.',8,48,30),
  (13,'photography','صويلح','ستاند إضاءة استوديو','طقم إضاءة كامل مع مظلات عاكسة.',6,36,20),
  (14,'photography','الجامعة','درون DJI Mini','تصوير جوي بجودة 4K، سهل الاستخدام.',15,90,80),
  (15,'photography','المدينة الرياضية','مايكروفون لافالييه لاسلكي','جودة صوت احترافية للفيديوهات.',4,24,10),
  (16,'parties','عبدون','آلة فقاعات صابون','مثالية لحفلات الأطفال.',3,18,5),
  (17,'parties','الصويفية','مكبر صوت بلوتوث كبير','صوت قوي يكفي لحفلة في الحديقة.',6,36,20),
  (18,'parties','تلاع العلي','طاولة حلويات خشبية مزينة','تصميم أنيق لحفلات أعياد الميلاد.',7,42,15),
  (19,'parties','الجبيهة','آلة تيراكوتا (سموكي) للحفلات','إضافة أجواء مميزة للتصوير في الحفلات.',5,30,15),
  (20,'parties','شفا بدران','طقم إضاءة ديكور LED','متنوع الألوان، تحكم عن بعد.',4,24,10),
  (1,'home','خلدا','مكنسة كهربائية بخار','تنظيف عميق للسجاد والأرضيات.',4,24,10),
  (2,'home','صويلح','آلة خياطة منزلية','بحالة جيدة جدًا، مناسبة للتفصيل البسيط.',3,18,10),
  (3,'home','الجامعة','مكواة بخار عمودية','مناسبة للستائر والملابس الحساسة.',2,12,5),
  (4,'home','المدينة الرياضية','خلاط عجين كبير KitchenAid','مثالي للمناسبات والخبز بكميات كبيرة.',5,30,15),
  (5,'home','عبدون','سخان مياه محمول للحفلات الخارجية','عملي للرحلات والحدائق.',3,18,10),
  (6,'cars','الصويفية','شاحن بطارية سيارة','مناسب لجميع أنواع السيارات.',2,12,10),
  (7,'cars','تلاع العلي','ونش سيارة (كريك) هيدروليكي','قوي وآمن للاستخدام المنزلي.',3,18,15),
  (8,'cars','الجبيهة','مضخة هواء كهربائية للإطارات','سريعة وسهلة الاستخدام.',1.5,9,5),
  (9,'cars','شفا بدران','طقم أدوات سيارة كامل','مفكات ومفاتيح متنوعة بحقيبة منظمة.',2.5,15,10),
  (10,'cars','خلدا','جهاز غسيل سيارات بالضغط','ينظف السيارة بعمق في وقت قصير.',4,24,15),
  (11,'sports','صويلح','دراجة هوائية جبلية','مقاس متوسط، بحالة ممتازة.',5,30,20),
  (12,'sports','الجامعة','طقم أوزان حديد (دمبل)','من 2 كيلو إلى 10 كيلو.',3,18,15),
  (13,'sports','المدينة الرياضية','مضرب تنس احترافي','مع كرات إضافية.',2,12,10),
  (14,'sports','عبدون','لوح تزلج (سكيت بورد)','مناسب للمبتدئين والمحترفين.',2,12,5),
  (15,'sports','الصويفية','خيمة ملاكمة (كيس ملاكمة)','معلق مع قفازات.',3,18,10),
  (16,'games','تلاع العلي','جهاز PlayStation 5','مع يدين تحكم ولعبتين.',10,60,50),
  (17,'games','الجبيهة','طاولة بلياردو صغيرة','مناسبة للمنزل، قابلة للطي.',6,36,25),
  (18,'games','شفا بدران','جهاز Nintendo Switch','مع ألعاب متنوعة للعائلة.',7,42,30),
  (19,'games','خلدا','طاولة تنس طاولة قابلة للطي','مقاس قياسي مع مضربين.',5,30,15),
  (20,'games','صويلح','جهاز VR (واقع افتراضي)','تجربة ألعاب غامرة، سهل الإعداد.',8,48,40),
  (1,'electronics','الجامعة','لابتوب Dell للتصميم','مواصفات جيدة، مناسب للأعمال والدراسة.',8,48,60),
  (2,'electronics','المدينة الرياضية','آلة طباعة صور فورية','ممتعة للحفلات والمناسبات.',4,24,15),
  (3,'electronics','عبدون','سبيكر كاريوكي مع مايكروفونين','مثالي لسهرات العائلة.',5,30,20),
  (4,'electronics','الصويفية','شاشة عرض محمولة 32 بوصة','جودة صورة ممتازة للأفلام والألعاب.',6,36,25),
  (5,'electronics','تلاع العلي','راوتر واي فاي محمول 4G','إنترنت أينما ذهبت.',3,18,15),
  (6,'other','الجبيهة','آلة قهوة إسبريسو','لتحضير قهوة احترافية في البيت.',4,24,15),
  (7,'other','شفا بدران','طاولة كي (كواليتي) قابلة للطي','عملية وخفيفة الوزن.',1.5,9,5),
  (8,'other','خلدا','جهاز تنقية هواء','مناسب للمساحات المتوسطة.',3,18,10),
  (9,'other','صويلح','عربة أطفال قابلة للطي','خفيفة وسهلة النقل، بحالة ممتازة.',3,18,15),
  (10,'other','الجامعة','كرسي هزاز خارجي','مريح للحدائق والشرفات.',2,12,10)
),
inserted as (
  insert into public.items (
    owner_id, category_id, title, description, price_per_day, price_per_week,
    deposit_amount, area_id, approx_lat, approx_lng, min_rental_days, max_rental_days,
    rating_avg, rating_count, rental_count
  )
  select
    du.id, c.id, d.title, d.description, d.price_per_day, d.price_per_week, d.deposit_amount,
    a.id, a.lat + (random() - 0.5) * 0.01, a.lng + (random() - 0.5) * 0.01,
    1, 14,
    round((3.6 + random() * 1.4)::numeric, 2), floor(random() * 30)::int, floor(random() * 15)::int
  from items_data d
  join _demo_users du on du.idx = d.owner_idx
  join public.categories c on c.slug = d.category_slug
  join public.areas a on a.name_ar = d.area_name
  returning id
)
insert into public.item_images (item_id, url, sort_order)
select id, 'https://picsum.photos/seed/andi-' || id || '/800/600', 0 from inserted;

commit;
