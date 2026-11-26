-- Apply once in a new Supabase project.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[A-Za-z0-9_]{3,32}$'),
 joined_at timestamptz not null default now(),
 avatar_url text, now_spinning text not null default ''
);
create table public.shelf_items (
 id text primary key, user_id uuid not null references public.profiles(id) on delete cascade,
 artist text not null, album text not null, format text not null,
 condition text, open_to_trade boolean not null default false,
 payload jsonb not null, created_at timestamptz not null default now()
);
create table public.threads (
 id text primary key, user_id uuid not null references public.profiles(id) on delete cascade,
 crate text not null, title text not null, body text not null,
 payload jsonb not null, created_at timestamptz not null default now()
);
create table public.wantlist_items (
 id text primary key, user_id uuid not null references public.profiles(id) on delete cascade,
 payload jsonb not null
);
create table public.comments (
 id uuid primary key default gen_random_uuid(), thread_id text not null references public.threads(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check (length(body) between 1 and 10000), created_at timestamptz not null default now()
);
create table public.messages (
 id uuid primary key default gen_random_uuid(), sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check (length(body) between 1 and 4000), created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.shelf_items enable row level security;
alter table public.threads enable row level security;
alter table public.wantlist_items enable row level security;
alter table public.comments enable row level security;
alter table public.messages enable row level security;
create policy "read profiles" on public.profiles for select using (true);
create policy "own profile" on public.profiles for all to authenticated using (auth.uid()=id) with check (auth.uid()=id);
create policy "own shelf" on public.shelf_items for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own wantlist" on public.wantlist_items for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "read threads" on public.threads for select using (true);
create policy "own threads" on public.threads for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "read comments" on public.comments for select using (true);
create policy "own comments" on public.comments for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "read own messages" on public.messages for select to authenticated using (auth.uid()=sender_id or auth.uid()=recipient_id);
create policy "send own messages" on public.messages for insert to authenticated with check (auth.uid()=sender_id);
alter publication supabase_realtime add table public.threads, public.comments, public.messages;
