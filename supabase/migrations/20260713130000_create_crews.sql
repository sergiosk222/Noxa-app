create table if not exists public.crews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 60),
  description text check (description is null or char_length(description) <= 500),
  city text check (city is null or char_length(city) <= 80),
  logo_url text,
  cover_image_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crews_owner_id_idx
  on public.crews (owner_id);

create index if not exists crews_public_created_at_idx
  on public.crews (created_at desc)
  where is_public = true;

create table if not exists public.crew_members (
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id)
);

create index if not exists crew_members_user_id_idx
  on public.crew_members (user_id);

create or replace function public.noxa_is_crew_public(target_crew_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (select public.crews.is_public from public.crews where public.crews.id = target_crew_id),
    false
  );
$$;

create or replace function public.noxa_is_crew_member(target_crew_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.crew_members
    where public.crew_members.crew_id = target_crew_id
      and public.crew_members.user_id = (select auth.uid())
  );
$$;

create or replace function public.noxa_can_view_crew(target_crew_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.crews
    where public.crews.id = target_crew_id
      and (
        public.crews.is_public = true
        or public.crews.owner_id = (select auth.uid())
        or public.noxa_is_crew_member(target_crew_id)
      )
  );
$$;

create or replace function public.noxa_insert_crew_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.crew_members (crew_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  return new;
end;
$$;

create or replace function public.noxa_protect_crew_owner_and_touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Crew owner cannot be changed';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists noxa_insert_crew_owner_membership_trigger on public.crews;
create trigger noxa_insert_crew_owner_membership_trigger
  after insert on public.crews
  for each row
  execute function public.noxa_insert_crew_owner_membership();

drop trigger if exists noxa_protect_crew_owner_and_touch_updated_at_trigger on public.crews;
create trigger noxa_protect_crew_owner_and_touch_updated_at_trigger
  before update on public.crews
  for each row
  execute function public.noxa_protect_crew_owner_and_touch_updated_at();

grant select, insert, update, delete on table public.crews to authenticated;
grant select, insert, delete on table public.crew_members to authenticated;

revoke all on function public.noxa_is_crew_public(uuid) from public;
revoke all on function public.noxa_is_crew_member(uuid) from public;
revoke all on function public.noxa_can_view_crew(uuid) from public;
revoke all on function public.noxa_insert_crew_owner_membership() from public;
revoke all on function public.noxa_protect_crew_owner_and_touch_updated_at() from public;

grant execute on function public.noxa_is_crew_public(uuid) to authenticated;
grant execute on function public.noxa_is_crew_member(uuid) to authenticated;
grant execute on function public.noxa_can_view_crew(uuid) to authenticated;

alter table public.crews enable row level security;
alter table public.crew_members enable row level security;

drop policy if exists "NOXA crews are readable when visible" on public.crews;
drop policy if exists "NOXA users can create owned crews" on public.crews;
drop policy if exists "NOXA owners can update crews" on public.crews;
drop policy if exists "NOXA owners can delete crews" on public.crews;
drop policy if exists "NOXA memberships readable for visible crews" on public.crew_members;
drop policy if exists "NOXA users can join public crews" on public.crew_members;
drop policy if exists "NOXA members can leave non-owner rows" on public.crew_members;

create policy "NOXA crews are readable when visible"
  on public.crews
  for select
  to authenticated
  using (public.noxa_can_view_crew(id));

create policy "NOXA users can create owned crews"
  on public.crews
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "NOXA owners can update crews"
  on public.crews
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "NOXA owners can delete crews"
  on public.crews
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "NOXA memberships readable for visible crews"
  on public.crew_members
  for select
  to authenticated
  using (public.noxa_can_view_crew(crew_id));

create policy "NOXA users can join public crews"
  on public.crew_members
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'member'
    and public.noxa_is_crew_public(crew_id)
  );

create policy "NOXA members can leave non-owner rows"
  on public.crew_members
  for delete
  to authenticated
  using (user_id = (select auth.uid()) and role <> 'owner');
