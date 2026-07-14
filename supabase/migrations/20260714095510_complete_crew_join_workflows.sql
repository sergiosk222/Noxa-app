-- Complete C16C1 crew join workflows and correct C16C2 invite ambiguity.

alter table public.crews add column if not exists join_policy text;
update public.crews set join_policy = case when is_public then 'open' else 'invite_only' end where join_policy is null;
alter table public.crews alter column join_policy set default 'approval';
alter table public.crews alter column join_policy set not null;
alter table public.crews drop constraint if exists crews_join_policy_check;
alter table public.crews add constraint crews_join_policy_check check (join_policy in ('open', 'approval', 'invite_only'));

create table if not exists public.crew_join_requests (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  reviewed_by uuid null references public.profiles(id) on delete set null
);

create unique index if not exists crew_join_requests_one_pending_idx on public.crew_join_requests (crew_id, user_id) where status = 'pending';
create index if not exists crew_join_requests_crew_status_created_idx on public.crew_join_requests (crew_id, status, created_at desc);
create index if not exists crew_join_requests_user_status_created_idx on public.crew_join_requests (user_id, status, created_at desc);

alter table public.crew_join_requests enable row level security;
revoke all on table public.crew_join_requests from anon;
revoke all on table public.crew_join_requests from authenticated;
grant select on table public.crew_join_requests to authenticated;

drop policy if exists "NOXA join requests readable by requester or managers" on public.crew_join_requests;
drop policy if exists "NOXA managers can read crew join requests" on public.crew_join_requests;
create policy "NOXA join requests readable by requester or managers" on public.crew_join_requests
  for select to authenticated
  using (public.crew_join_requests.user_id = (select auth.uid()) or public.noxa_is_crew_manager(public.crew_join_requests.crew_id));

drop policy if exists "NOXA authenticated users can join public crews" on public.crew_members;
drop policy if exists "NOXA users can join public crews" on public.crew_members;
drop policy if exists "Users can join public crews" on public.crew_members;
create policy "NOXA authenticated users can join open public crews" on public.crew_members
  for insert to authenticated
  with check (
    public.crew_members.user_id = (select auth.uid())
    and public.crew_members.role = 'member'
    and exists (
      select 1 from public.crews
      where public.crews.id = public.crew_members.crew_id
        and public.crews.is_public = true
        and public.crews.join_policy = 'open'
    )
  );

create or replace function public.noxa_request_crew_join(target_crew_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  request_id uuid;
begin
  if actor is null or target_crew_id is null then raise exception 'not allowed'; end if;
  if not exists (
    select 1 from public.crews
    where public.crews.id = target_crew_id
      and public.crews.is_public = true
      and public.crews.join_policy = 'approval'
  ) then raise exception 'crew not available for requests'; end if;
  if exists (select 1 from public.crew_members where public.crew_members.crew_id = target_crew_id and public.crew_members.user_id = actor) then raise exception 'already member'; end if;
  select public.crew_join_requests.id into request_id
  from public.crew_join_requests
  where public.crew_join_requests.crew_id = target_crew_id
    and public.crew_join_requests.user_id = actor
    and public.crew_join_requests.status = 'pending';
  if request_id is not null then return request_id; end if;
  insert into public.crew_join_requests (crew_id, user_id) values (target_crew_id, actor) returning public.crew_join_requests.id into request_id;
  return request_id;
end;
$$;

create or replace function public.noxa_cancel_crew_join_request(target_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  req public.crew_join_requests%rowtype;
begin
  if actor is null or target_request_id is null then raise exception 'not allowed'; end if;
  select * into req from public.crew_join_requests where public.crew_join_requests.id = target_request_id for update;
  if req.id is null or req.user_id <> actor or req.status <> 'pending' then return false; end if;
  update public.crew_join_requests set status = 'cancelled', reviewed_at = now() where public.crew_join_requests.id = req.id;
  return true;
end;
$$;

create or replace function public.noxa_review_crew_join_request(target_request_id uuid, approve boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  req public.crew_join_requests%rowtype;
begin
  if actor is null or target_request_id is null or approve is null then raise exception 'not allowed'; end if;
  select * into req from public.crew_join_requests where public.crew_join_requests.id = target_request_id for update;
  if req.id is null or req.status <> 'pending' then return false; end if;
  if not public.noxa_is_crew_manager(req.crew_id) then raise exception 'not allowed'; end if;
  if approve then
    insert into public.crew_members (crew_id, user_id, role) values (req.crew_id, req.user_id, 'member') on conflict (crew_id, user_id) do nothing;
    update public.crew_join_requests set status = 'approved', reviewed_at = now(), reviewed_by = actor where public.crew_join_requests.id = req.id;
  else
    update public.crew_join_requests set status = 'rejected', reviewed_at = now(), reviewed_by = actor where public.crew_join_requests.id = req.id;
  end if;
  return true;
end;
$$;

create or replace function public.noxa_invite_to_crew(target_crew_id uuid, target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  actor_role text;
  crew_owner_id uuid;
  invite_id uuid;
begin
  if actor is null or target_crew_id is null or target_user_id is null then raise exception 'not allowed'; end if;
  select public.crews.owner_id into crew_owner_id from public.crews where public.crews.id = target_crew_id;
  if crew_owner_id is null then raise exception 'crew not found'; end if;
  select public.crew_members.role into actor_role from public.crew_members where public.crew_members.crew_id = target_crew_id and public.crew_members.user_id = actor;
  if actor_role not in ('owner','admin') then raise exception 'not allowed'; end if;
  if target_user_id = crew_owner_id then raise exception 'cannot invite owner'; end if;
  if not exists (select 1 from public.profiles where public.profiles.id = target_user_id) then raise exception 'profile not found'; end if;
  if exists (select 1 from public.crew_members where public.crew_members.crew_id = target_crew_id and public.crew_members.user_id = target_user_id) then raise exception 'already member'; end if;
  select public.crew_invitations.id into invite_id from public.crew_invitations where public.crew_invitations.crew_id = target_crew_id and public.crew_invitations.invited_user_id = target_user_id and public.crew_invitations.status = 'pending';
  if invite_id is not null then return invite_id; end if;
  insert into public.crew_invitations (crew_id, invited_user_id, invited_by) values (target_crew_id, target_user_id, actor) returning public.crew_invitations.id into invite_id;
  return invite_id;
end;
$$;

revoke all privileges on function public.noxa_request_crew_join(uuid) from public, anon, authenticated;
revoke all privileges on function public.noxa_cancel_crew_join_request(uuid) from public, anon, authenticated;
revoke all privileges on function public.noxa_review_crew_join_request(uuid, boolean) from public, anon, authenticated;
revoke all privileges on function public.noxa_invite_to_crew(uuid, uuid) from public, anon, authenticated;
grant execute on function public.noxa_request_crew_join(uuid) to authenticated;
grant execute on function public.noxa_cancel_crew_join_request(uuid) to authenticated;
grant execute on function public.noxa_review_crew_join_request(uuid, boolean) to authenticated;
grant execute on function public.noxa_invite_to_crew(uuid, uuid) to authenticated;
