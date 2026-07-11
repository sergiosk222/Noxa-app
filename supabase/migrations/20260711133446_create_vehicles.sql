create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  brand text not null check (char_length(btrim(brand)) between 1 and 60),
  model text check (char_length(model) <= 60),
  year smallint check (year between 1886 and 2100),
  horsepower integer not null check (horsepower between 1 and 5000),
  color text not null check (char_length(btrim(color)) between 1 and 40),
  transmission text check (char_length(transmission) <= 40),
  drivetrain text check (char_length(drivetrain) <= 40),
  tuning_stage text check (char_length(tuning_stage) <= 40),
  zero_to_hundred numeric(4,1) check (zero_to_hundred > 0 and zero_to_hundred <= 60),
  description text check (char_length(description) <= 1000),
  cover_image_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_owner_id_idx
  on public.vehicles (owner_id);

create index vehicles_public_created_at_idx
  on public.vehicles (created_at desc)
  where is_public = true;

grant select, insert, update, delete on table public.vehicles to authenticated;

alter table public.vehicles enable row level security;

create policy "Authenticated users can read public and own vehicles"
  on public.vehicles
  for select
  to authenticated
  using (is_public = true or (select auth.uid()) = owner_id);

create policy "Users can insert their own vehicles"
  on public.vehicles
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Users can update their own vehicles"
  on public.vehicles
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own vehicles"
  on public.vehicles
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);
