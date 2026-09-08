-- عندي (Andi) — Storage buckets for item photos and avatars.
-- Path convention enforced by policy: <bucket>/<auth.uid()>/<file>.
-- This is what keeps one user from overwriting/deleting another user's files
-- even though the bucket itself is publicly readable (photos need to be
-- viewable by anyone browsing items).

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "item_images_public_read" on storage.objects for select
  using (bucket_id = 'item-images');

create policy "item_images_owner_write" on storage.objects for insert
  with check (bucket_id = 'item-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "item_images_owner_delete" on storage.objects for delete
  using (bucket_id = 'item-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_public_read" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
