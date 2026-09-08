-- عندي (Andi) — business-logic functions & triggers

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up (phone OTP).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, phone_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    new.phone,
    new.phone_confirmed_at is not null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Keep a profile's phone_verified in sync if confirmed after signup.
-- ---------------------------------------------------------------------------
create or replace function public.handle_user_phone_confirmed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.phone_confirmed_at is not null and old.phone_confirmed_at is null then
    update public.profiles set phone_verified = true, phone = new.phone where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_phone_confirmed
  after update on auth.users
  for each row execute function public.handle_user_phone_confirmed();

-- ---------------------------------------------------------------------------
-- Recompute rating_avg/rating_count on the reviewee's profile (and the item,
-- when the review is renter -> owner) whenever a review lands.
-- ---------------------------------------------------------------------------
create or replace function public.apply_review()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_item_id uuid;
begin
  update public.profiles p set
    rating_count = p.rating_count + 1,
    rating_avg = round((
      (p.rating_avg * p.rating_count + new.rating) / (p.rating_count + 1)
    )::numeric, 2)
  where p.id = new.reviewee_id;

  if new.role = 'renter_to_owner' then
    select item_id into v_item_id from public.rentals where id = new.rental_id;
    update public.items i set
      rating_count = i.rating_count + 1,
      rating_avg = round((
        (i.rating_avg * i.rating_count + new.rating) / (i.rating_count + 1)
      )::numeric, 2)
    where i.id = v_item_id;
  end if;

  return new;
end;
$$;

create trigger on_review_insert
  after insert on public.reviews
  for each row execute function public.apply_review();

-- ---------------------------------------------------------------------------
-- Rental status transitions: block/free calendar dates, bump counters,
-- create the commission ledger on completion. Centralized here so the app
-- never has to perform these as several separate client-side writes.
-- ---------------------------------------------------------------------------
create or replace function public.apply_rental_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_commission_percent numeric;
  v_commission numeric;
  v_payout numeric;
begin
  -- Block the date range once the owner accepts.
  if new.status = 'accepted' and old.status = 'pending' then
    insert into public.item_blocked_dates (item_id, blocked_date, reason, rental_id)
    select new.item_id, d::date, 'rental', new.id
    from generate_series(new.start_date, new.end_date, interval '1 day') d
    on conflict (item_id, blocked_date) do nothing;
  end if;

  -- Free the dates again if it's rejected or cancelled after being blocked.
  if new.status in ('rejected', 'cancelled') and old.status in ('accepted', 'ready_for_pickup', 'active') then
    delete from public.item_blocked_dates where rental_id = new.id;
    update public.items set status = 'available' where id = new.item_id and status = 'rented';
  end if;

  if new.status = 'active' and old.status = 'ready_for_pickup' then
    update public.items set status = 'rented' where id = new.item_id;
  end if;

  if new.status = 'completed' and old.status = 'returned' then
    update public.items set
      status = 'available',
      rental_count = rental_count + 1
    where id = new.item_id;

    update public.profiles set rentals_as_renter_count = rentals_as_renter_count + 1
      where id = new.renter_id;
    update public.profiles set rentals_as_owner_count = rentals_as_owner_count + 1
      where id = new.owner_id;

    select commission_percent into v_commission_percent from public.platform_settings where id = 1;
    v_commission := round(new.subtotal * v_commission_percent / 100, 2);
    v_payout := new.subtotal - v_commission;

    insert into public.transactions (rental_id, user_id, type, amount, status)
    values
      (new.id, new.owner_id, 'owner_payout', v_payout, 'settled'),
      (new.id, new.owner_id, 'platform_commission', v_commission, 'settled');

    update public.security_deposits set status = 'released', released_at = now()
      where rental_id = new.id and status = 'held';
  end if;

  return new;
end;
$$;

create trigger on_rental_status_change
  after update of status on public.rentals
  for each row execute function public.apply_rental_status_change();

-- ---------------------------------------------------------------------------
-- Notification helper + triggers for the key lifecycle events.
-- ---------------------------------------------------------------------------
create or replace function public.notify(
  p_user_id uuid, p_type text, p_title text, p_body text, p_data jsonb default '{}'::jsonb
) returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, type, title, body, data)
  values (p_user_id, p_type, p_title, p_body, p_data);
$$;

create or replace function public.notify_on_rental_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_item_title text;
begin
  select title into v_item_title from public.items where id = new.item_id;

  if tg_op = 'INSERT' then
    perform public.notify(new.owner_id, 'new_rental_request',
      'طلب استئجار جديد', 'في طلب جديد على "' || v_item_title || '"',
      jsonb_build_object('rental_id', new.id));
  elsif new.status = 'accepted' and old.status = 'pending' then
    perform public.notify(new.renter_id, 'rental_accepted',
      'تم قبول طلبك', 'صاحب "' || v_item_title || '" وافق على طلبك',
      jsonb_build_object('rental_id', new.id));
  elsif new.status = 'rejected' and old.status = 'pending' then
    perform public.notify(new.renter_id, 'rental_rejected',
      'تم رفض الطلب', 'ما قدرنا نأكد طلبك على "' || v_item_title || '"',
      jsonb_build_object('rental_id', new.id));
  elsif new.status = 'completed' and old.status = 'returned' then
    perform public.notify(new.renter_id, 'rental_completed',
      'خلصت عملية الاستئجار', 'قيّم تجربتك مع "' || v_item_title || '"',
      jsonb_build_object('rental_id', new.id));
    perform public.notify(new.owner_id, 'rental_completed',
      'خلصت عملية الاستئجار', 'قيّم المستأجر لـ "' || v_item_title || '"',
      jsonb_build_object('rental_id', new.id));
  end if;
  return new;
end;
$$;

create trigger on_rental_notify_insert
  after insert on public.rentals
  for each row execute function public.notify_on_rental_change();
create trigger on_rental_notify_update
  after update of status on public.rentals
  for each row execute function public.notify_on_rental_change();

create or replace function public.notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_recipient uuid;
  v_sender_name text;
begin
  select case when c.renter_id = new.sender_id then c.owner_id else c.renter_id end
    into v_recipient
  from public.conversations c where c.id = new.conversation_id;

  select full_name into v_sender_name from public.profiles where id = new.sender_id;

  perform public.notify(v_recipient, 'new_message', 'رسالة جديدة',
    v_sender_name || ' أرسل لك رسالة', jsonb_build_object('conversation_id', new.conversation_id));

  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_insert
  after insert on public.messages
  for each row execute function public.notify_on_message();

create or replace function public.notify_on_review()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(new.reviewee_id, 'new_review', 'تقييم جديد', 'حصلت على تقييم جديد',
    jsonb_build_object('rental_id', new.rental_id));
  return new;
end;
$$;

create trigger on_review_notify
  after insert on public.reviews
  for each row execute function public.notify_on_review();

-- ---------------------------------------------------------------------------
-- Distance helper (haversine, km) — used by the app for server-side sorting
-- when needed (RPC), the client also computes this locally for display.
-- ---------------------------------------------------------------------------
create or replace function public.distance_km(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
returns double precision language sql immutable as $$
  select 6371 * acos(
    least(1, greatest(-1,
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lng2) - radians(lng1))
      + sin(radians(lat1)) * sin(radians(lat2))
    ))
  );
$$;

create or replace function public.increment_item_view(p_item_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.items set view_count = view_count + 1 where id = p_item_id;
$$;

-- RPC: items near a point, cheapest first filterable by the client afterwards.
create or replace function public.items_nearby(p_lat double precision, p_lng double precision, p_limit int default 30)
returns setof public.items language sql stable as $$
  select * from public.items
  where status = 'available' and not is_hidden
  order by public.distance_km(p_lat, p_lng, approx_lat, approx_lng) asc
  limit p_limit;
$$;
