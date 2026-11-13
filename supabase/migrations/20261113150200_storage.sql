-- KAMY Merchant Studio — storage
-- merchant-media: public storefront and listing images (avatars, banners, gallery).
-- product-files:  private deliverables. No public URLs; buyers get expiring signed URLs
--                 generated server-side after a verified purchase.
-- Object paths always start with the merchant id: "<merchant_id>/<...>".

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('merchant-media', 'merchant-media', true, 8388608,
   array['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
  ('product-files', 'product-files', false, null, null)
on conflict (id) do nothing;

create policy "Editors read their merchant media"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'merchant-media'
    and private.has_merchant_role(private.try_uuid((storage.foldername(name))[1]), 'editor')
  );

create policy "Editors upload merchant media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'merchant-media'
    and private.has_merchant_role(private.try_uuid((storage.foldername(name))[1]), 'editor')
  );

create policy "Editors replace merchant media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'merchant-media'
    and private.has_merchant_role(private.try_uuid((storage.foldername(name))[1]), 'editor')
  )
  with check (
    bucket_id = 'merchant-media'
    and private.has_merchant_role(private.try_uuid((storage.foldername(name))[1]), 'editor')
  );

create policy "Editors delete merchant media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'merchant-media'
    and private.has_merchant_role(private.try_uuid((storage.foldername(name))[1]), 'editor')
  );

create policy "Editors read their product files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'product-files'
    and private.has_merchant_role(private.try_uuid((storage.foldername(name))[1]), 'editor')
  );

create policy "Editors upload product files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-files'
    and private.has_merchant_role(private.try_uuid((storage.foldername(name))[1]), 'editor')
  );

create policy "Admins delete product files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-files'
    and private.has_merchant_role(private.try_uuid((storage.foldername(name))[1]), 'admin')
  );
