-- عندي (Andi) — core schema
-- Convention: every table has created_at; mutable tables also get updated_at + a trigger.

create extension if not exists "pgcrypto";

-- ============================================================================
-- Reference data
-- ============================================================================

create table public.areas (
  id serial primary key,
  city text not null default 'عمان',
  name_ar text not null,
  name_en text,
  lat double precision,
  lng double precision,
  sort_order int not null default 0
);

create table public.categories (
  id serial primary key,
  slug text not null unique,
  name_ar text not null,
  name_en text,
  icon text not null,          -- emoji or icon-font key, kept simple for MVP
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.platform_settings (
  id int primary key default 1,
  commission_percent numeric(5,2) not null default 10.00,
  platform_fee_flat numeric(10,2) not null default 1.00,
  min_rental_days int not null default 1,
  max_rental_days int not null default 14,
  constraint singleton check (id = 1)
);
insert into public.platform_settings (id) values (1);

-- ============================================================================
-- Users
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone text unique,
  phone_verified boolean not null default false,
  city text not null default 'عمان',
  area_id int references public.areas(id),
  bio text,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  rentals_as_renter_count int not null default 0,
  rentals_as_owner_count int not null default 0,
  trust_score numeric(5,2) not null default 0,
  is_verified boolean not null default false,
  is_banned boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('phone', 'id_document')),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Items
-- ============================================================================

create table public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id int not null references public.categories(id),
  title text not null,
  description text not null default '',
  price_per_day numeric(10,2) not null check (price_per_day > 0),
  price_per_week numeric(10,2),
  deposit_amount numeric(10,2) not null default 0,
  min_rental_days int not null default 1,
  max_rental_days int not null default 14,
  area_id int not null references public.areas(id),
  approx_lat double precision not null,   -- jittered ~150-300m, never exact
  approx_lng double precision not null,
  status text not null default 'available' check (status in ('available', 'rented', 'paused')),
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  rental_count int not null default 0,
  view_count int not null default 0,
  is_hidden boolean not null default false,   -- admin moderation
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index items_category_idx on public.items (category_id);
create index items_area_idx on public.items (area_id);
create index items_owner_idx on public.items (owner_id);
create index items_status_idx on public.items (status) where status = 'available';

create table public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);
create index item_images_item_idx on public.item_images (item_id);

create table public.item_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  blocked_date date not null,
  reason text not null default 'owner' check (reason in ('owner', 'rental')),
  rental_id uuid,
  unique (item_id, blocked_date)
);
create index item_blocked_dates_item_idx on public.item_blocked_dates (item_id);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  query text,
  category_id int references public.categories(id),
  created_at timestamptz not null default now()
);
create index search_history_user_idx on public.search_history (user_id, created_at desc);

-- ============================================================================
-- Rentals
-- ============================================================================

create table public.rentals (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id),
  renter_id uuid not null references public.profiles(id),
  owner_id uuid not null references public.profiles(id),
  start_date date not null,
  end_date date not null,
  days_count int not null check (days_count > 0),
  price_per_day numeric(10,2) not null,
  subtotal numeric(10,2) not null,
  deposit_amount numeric(10,2) not null default 0,
  platform_fee numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null,
  status text not null default 'pending' check (status in (
    'pending', 'accepted', 'rejected', 'ready_for_pickup',
    'active', 'returned', 'completed', 'cancelled'
  )),
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);
create index rentals_renter_idx on public.rentals (renter_id);
create index rentals_owner_idx on public.rentals (owner_id);
create index rentals_item_idx on public.rentals (item_id);
create index rentals_status_idx on public.rentals (status);

create table public.security_deposits (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  amount numeric(10,2) not null,
  status text not null default 'held' check (status in ('held', 'released', 'claimed')),
  claim_reason text,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  amount numeric(10,2) not null,
  currency text not null default 'JOD',
  provider text not null default 'mock' check (provider in ('mock', 'cliq', 'card', 'wallet')),
  provider_ref text,
  type text not null check (type in ('rental_payment', 'deposit_hold', 'deposit_release', 'refund')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now()
);
create index payments_rental_idx on public.payments (rental_id);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  type text not null check (type in ('owner_payout', 'platform_commission', 'refund')),
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'settled')),
  created_at timestamptz not null default now()
);
create index transactions_rental_idx on public.transactions (rental_id);
create index transactions_user_idx on public.transactions (user_id);

-- ============================================================================
-- Reviews
-- ============================================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  reviewee_id uuid not null references public.profiles(id),
  role text not null check (role in ('renter_to_owner', 'owner_to_renter')),
  rating int not null check (rating between 1 and 5),
  tags text[] not null default '{}',
  comment text,
  created_at timestamptz not null default now(),
  unique (rental_id, role)
);
create index reviews_reviewee_idx on public.reviews (reviewee_id);

-- ============================================================================
-- Chat
-- ============================================================================

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id),
  rental_id uuid references public.rentals(id),
  renter_id uuid not null references public.profiles(id),
  owner_id uuid not null references public.profiles(id),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (item_id, renter_id)
);
create index conversations_renter_idx on public.conversations (renter_id);
create index conversations_owner_idx on public.conversations (owner_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  type text not null default 'text' check (type in ('text', 'image', 'location')),
  content text,
  image_url text,
  lat double precision,
  lng double precision,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- ============================================================================
-- Notifications / Reports / Admin
-- ============================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'new_rental_request', 'rental_accepted', 'rental_rejected', 'pickup_reminder',
    'rental_completed', 'new_message', 'new_review', 'saved_item_available'
  )),
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  target_type text not null check (target_type in ('user', 'item')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);
create index reports_target_idx on public.reports (target_type, target_id);

-- admin_users kept separate from profiles.is_admin for a cleaner audit trail of who
-- was granted admin/moderator and when, without touching the public profile row.
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'moderator' check (role in ('owner', 'admin', 'moderator')),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- updated_at trigger
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.items
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.rentals
  for each row execute function public.set_updated_at();
