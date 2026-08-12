-- ============================================================================
-- Nova Restaurant SaaS — core schema
--
-- Multi-tenant design: every tenant-owned table carries a restaurant_id
-- foreign key. Tenant isolation is enforced at the database layer via Row
-- Level Security (see 0002_rls_policies.sql) rather than trusted to
-- application code, so a bug in the frontend or API can never leak one
-- restaurant's data into another's.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- restaurants: one row per tenant.
-- ----------------------------------------------------------------------------
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  phone_whatsapp text not null,
  address text,
  google_maps_embed_url text,
  google_place_id text,
  logo_url text,
  theme_settings jsonb not null default '{}'::jsonb,
  subscription_status text not null default 'active'
    check (subscription_status in ('active', 'trialing', 'past_due', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.restaurants.slug is 'URL segment for the public site: /[slug]';
comment on column public.restaurants.google_place_id is 'If set, public reviews are pulled from Google Places instead of the internal reviews table.';

create index if not exists restaurants_slug_idx on public.restaurants (slug);

-- ----------------------------------------------------------------------------
-- admin_users: links a Supabase Auth user to the single restaurant they
-- administer. One row per admin account.
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

create index if not exists admin_users_restaurant_id_idx on public.admin_users (restaurant_id);

-- ----------------------------------------------------------------------------
-- menu_categories
-- ----------------------------------------------------------------------------
create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists menu_categories_restaurant_id_idx on public.menu_categories (restaurant_id, display_order);

-- ----------------------------------------------------------------------------
-- menu_items
-- ----------------------------------------------------------------------------
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid not null references public.menu_categories (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  video_url text,
  is_available boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_restaurant_id_idx on public.menu_items (restaurant_id, category_id, display_order);

-- ----------------------------------------------------------------------------
-- reviews: internal review system (used when restaurants.google_place_id
-- is not set). Reviews are moderated: hidden from the public site until an
-- admin approves them.
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_restaurant_id_idx on public.reviews (restaurant_id, is_approved);

-- ----------------------------------------------------------------------------
-- updated_at maintenance
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.restaurants;
create trigger set_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.menu_items;
create trigger set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();
