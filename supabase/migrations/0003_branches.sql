-- ============================================================================
-- Nova Restaurant SaaS — multi-branch support
--
-- A restaurant can operate more than one physical location under the same
-- site (same menu, same brand). restaurants keeps its own address/phone/map
-- columns as the primary location so existing single-location restaurants
-- need no migration of their own data; restaurant_branches holds any
-- additional locations, each with its own contact number and map, so the
-- public page can list every branch with working WhatsApp/call/map links.
-- ============================================================================

create table if not exists public.restaurant_branches (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  address text,
  phone_whatsapp text not null,
  google_maps_embed_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists restaurant_branches_restaurant_id_idx
  on public.restaurant_branches (restaurant_id, display_order);

alter table public.restaurant_branches enable row level security;

drop policy if exists "branches are publicly readable" on public.restaurant_branches;
create policy "branches are publicly readable"
  on public.restaurant_branches for select to anon, authenticated using (true);

drop policy if exists "admins can insert branches for their restaurant" on public.restaurant_branches;
create policy "admins can insert branches for their restaurant"
  on public.restaurant_branches for insert to authenticated
  with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists "admins can update branches for their restaurant" on public.restaurant_branches;
create policy "admins can update branches for their restaurant"
  on public.restaurant_branches for update to authenticated
  using (public.is_restaurant_admin(restaurant_id))
  with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists "admins can delete branches for their restaurant" on public.restaurant_branches;
create policy "admins can delete branches for their restaurant"
  on public.restaurant_branches for delete to authenticated
  using (public.is_restaurant_admin(restaurant_id));
