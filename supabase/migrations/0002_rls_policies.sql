-- ============================================================================
-- Nova Restaurant SaaS — Row Level Security policies
--
-- Design summary (read this before applying to a live project):
--
-- 1. Public read: anyone (anon or authenticated) can SELECT the data that
--    renders on a restaurant's public site — restaurant info, categories,
--    menu items, and approved reviews. No auth required, since visitors
--    to /[slug] are never logged in.
--
-- 2. Admin write: INSERT/UPDATE/DELETE on tenant-owned tables is restricted
--    to an authenticated user who has a row in admin_users pointing at that
--    same restaurant_id. This is checked with the is_restaurant_admin()
--    helper function below, evaluated on every write at the database level
--    — so even if application code has a bug, Postgres itself refuses
--    cross-tenant writes.
--
-- 3. admin_users itself: a user may only ever read their OWN membership row
--    (auth.uid() = id). There is no INSERT/UPDATE/DELETE policy for regular
--    clients — provisioning a new admin (onboarding a new restaurant) is a
--    privileged operation done with the Supabase service role key from
--    trusted server code, never from the browser.
--
-- 4. restaurants: admins can UPDATE their own restaurant's row (e.g. change
--    the WhatsApp number or logo) but there is no DELETE policy at all —
--    deleting a tenant is an administrative action outside the app.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: is the current authenticated user an admin of the given restaurant?
-- SECURITY DEFINER so it can read admin_users regardless of the caller's own
-- RLS grants on that table (avoids policy recursion).
-- ----------------------------------------------------------------------------
create or replace function public.is_restaurant_admin(target_restaurant_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
      and au.restaurant_id = target_restaurant_id
  );
$$;

grant execute on function public.is_restaurant_admin(uuid) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- restaurants
-- ----------------------------------------------------------------------------
alter table public.restaurants enable row level security;

create policy "restaurants are publicly readable"
  on public.restaurants
  for select
  to anon, authenticated
  using (true);

create policy "admins can update their own restaurant"
  on public.restaurants
  for update
  to authenticated
  using (public.is_restaurant_admin(id))
  with check (public.is_restaurant_admin(id));

-- No insert/delete policy: tenant provisioning and offboarding happen via
-- the service role key in trusted server code, not client requests.

-- ----------------------------------------------------------------------------
-- admin_users
-- ----------------------------------------------------------------------------
alter table public.admin_users enable row level security;

create policy "admins can read their own membership row"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = id);

-- No insert/update/delete policy for regular clients on purpose.

-- ----------------------------------------------------------------------------
-- menu_categories
-- ----------------------------------------------------------------------------
alter table public.menu_categories enable row level security;

create policy "menu categories are publicly readable"
  on public.menu_categories
  for select
  to anon, authenticated
  using (true);

create policy "admins can insert categories for their restaurant"
  on public.menu_categories
  for insert
  to authenticated
  with check (public.is_restaurant_admin(restaurant_id));

create policy "admins can update categories for their restaurant"
  on public.menu_categories
  for update
  to authenticated
  using (public.is_restaurant_admin(restaurant_id))
  with check (public.is_restaurant_admin(restaurant_id));

create policy "admins can delete categories for their restaurant"
  on public.menu_categories
  for delete
  to authenticated
  using (public.is_restaurant_admin(restaurant_id));

-- ----------------------------------------------------------------------------
-- menu_items
-- ----------------------------------------------------------------------------
alter table public.menu_items enable row level security;

create policy "menu items are publicly readable"
  on public.menu_items
  for select
  to anon, authenticated
  using (true);

create policy "admins can insert items for their restaurant"
  on public.menu_items
  for insert
  to authenticated
  with check (public.is_restaurant_admin(restaurant_id));

create policy "admins can update items for their restaurant"
  on public.menu_items
  for update
  to authenticated
  using (public.is_restaurant_admin(restaurant_id))
  with check (public.is_restaurant_admin(restaurant_id));

create policy "admins can delete items for their restaurant"
  on public.menu_items
  for delete
  to authenticated
  using (public.is_restaurant_admin(restaurant_id));

-- ----------------------------------------------------------------------------
-- reviews
-- ----------------------------------------------------------------------------
alter table public.reviews enable row level security;

-- Public visitors only ever see approved reviews.
create policy "approved reviews are publicly readable"
  on public.reviews
  for select
  to anon, authenticated
  using (is_approved = true);

-- Admins can see all reviews for their own restaurant, including pending ones.
create policy "admins can read all reviews for their restaurant"
  on public.reviews
  for select
  to authenticated
  using (public.is_restaurant_admin(restaurant_id));

-- Anyone (including anonymous visitors) can submit a review; it starts
-- unapproved and is invisible until moderated.
create policy "anyone can submit a pending review"
  on public.reviews
  for insert
  to anon, authenticated
  with check (is_approved = false);

create policy "admins can moderate reviews for their restaurant"
  on public.reviews
  for update
  to authenticated
  using (public.is_restaurant_admin(restaurant_id))
  with check (public.is_restaurant_admin(restaurant_id));

create policy "admins can delete reviews for their restaurant"
  on public.reviews
  for delete
  to authenticated
  using (public.is_restaurant_admin(restaurant_id));
