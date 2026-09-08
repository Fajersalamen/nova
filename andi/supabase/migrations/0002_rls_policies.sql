-- عندي (Andi) — Row Level Security
-- Principle: a row is readable/writable only by the profiles that legitimately need it
-- (its owner, the two sides of a rental/conversation, or an admin). No table is left
-- without RLS enabled.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

alter table public.areas enable row level security;
alter table public.categories enable row level security;
alter table public.platform_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.verifications enable row level security;
alter table public.items enable row level security;
alter table public.item_images enable row level security;
alter table public.item_blocked_dates enable row level security;
alter table public.favorites enable row level security;
alter table public.search_history enable row level security;
alter table public.rentals enable row level security;
alter table public.security_deposits enable row level security;
alter table public.payments enable row level security;
alter table public.transactions enable row level security;
alter table public.reviews enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.admin_users enable row level security;

-- ---------------------------------------------------------------------------
-- Reference data: public read, admin write
-- ---------------------------------------------------------------------------
create policy "areas_read_all" on public.areas for select using (true);
create policy "areas_admin_write" on public.areas for all using (is_admin()) with check (is_admin());

create policy "categories_read_all" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all using (is_admin()) with check (is_admin());

create policy "platform_settings_read_all" on public.platform_settings for select using (true);
create policy "platform_settings_admin_write" on public.platform_settings for update using (is_admin());

-- ---------------------------------------------------------------------------
-- profiles: public directory read (rating/name/avatar are meant to be seen by
-- anyone browsing items), but a user can only ever change their own row.
-- Sensitive columns (phone) are still protected: clients should select an
-- explicit column list rather than `select *` for other users' profiles.
-- ---------------------------------------------------------------------------
create policy "profiles_read_all" on public.profiles for select using (true);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id or is_admin());

create policy "verifications_read_own" on public.verifications for select
  using (user_id = auth.uid() or is_admin());
create policy "verifications_insert_own" on public.verifications for insert
  with check (user_id = auth.uid());
create policy "verifications_admin_update" on public.verifications for update using (is_admin());

-- ---------------------------------------------------------------------------
-- items: anyone can browse available, non-hidden items; only the owner can
-- see/manage their own paused or hidden items.
-- ---------------------------------------------------------------------------
create policy "items_read_public" on public.items for select
  using (
    (status <> 'paused' and not is_hidden)
    or owner_id = auth.uid()
    or is_admin()
  );
create policy "items_insert_own" on public.items for insert with check (owner_id = auth.uid());
create policy "items_update_own" on public.items for update
  using (owner_id = auth.uid() or is_admin());
create policy "items_delete_own" on public.items for delete
  using (owner_id = auth.uid() or is_admin());

create policy "item_images_read" on public.item_images for select
  using (exists (
    select 1 from public.items i where i.id = item_id
    and ((i.status <> 'paused' and not i.is_hidden) or i.owner_id = auth.uid() or is_admin())
  ));
create policy "item_images_write_own" on public.item_images for all
  using (exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid()))
  with check (exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid()));

create policy "item_blocked_dates_read" on public.item_blocked_dates for select using (true);
create policy "item_blocked_dates_write_own" on public.item_blocked_dates for all
  using (exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid()))
  with check (exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- favorites / search_history: private to the user
-- ---------------------------------------------------------------------------
create policy "favorites_own" on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "search_history_own" on public.search_history for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- rentals: visible only to the renter and the owner involved
-- ---------------------------------------------------------------------------
create policy "rentals_read_participants" on public.rentals for select
  using (renter_id = auth.uid() or owner_id = auth.uid() or is_admin());
create policy "rentals_insert_as_renter" on public.rentals for insert
  with check (renter_id = auth.uid());
create policy "rentals_update_participants" on public.rentals for update
  using (renter_id = auth.uid() or owner_id = auth.uid() or is_admin());

create policy "security_deposits_read_participants" on public.security_deposits for select
  using (exists (
    select 1 from public.rentals r where r.id = rental_id
    and (r.renter_id = auth.uid() or r.owner_id = auth.uid())
  ) or is_admin());
create policy "security_deposits_admin_write" on public.security_deposits for all
  using (is_admin()) with check (is_admin());

create policy "payments_read_participants" on public.payments for select
  using (exists (
    select 1 from public.rentals r where r.id = rental_id
    and (r.renter_id = auth.uid() or r.owner_id = auth.uid())
  ) or is_admin());
create policy "payments_insert_renter" on public.payments for insert
  with check (exists (
    select 1 from public.rentals r where r.id = rental_id and r.renter_id = auth.uid()
  ));

create policy "transactions_read_own" on public.transactions for select
  using (user_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------------------
-- reviews: public read (they're social proof), insert only by a genuine
-- participant of a completed rental, one review per direction per rental.
-- ---------------------------------------------------------------------------
create policy "reviews_read_all" on public.reviews for select using (true);
create policy "reviews_insert_participant" on public.reviews for insert
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.rentals r where r.id = rental_id
      and r.status = 'completed'
      and (r.renter_id = auth.uid() or r.owner_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- chat: only the two participants of a conversation
-- ---------------------------------------------------------------------------
create policy "conversations_read_participants" on public.conversations for select
  using (renter_id = auth.uid() or owner_id = auth.uid());
create policy "conversations_insert_participant" on public.conversations for insert
  with check (renter_id = auth.uid() or owner_id = auth.uid());

create policy "messages_read_participants" on public.messages for select
  using (exists (
    select 1 from public.conversations c where c.id = conversation_id
    and (c.renter_id = auth.uid() or c.owner_id = auth.uid())
  ));
create policy "messages_insert_participant" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c where c.id = conversation_id
      and (c.renter_id = auth.uid() or c.owner_id = auth.uid())
    )
  );
create policy "messages_update_participant" on public.messages for update
  using (exists (
    select 1 from public.conversations c where c.id = conversation_id
    and (c.renter_id = auth.uid() or c.owner_id = auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- notifications: private to the recipient
-- ---------------------------------------------------------------------------
create policy "notifications_own" on public.notifications for select using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reports: anyone can file one, only admins can read/triage
-- ---------------------------------------------------------------------------
create policy "reports_insert_any_authed" on public.reports for insert
  with check (reporter_id = auth.uid());
create policy "reports_read_admin" on public.reports for select
  using (reporter_id = auth.uid() or is_admin());
create policy "reports_update_admin" on public.reports for update using (is_admin());

-- ---------------------------------------------------------------------------
-- admin_users: only admins can see the admin list
-- ---------------------------------------------------------------------------
create policy "admin_users_read_admin" on public.admin_users for select using (is_admin());
