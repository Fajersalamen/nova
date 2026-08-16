-- ============================================================================
-- فحم ولحم — تعبئة المنيو الكامل من صور القائمة المرسلة
--
-- كل الأصناف والأسعار منقولة حرفيًا من صور المنيو التي أرسلتها. الصور
-- نفسها (البروشور) ما بتنضاف — كل صنف بينضاف بدون صورة حاليًا، وتقدر
-- ترفع صورة المنتج الحقيقية له لاحقًا من لوحة التحكم (تعديل الصنف).
--
-- طريقة التطبيق: روح على Supabase → SQL Editor → الصق هذا الملف كامل
-- واضغط Run. آمن التشغيل أكثر من مرة (ما بيكرر الفئات أو الأصناف لو
-- أعدت تشغيله بالغلط).
-- ============================================================================

do $$
declare
  v_restaurant_id uuid;
  v_cat_wings uuid;
  v_cat_sandwiches uuid;
  v_cat_chicken uuid;
  v_cat_burger uuid;
  v_cat_rice uuid;
  v_cat_extras uuid;
begin
  select id into v_restaurant_id from public.restaurants where slug = 'fahem-wa-lahem';
  if v_restaurant_id is null then
    raise exception 'لم يتم العثور على مطعم بالـ slug: fahem-wa-lahem';
  end if;

  -- --------------------------------------------------------------------
  -- الفئات (get-or-create حتى ما تتكرر لو الملف انشغل أكثر من مرة)
  -- --------------------------------------------------------------------
  select id into v_cat_wings from public.menu_categories where restaurant_id = v_restaurant_id and name = 'ونجز';
  if v_cat_wings is null then
    insert into public.menu_categories (restaurant_id, name, display_order)
    values (v_restaurant_id, 'ونجز', 10) returning id into v_cat_wings;
  end if;

  select id into v_cat_sandwiches from public.menu_categories where restaurant_id = v_restaurant_id and name = 'ساندويشات';
  if v_cat_sandwiches is null then
    insert into public.menu_categories (restaurant_id, name, display_order)
    values (v_restaurant_id, 'ساندويشات', 20) returning id into v_cat_sandwiches;
  end if;

  select id into v_cat_chicken from public.menu_categories where restaurant_id = v_restaurant_id and name = 'وجبات الدجاج والكرسبي';
  if v_cat_chicken is null then
    insert into public.menu_categories (restaurant_id, name, display_order)
    values (v_restaurant_id, 'وجبات الدجاج والكرسبي', 30) returning id into v_cat_chicken;
  end if;

  select id into v_cat_burger from public.menu_categories where restaurant_id = v_restaurant_id and name = 'برجر';
  if v_cat_burger is null then
    insert into public.menu_categories (restaurant_id, name, display_order)
    values (v_restaurant_id, 'برجر', 40) returning id into v_cat_burger;
  end if;

  select id into v_cat_rice from public.menu_categories where restaurant_id = v_restaurant_id and name = 'أرز بخاري ودجاج مشوي';
  if v_cat_rice is null then
    insert into public.menu_categories (restaurant_id, name, display_order)
    values (v_restaurant_id, 'أرز بخاري ودجاج مشوي', 50) returning id into v_cat_rice;
  end if;

  select id into v_cat_extras from public.menu_categories where restaurant_id = v_restaurant_id and name = 'إضافات';
  if v_cat_extras is null then
    insert into public.menu_categories (restaurant_id, name, display_order)
    values (v_restaurant_id, 'إضافات', 60) returning id into v_cat_extras;
  end if;

  -- --------------------------------------------------------------------
  -- ونجز — يمكن اختيار الصوص: هني ماسترد، بافلو، سويت تشيلي، باربكيو، سادة
  -- --------------------------------------------------------------------
  if not exists (select 1 from public.menu_items where restaurant_id = v_restaurant_id and name = 'وجبة ونجز 16 قطعة') then
    insert into public.menu_items (restaurant_id, category_id, name, description, price, display_order) values
      (v_restaurant_id, v_cat_wings, 'وجبة ونجز 16 قطعة', 'مع ماتركس 250مل وبطاطا 200غم. يمكن اختيار الصوص.', 3.55, 0),
      (v_restaurant_id, v_cat_wings, 'وجبة ونجز 10 قطع', 'مع ماتركس 250مل وبطاطا 200غم. يمكن اختيار الصوص.', 2.50, 1),
      (v_restaurant_id, v_cat_wings, 'وجبة ونجز 6 قطع', 'مع ماتركس 250مل وبطاطا 200غم. يمكن اختيار الصوص.', 1.95, 2),
      (v_restaurant_id, v_cat_wings, '16 قطعة ونجز', 'بدون مشروب أو بطاطا. يمكن اختيار الصوص.', 2.75, 3),
      (v_restaurant_id, v_cat_wings, '10 قطع ونجز', 'بدون مشروب أو بطاطا. يمكن اختيار الصوص.', 1.75, 4),
      (v_restaurant_id, v_cat_wings, '6 قطع ونجز', 'بدون مشروب أو بطاطا. يمكن اختيار الصوص.', 1.20, 5),
      (v_restaurant_id, v_cat_wings, 'وجبة بونس 16 قطعة', 'مع ماتركس 250مل وبطاطا 200غم. يمكن اختيار الصوص.', 3.60, 6),
      (v_restaurant_id, v_cat_wings, 'وجبة بونس 10 قطع', 'مع ماتركس 250مل وبطاطا 200غم. يمكن اختيار الصوص.', 2.55, 7),
      (v_restaurant_id, v_cat_wings, 'وجبة بونس 6 قطع', 'مع ماتركس 250مل وبطاطا 200غم. يمكن اختيار الصوص.', 2.00, 8),
      (v_restaurant_id, v_cat_wings, '16 قطعة بونس', 'بدون مشروب أو بطاطا. يمكن اختيار الصوص.', 2.80, 9),
      (v_restaurant_id, v_cat_wings, '10 قطع بونس', 'بدون مشروب أو بطاطا. يمكن اختيار الصوص.', 1.80, 10),
      (v_restaurant_id, v_cat_wings, '6 قطع بونس', 'بدون مشروب أو بطاطا. يمكن اختيار الصوص.', 1.25, 11);
  end if;

  -- --------------------------------------------------------------------
  -- ساندويشات — إضافة جبنة على العادي والسوبر مقابل 10 قروش إضافية
  -- --------------------------------------------------------------------
  if not exists (select 1 from public.menu_items where restaurant_id = v_restaurant_id and name = 'شاورما سوبر') then
    insert into public.menu_items (restaurant_id, category_id, name, description, price, display_order) values
      (v_restaurant_id, v_cat_sandwiches, 'شاورما سوبر', '120 غرام. إضافة جبنة 10 قروش.', 1.25, 0),
      (v_restaurant_id, v_cat_sandwiches, 'شاورما عادي', '60 غرام. إضافة جبنة 10 قروش.', 0.65, 1),
      (v_restaurant_id, v_cat_sandwiches, 'سوبر زنجر', '150 غرام — دجاج مسحب، جبنة، ذرة، كاتشب، مخلل، فش، مايونيز.', 1.30, 2),
      (v_restaurant_id, v_cat_sandwiches, 'شاورما فرنسي', '100 غرام.', 1.30, 3),
      (v_restaurant_id, v_cat_sandwiches, 'همر', '200 غرام.', 1.75, 4),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة الزنجر', '150 غرام — مع مخلل، بطاطا 200غم، ماتركس 250مل.', 2.25, 5),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة شاورما الفرنسي', '100 غرام — مع مخلل، بطاطا 200غم، صوص شاورما.', 2.10, 6),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة الهمر', '200 غرام — مع بطاطا 200غم، ماتركس 250مل، وسلطة 100غم.', 2.90, 7),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة شاورما عادي', '120 غرام — بطاطا 200غم، مخلل، خضار، صوص، كاتشب. إضافة جبنة 10 قروش.', 2.00, 8),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة شاورما سوبر', '180 غرام — بطاطا 200غم، مخلل، خضار، صوص، كاتشب. إضافة جبنة 20 قرش.', 2.75, 9),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة شاورما دبل', '240 غرام — بطاطا 200غم، مخلل، خضار، صوص، كاتشب. إضافة جبنة 20 قرش.', 3.40, 10),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة شاورما تربل', '360 غرام — بطاطا 200غم، مخلل، خضار، صوص، كاتشب. إضافة جبنة 30 قرش.', 4.60, 11),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة شاورما عائلي (1)', '6 ساندويشات 120غم — بطاطا 200غم، صحن سيرفس، صوص، كاتشب. إضافة جبنة 60 قرش.', 10.25, 12),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة شاورما عائلي (2)', '8 ساندويشات 120غم — بطاطا 400غم، صحن سيرفس، صوص، كاتشب. إضافة جبنة 80 قرش.', 13.50, 13),
      (v_restaurant_id, v_cat_sandwiches, 'وجبة شاورما عائلي (3)', '10 ساندويشات 180غم — بطاطا 400غم×2 و200غم، صحن سيرفس، صوص، كاتشب. إضافة جبنة دينار.', 16.85, 14);
  end if;

  -- --------------------------------------------------------------------
  -- وجبات الدجاج والكرسبي
  -- --------------------------------------------------------------------
  if not exists (select 1 from public.menu_items where restaurant_id = v_restaurant_id and name = 'كرسبي (1)') then
    insert into public.menu_items (restaurant_id, category_id, name, description, price, display_order) values
      (v_restaurant_id, v_cat_chicken, 'كرسبي (1)', '5 قطع كرسبي (250غم) — بطاطا 200غم، مثومة عادي، خبز، ماتركس 250مل، كاتشب، سلطة كولسلو 100غم.', 3.00, 0),
      (v_restaurant_id, v_cat_chicken, 'كرسبي (2)', '8 قطع كرسبي (400غم) — بطاطا 200غم، مثومة حار وعادي، خبز، ماتركس 250مل، كاتشب، سلطة كولسلو 100غم.', 4.00, 1),
      (v_restaurant_id, v_cat_chicken, 'نصف دجاجة بروستد', '4 قطع دجاج — بطاطا 200غم، مثومة 50غم، خبز.', 2.70, 2),
      (v_restaurant_id, v_cat_chicken, 'دجاجة بروستد كاملة', '8 قطع دجاج — بطاطا 200غم، مثومتين 50غم، خبزتين.', 4.70, 3),
      (v_restaurant_id, v_cat_chicken, 'وجبة رقم (1)', 'قطعتين دجاج — بطاطا 200غم، مثومة، خبز، ماتركس 250مل، كاتشب، سلطة كولسلو 100غم.', 2.25, 4),
      (v_restaurant_id, v_cat_chicken, 'وجبة رقم (2)', '3 قطع دجاج — بطاطا 200غم، مثومة، خبز، ماتركس 250مل، كاتشب، سلطة كولسلو 100غم.', 3.00, 5),
      (v_restaurant_id, v_cat_chicken, 'وجبة رقم (3)', '4 قطع دجاج — بطاطا 200غم، مثومتين، خبزتين، ماتركس 250مل، كاتشب، سلطة كولسلو 100غم.', 3.65, 6),
      (v_restaurant_id, v_cat_chicken, 'وجبة رقم (4)', '8 قطع (دجاجة كاملة) — بطاطا 400غم×2، مثومتين، خبز×3، ماتركس 250مل×2، كاتشب×2، سلطة كولسلو 100غم.', 7.00, 7),
      (v_restaurant_id, v_cat_chicken, 'وجبة رقم (5)', '12 قطعة (دجاجة ونصف) — بطاطا 400غم×2، ماتركس 2 لتر، خبز×5، كاتشب×4، سلطة كولسلو 100غم.', 10.75, 8),
      (v_restaurant_id, v_cat_chicken, 'وجبة رقم (6)', '16 قطعة (دجاجتين) — بطاطا 400غم×2، ماتركس 2 لتر، خبز×6، كاتشب×4، سلطة كولسلو 100غم.', 14.20, 9),
      (v_restaurant_id, v_cat_chicken, 'وجبة رقم (7)', '20 قطعة (دجاجتين ونصف) — بطاطا 400غم×2، ماتركس 2 لتر، خبز×8، كاتشب×5، سلطة كولسلو 100غم.', 17.50, 10),
      (v_restaurant_id, v_cat_chicken, 'وجبة رقم (8)', '24 قطعة (3 دجاجات) — بطاطا 400غم×2، ماتركس 2 لتر، خبز×10، كاتشب×8، سلطة كولسلو 100غم.', 20.50, 11);
  end if;

  -- --------------------------------------------------------------------
  -- برجر — هدية خاصة للأطفال مع كل وجبة
  -- --------------------------------------------------------------------
  if not exists (select 1 from public.menu_items where restaurant_id = v_restaurant_id and name = 'برجر الباربكيو') then
    insert into public.menu_items (restaurant_id, category_id, name, description, price, display_order) values
      (v_restaurant_id, v_cat_burger, 'وجبة برجر للأطفال', 'ساندويتش برجر صدر دجاج 100غم، عصير 250مل، بطاطا 200غم.', 1.95, 0),
      (v_restaurant_id, v_cat_burger, 'برجر الباربكيو', 'ساندويتش صدر دجاج 180غم بصوص الباربكيو.', 1.85, 1),
      (v_restaurant_id, v_cat_burger, 'وجبة برجر الباربكيو', '180غم — مع بطاطا 200غم وعلبة صوص باربكيو.', 2.80, 2),
      (v_restaurant_id, v_cat_burger, 'برجر سبايسي كرنش', 'ساندويتش صدر دجاج 180غم بصوص السبايسي كرنش.', 1.85, 3),
      (v_restaurant_id, v_cat_burger, 'وجبة برجر سبايسي كرنش', '180غم — مع بطاطا 200غم وعلبة صوص سبايسي كرنش.', 2.80, 4),
      (v_restaurant_id, v_cat_burger, 'برجر تريند', 'ساندويتش صدر دجاج 180غم بصوص التريند.', 1.85, 5),
      (v_restaurant_id, v_cat_burger, 'وجبة برجر تريند', '180غم — مع بطاطا 200غم وعلبة صوص تريند.', 2.80, 6),
      (v_restaurant_id, v_cat_burger, 'برجر هني ماسترد', 'ساندويتش صدر دجاج 180غم بصوص الهني ماسترد.', 1.85, 7),
      (v_restaurant_id, v_cat_burger, 'وجبة برجر هني ماسترد', '180غم — مع بطاطا 200غم وعلبة صوص هني ماسترد.', 2.80, 8);
  end if;

  -- --------------------------------------------------------------------
  -- أرز بخاري ودجاج مشوي
  -- --------------------------------------------------------------------
  if not exists (select 1 from public.menu_items where restaurant_id = v_restaurant_id and name = 'دجاجة مشوية سادة') then
    insert into public.menu_items (restaurant_id, category_id, name, description, price, display_order) values
      (v_restaurant_id, v_cat_rice, 'سدر أرز بخاري كبير', '3 كيلو — يكفي حوالي 5 أشخاص، مع 5 علب صوص.', 4.00, 0),
      (v_restaurant_id, v_cat_rice, 'سدر أرز بخاري وسط', '2 كيلو — يكفي حوالي 3 أشخاص، مع 3 علب صوص.', 3.25, 1),
      (v_restaurant_id, v_cat_rice, 'سدر أرز بخاري صغير', '1 كيلو — يكفي شخصين، مع علبتي صوص.', 2.25, 2),
      (v_restaurant_id, v_cat_rice, 'علبة أرز بخاري سادة', '300 غرام مع علبة صوص.', 1.00, 3),
      (v_restaurant_id, v_cat_rice, 'وجبة البخاري', 'نص دجاجة شواية مع 500 غرام أرز بخاري وعلبة صوص.', 2.75, 4),
      (v_restaurant_id, v_cat_rice, 'دجاجة مشوية سادة', 'دجاجة كاملة — بطاطا 200غم، مخلل، خبز، مثومة حار.', 4.20, 5),
      (v_restaurant_id, v_cat_rice, 'نص دجاجة مشوية سادة', 'بطاطا 200غم، مخلل، خبز، مثومة.', 2.25, 6);
  end if;

  -- --------------------------------------------------------------------
  -- إضافات
  -- --------------------------------------------------------------------
  if not exists (select 1 from public.menu_items where restaurant_id = v_restaurant_id and name = 'علبة بطاطا صغير') then
    insert into public.menu_items (restaurant_id, category_id, name, description, price, display_order) values
      (v_restaurant_id, v_cat_extras, 'علبة بطاطا صغير', '200 غرام.', 0.50, 0),
      (v_restaurant_id, v_cat_extras, 'علبة بطاطا كبير', '400 غرام.', 1.00, 1),
      (v_restaurant_id, v_cat_extras, 'علبة مثومة', '50 مل.', 0.15, 2),
      (v_restaurant_id, v_cat_extras, 'علبة مخلل', null, 0.15, 3),
      (v_restaurant_id, v_cat_extras, 'عصير صغير', '250 مل.', 0.20, 4),
      (v_restaurant_id, v_cat_extras, 'علبة سلطة كولسلو', '100 غرام.', 0.30, 5),
      (v_restaurant_id, v_cat_extras, 'ماتركس 250مل', null, 0.30, 6),
      (v_restaurant_id, v_cat_extras, 'ماتركس 2 لتر', null, 1.00, 7);
  end if;

end $$;
