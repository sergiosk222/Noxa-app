insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-images',
  'vehicle-images',
  true,
  6291456,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "vehicle_images_authenticated_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vehicle-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "vehicle_images_authenticated_delete_own_object"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vehicle-images'
  and owner_id = auth.uid()::text
  and (storage.foldername(name))[1] = auth.uid()::text
);
