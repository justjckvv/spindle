create table public.crates(id text primary key, name text not null, description text not null);
alter table public.crates enable row level security;
create policy browse_crates on public.crates for select using(true);
grant select on public.crates to anon,authenticated;
insert into public.crates values
('c/Albums','c/Albums','Album discussions and reviews'),('c/Songs','c/Songs','Track discussions'),('c/Shoegaze','c/Shoegaze','Shoegaze records'),('c/Digging','c/Digging','Crate digging'),('c/Lyrics','c/Lyrics','Lyric discussions'),('c/BlindRatings','c/BlindRatings','Rate a mystery pressing before revealing it');
alter table public.profiles add column last_active_at timestamptz;
