create table if not exists public.driver_locations (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  heading double precision null,
  speed_mps double precision null,
  accuracy_meters double precision null,
  updated_at timestamptz not null default now(),
  constraint driver_locations_latitude_check check (latitude between -90 and 90),
  constraint driver_locations_longitude_check check (longitude between -180 and 180),
  constraint driver_locations_heading_check check (heading is null or (heading >= 0 and heading < 360)),
  constraint driver_locations_speed_mps_check check (speed_mps is null or speed_mps >= 0),
  constraint driver_locations_accuracy_meters_check check (accuracy_meters is null or accuracy_meters >= 0)
);

create index if not exists driver_locations_updated_at_idx
  on public.driver_locations (updated_at);

grant select, insert, update, delete on public.driver_locations to authenticated;

alter table public.driver_locations enable row level security;

create policy "Authenticated users can read active driver locations"
  on public.driver_locations
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or updated_at >= now() - interval '2 minutes'
  );

create policy "Authenticated users can insert their own driver location"
  on public.driver_locations
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Authenticated users can update their own driver location"
  on public.driver_locations
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Authenticated users can delete their own driver location"
  on public.driver_locations
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'driver_locations'
  ) then
    alter publication supabase_realtime add table public.driver_locations;
  end if;
end $$;
