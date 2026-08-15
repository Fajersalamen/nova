-- ============================================================================
-- Nova Restaurant SaaS — richer public-site content
--
-- The public site's hero, services strip, and About page need copy and
-- facts beyond the original core fields (name/address/phone/menu). All new
-- columns are nullable and opt-in: a restaurant that hasn't filled them in
-- yet just gets those sections omitted from its site, never a fabricated
-- default. has_dine_in defaults to true since it's the one operational
-- fact almost every physical restaurant shares; delivery and drive-thru
-- default false since they're the exception, not the rule.
-- ============================================================================

alter table public.restaurants
  add column if not exists tagline text,
  add column if not exists hero_description text,
  add column if not exists hours_label text,
  add column if not exists has_dine_in boolean not null default true,
  add column if not exists has_delivery boolean not null default false,
  add column if not exists has_drive_thru boolean not null default false,
  add column if not exists about_title text,
  add column if not exists about_body text,
  add column if not exists about_image_url text;

-- Per-item highlight badge (e.g. "الأكثر طلبًا", "حار") and a flag for
-- picking the home page's "highlights" grid without guessing from order.
alter table public.menu_items
  add column if not exists tag text,
  add column if not exists is_featured boolean not null default false;
