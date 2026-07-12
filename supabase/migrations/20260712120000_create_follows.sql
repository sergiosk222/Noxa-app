create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_pkey primary key (follower_id, following_id),
  constraint noxa_follows_no_self_follow check (follower_id <> following_id)
);

create index if not exists noxa_follows_following_created_at_idx
  on public.follows (following_id, created_at desc);

create index if not exists noxa_follows_follower_created_at_idx
  on public.follows (follower_id, created_at desc);

grant select, insert, delete on public.follows to authenticated;

alter table public.follows enable row level security;

drop policy if exists noxa_follows_authenticated_select on public.follows;
drop policy if exists noxa_follows_owner_insert on public.follows;
drop policy if exists noxa_follows_owner_delete on public.follows;

create policy noxa_follows_authenticated_select
  on public.follows
  for select
  to authenticated
  using (true);

create policy noxa_follows_owner_insert
  on public.follows
  for insert
  to authenticated
  with check (
    auth.uid() = follower_id
    and follower_id <> following_id
  );

create policy noxa_follows_owner_delete
  on public.follows
  for delete
  to authenticated
  using (auth.uid() = follower_id);
