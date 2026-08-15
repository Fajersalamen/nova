-- ============================================================================
-- Nova Restaurant SaaS — editable page headings
--
-- The CTA band wording on each page ("جعان؟ اتصل فينا.", etc.) and the
-- About page's top heading ("قصتنا") were hardcoded. Admins asked to be
-- able to edit any text on the site themselves, so these move into the
-- restaurants row like every other piece of copy — nullable, falling
-- back to the original default wording in the app when left empty.
-- ============================================================================

alter table public.restaurants
  add column if not exists home_cta_heading text,
  add column if not exists menu_cta_heading text,
  add column if not exists contact_cta_heading text,
  add column if not exists about_hero_title text;
