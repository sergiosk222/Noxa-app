create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  description text check (description is null or char_length(description) <= 2000),
  location_name text not null check (char_length(btrim(location_name)) between 1 and 160),
  starts_at timestamptz not null,
  ends_at timestamptz check (ends_at is null or ends_at > starts_at),
  cover_image_url text,
  is_public boolean not null default true,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_public_upcoming_starts_at_idx
  on public.events (starts_at)
  where is_public = true and status = 'scheduled';

create index if not exists events_creator_id_starts_at_idx
  on public.events (creator_id, starts_at);

grant select, insert, update, delete on table public.events to authenticated;

alter table public.events enable row level security;

drop policy if exists "NOXA events are readable when public or owned" on public.events;
drop policy if exists "NOXA users can create own events" on public.events;
drop policy if exists "NOXA users can update own events" on public.events;
drop policy if exists "NOXA users can delete own events" on public.events;

create policy "NOXA events are readable when public or owned"
  on public.events
  for select
  to authenticated
  using (is_public = true or (select auth.uid()) = creator_id);

create policy "NOXA users can create own events"
  on public.events
  for insert
  to authenticated
  with check ((select auth.uid()) = creator_id);

create policy "NOXA users can update own events"
  on public.events
  for update
  to authenticated
  using ((select auth.uid()) = creator_id)
  with check ((select auth.uid()) = creator_id);

create policy "NOXA users can delete own events"
  on public.events
  for delete
  to authenticated
  using ((select auth.uid()) = creator_id);

create table if not exists public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists event_attendees_user_id_joined_at_idx
  on public.event_attendees (user_id, joined_at);

create index if not exists event_attendees_event_id_joined_at_idx
  on public.event_attendees (event_id, joined_at);

grant select, insert, delete on table public.event_attendees to authenticated;

alter table public.event_attendees enable row level security;

drop policy if exists "NOXA attendees readable for accessible events" on public.event_attendees;
drop policy if exists "NOXA users can join accessible public events" on public.event_attendees;
drop policy if exists "NOXA users can leave non-host attendance" on public.event_attendees;

create policy "NOXA attendees readable for accessible events"
  on public.event_attendees
  for select
  to authenticated
  using (
    exists (
      select 1 from public.events
      where events.id = event_attendees.event_id
        and (events.is_public = true or events.creator_id = (select auth.uid()))
    )
  );

create policy "NOXA users can join accessible public events"
  on public.event_attendees
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.events
      where events.id = event_attendees.event_id
        and events.is_public = true
        and events.status = 'scheduled'
    )
  );

create policy "NOXA users can leave non-host attendance"
  on public.event_attendees
  for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and not exists (
      select 1 from public.events
      where events.id = event_attendees.event_id
        and events.creator_id = event_attendees.user_id
    )
  );

create or replace function public.noxa_insert_event_host_attendance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.event_attendees (event_id, user_id)
  values (new.id, new.creator_id)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists noxa_insert_event_host_attendance_trigger on public.events;

create trigger noxa_insert_event_host_attendance_trigger
  after insert on public.events
  for each row
  execute function public.noxa_insert_event_host_attendance();
