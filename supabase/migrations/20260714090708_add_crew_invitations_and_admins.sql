-- C16C2 crew invitations and admin roles

alter table public.crew_members drop constraint if exists crew_members_role_check;
alter table public.crew_members add constraint crew_members_role_check check (role in ('owner', 'admin', 'member'));

create unique index if not exists crew_members_one_owner_per_crew_idx on public.crew_members (crew_id) where role = 'owner';
create index if not exists crew_members_crew_role_joined_at_idx on public.crew_members (crew_id, role, joined_at);

create table if not exists public.crew_invitations (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  invited_user_id uuid not null references public.profiles(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz null
);

create unique index if not exists crew_invitations_one_pending_idx on public.crew_invitations (crew_id, invited_user_id) where status = 'pending';
create index if not exists crew_invitations_invited_status_created_idx on public.crew_invitations (invited_user_id, status, created_at desc);
create index if not exists crew_invitations_crew_status_created_idx on public.crew_invitations (crew_id, status, created_at desc);

alter table public.crew_invitations enable row level security;
revoke all on table public.crew_invitations from anon;
revoke all on table public.crew_invitations from authenticated;
grant select on table public.crew_invitations to authenticated;

create or replace function public.noxa_is_crew_manager(target_crew_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.crew_members
    where crew_id = target_crew_id and user_id = (select auth.uid()) and role in ('owner','admin')
  );
$$;

create or replace function public.noxa_can_view_crew(target_crew_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.crews
    where public.crews.id = target_crew_id
      and (
        public.crews.is_public = true
        or public.crews.owner_id = (select auth.uid())
        or exists (select 1 from public.crew_members where crew_id = target_crew_id and user_id = (select auth.uid()))
        or exists (select 1 from public.crew_invitations where crew_id = target_crew_id and invited_user_id = (select auth.uid()) and status = 'pending')
      )
  );
$$;

drop policy if exists "NOXA invitations readable by invitee or managers" on public.crew_invitations;
create policy "NOXA invitations readable by invitee or managers" on public.crew_invitations
  for select to authenticated
  using (invited_user_id = (select auth.uid()) or public.noxa_is_crew_manager(crew_id));

create or replace function public.noxa_invite_to_crew(target_crew_id uuid, target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := (select auth.uid()); actor_role text; crew_owner_id
  uuid; invite_id uuid;
begin
  if actor is null or target_crew_id is null or target_user_id is null then raise exception 'not allowed'; end if;
  select public.crews.owner_id into crew_owner_id from public.crews where public.crews.id = target_crew_id;
  if crew_owner_id is null then raise exception 'crew not found'; end if;
  select public.crew_members.role into actor_role from public.crew_members where public.crew_members.crew_id = target_crew_id and public.crew_members.user_id = actor;
  if actor_role not in ('owner','admin') then raise exception 'not allowed'; end if;
  if target_user_id = crew_owner_id then raise exception 'cannot invite owner'; end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then raise exception 'profile not found'; end if;
  if exists (select 1 from public.crew_members where public.crew_members.crew_id = target_crew_id and public.crew_members.user_id = target_user_id) then raise exception 'already member'; end if;
  select public.crew_invitations.id into invite_id from public.crew_invitations where public.crew_invitations.crew_id = target_crew_id and invited_user_id = target_user_id and status = 'pending';
  if invite_id is not null then return invite_id; end if;
  insert into public.crew_invitations (crew_id, invited_user_id, invited_by) values (target_crew_id, target_user_id, actor) returning id into invite_id;
  return invite_id;
end;
$$;

create or replace function public.noxa_respond_to_crew_invitation(target_invitation_id uuid, accept boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := (select auth.uid()); inv public.crew_invitations%rowtype;
begin
  if actor is null or target_invitation_id is null or accept is null then raise exception 'not allowed'; end if;
  select * into inv from public.crew_invitations where id = target_invitation_id for update;
  if inv.id is null or inv.invited_user_id <> actor or inv.status <> 'pending' then return false; end if;
  if accept then
    insert into public.crew_members (crew_id, user_id, role) values (inv.crew_id, actor, 'member') on conflict (crew_id, user_id) do nothing;
    update public.crew_invitations set status = 'accepted', responded_at = now() where id = inv.id;
  else
    update public.crew_invitations set status = 'declined', responded_at = now() where id = inv.id;
  end if;
  return true;
end;
$$;

create or replace function public.noxa_cancel_crew_invitation(target_invitation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := (select auth.uid()); inv public.crew_invitations%rowtype; actor_role text;
begin
  if actor is null or target_invitation_id is null then raise exception 'not allowed'; end if;
  select * into inv from public.crew_invitations where id = target_invitation_id for update;
  if inv.id is null or inv.status <> 'pending' then return false; end if;
  select role into actor_role from public.crew_members where crew_id = inv.crew_id and user_id = actor;
  if actor_role not in ('owner','admin') then raise exception 'not allowed'; end if;
  update public.crew_invitations set status = 'cancelled', responded_at = now() where id = inv.id;
  return true;
end;
$$;

create or replace function public.noxa_set_crew_member_role(target_crew_id uuid, target_user_id uuid, target_role text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := (select auth.uid()); target_current text;
begin
  if actor is null or target_crew_id is null or target_user_id is null or target_role not in ('admin','member') then raise exception 'not allowed'; end if;
  if not exists (select 1 from public.crew_members where crew_id = target_crew_id and user_id = actor and role = 'owner') then raise exception 'not allowed'; end if;
  select role into target_current from public.crew_members where crew_id = target_crew_id and user_id = target_user_id for update;
  if target_current is null then return false; end if;
  if target_current = 'owner' or target_user_id = actor then raise exception 'cannot change owner'; end if;
  update public.crew_members set role = target_role where crew_id = target_crew_id and user_id = target_user_id;
  return true;
end;
$$;

create or replace function public.noxa_remove_crew_member(target_crew_id uuid, target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := (select auth.uid()); actor_role text; target_current text;
begin
  if actor is null or target_crew_id is null or target_user_id is null then raise exception 'not allowed'; end if;
  if actor = target_user_id then raise exception 'cannot remove yourself'; end if;
  select role into actor_role from public.crew_members where crew_id = target_crew_id and user_id = actor;
  select role into target_current from public.crew_members where crew_id = target_crew_id and user_id = target_user_id for update;
  if target_current is null then return false; end if;
  if target_current = 'owner' then raise exception 'cannot remove owner'; end if;
  if actor_role = 'owner' or (actor_role = 'admin' and target_current = 'member') then
    delete from public.crew_members where crew_id = target_crew_id and user_id = target_user_id;
    return true;
  end if;
  raise exception 'not allowed';
end;
$$;

revoke all privileges on function public.noxa_is_crew_manager(uuid) from public, anon, authenticated;
revoke all privileges on function public.noxa_can_view_crew(uuid) from public, anon, authenticated;
revoke all privileges on function public.noxa_invite_to_crew(uuid, uuid) from public, anon, authenticated;
revoke all privileges on function public.noxa_respond_to_crew_invitation(uuid, boolean) from public, anon, authenticated;
revoke all privileges on function public.noxa_cancel_crew_invitation(uuid) from public, anon, authenticated;
revoke all privileges on function public.noxa_set_crew_member_role(uuid, uuid, text) from public, anon, authenticated;
revoke all privileges on function public.noxa_remove_crew_member(uuid, uuid) from public, anon, authenticated;
grant execute on function public.noxa_is_crew_manager(uuid) to authenticated;
grant execute on function public.noxa_can_view_crew(uuid) to authenticated;
grant execute on function public.noxa_invite_to_crew(uuid, uuid) to authenticated;
grant execute on function public.noxa_respond_to_crew_invitation(uuid, boolean) to authenticated;
grant execute on function public.noxa_cancel_crew_invitation(uuid) to authenticated;
grant execute on function public.noxa_set_crew_member_role(uuid, uuid, text) to authenticated;
grant execute on function public.noxa_remove_crew_member(uuid, uuid) to authenticated;
