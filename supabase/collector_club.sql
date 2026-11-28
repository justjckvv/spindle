alter table public.profiles add column away_message text not null default '' check(length(away_message)<=160);
insert into public.crates(id,name,description) values
('c/DungeonSynth','c/DungeonSynth','Dungeon synth tapes and atmospheric releases'),
('c/MidwestEmo','c/MidwestEmo','Midwest emo pressings and local scenes'),
('c/PostPunk','c/PostPunk','Post-punk records and reissues'),
('c/CassetteCulture','c/CassetteCulture','Tape collecting, dubbing and decks') on conflict(id) do nothing;

create table public.mixtape_burns(thread_id text references public.threads on delete cascade, member uuid default auth.uid() references public.profiles on delete cascade, primary key(thread_id,member));
alter table public.mixtape_burns enable row level security;
revoke all on public.mixtape_burns from public,anon,authenticated;
grant select on public.mixtape_burns to authenticated,anon;
grant insert(thread_id),delete on public.mixtape_burns to authenticated;
create policy read_burns on public.mixtape_burns for select using(true);
create policy give_burn on public.mixtape_burns for insert with check(member=auth.uid() and exists(select 1 from public.threads t where t.id=thread_id and t.user_id<>auth.uid()));
create policy undo_burn on public.mixtape_burns for delete using(member=auth.uid());

create table public.runouts(id uuid primary key default gen_random_uuid(),release_id bigint not null check(release_id>0),mark text not null check(length(trim(mark)) between 1 and 160),member uuid default auth.uid() references public.profiles on delete cascade);
create unique index runout_release_mark on public.runouts(release_id,upper(trim(mark)));
alter table public.runouts enable row level security;
revoke all on public.runouts from public,anon,authenticated;
grant select on public.runouts to authenticated;
grant insert(release_id,mark) on public.runouts to authenticated;
create policy browse_marks on public.runouts for select using(true);
create policy contribute_mark on public.runouts for insert with check(member=auth.uid());

create table public.trade_receipts(id uuid primary key default gen_random_uuid(),sender uuid not null default auth.uid() references public.profiles on delete cascade,recipient uuid not null references public.profiles on delete cascade,terms text not null check(length(trim(terms)) between 1 and 240),confirmed boolean not null default false,created_at timestamptz not null default now(),check(sender<>recipient));
alter table public.trade_receipts enable row level security;
revoke all on public.trade_receipts from public,anon,authenticated;
grant select,insert(recipient,terms),update(confirmed) on public.trade_receipts to authenticated;
create policy read_receipt on public.trade_receipts for select using(auth.uid() in(sender,recipient));
create policy log_trade on public.trade_receipts for insert with check(sender=auth.uid() and exists(select 1 from public.buddies b where b.accepted and ((b.requester=auth.uid() and b.recipient=trade_receipts.recipient) or (b.recipient=auth.uid() and b.requester=trade_receipts.recipient))));
create policy confirm_trade on public.trade_receipts for update using(recipient=auth.uid() and not confirmed) with check(confirmed);
create table public.trade_feedback(receipt_id uuid references public.trade_receipts on delete cascade,reviewer uuid default auth.uid() references public.profiles on delete cascade,subject uuid not null references public.profiles on delete cascade,rating text not null check(rating in('Positive','Neutral','Negative')),primary key(receipt_id,reviewer));
alter table public.trade_feedback enable row level security;
revoke all on public.trade_feedback from public,anon,authenticated;
grant select,insert(receipt_id,subject,rating) on public.trade_feedback to authenticated;
create policy see_ratings on public.trade_feedback for select using(true);
create policy rate_trade on public.trade_feedback for insert with check(reviewer=auth.uid() and exists(select 1 from public.trade_receipts t where t.id=receipt_id and t.confirmed and ((t.sender=reviewer and t.recipient=subject) or (t.recipient=reviewer and t.sender=subject))));

create table public.room_tracks(id text primary key,title text not null,seconds integer not null check(seconds>0));
insert into public.room_tracks values ('neon','Neon Dialtone',48),('midnight','Midnight Terminal',48),('glass','Glass Satellites',48);
create table public.dj_slots(member uuid references public.profiles on delete cascade,starts timestamptz primary key,ends timestamptz not null);
create table public.room_queue(id uuid primary key default gen_random_uuid(),member uuid references public.profiles on delete set null,track text references public.room_tracks,starts timestamptz not null,ends timestamptz not null);
alter table public.room_tracks enable row level security;
alter table public.dj_slots enable row level security;
alter table public.room_queue enable row level security;
revoke all on public.room_tracks,public.dj_slots,public.room_queue from public,authenticated,anon;
grant select on public.room_tracks,public.dj_slots,public.room_queue to authenticated;
create policy room_catalog on public.room_tracks for select using(true);
create policy room_djs on public.dj_slots for select using(true);
create policy room_list on public.room_queue for select using(true);
create function public.join_dj_rotation() returns void language plpgsql security definer set search_path='' as $$
declare start_time timestamptz;
begin
 perform pg_catalog.pg_advisory_xact_lock(471109);
 if exists(select 1 from public.dj_slots where member=auth.uid() and ends>now()) then return; end if;
 select greatest(now(),max(ends)) into start_time from public.dj_slots;
 insert into public.dj_slots values(auth.uid(),start_time,start_time+interval '1 hour');
end $$;
create function public.queue_room_track(track_id text) returns void language plpgsql security definer set search_path='' as $$
declare start_time timestamptz; deadline timestamptz; duration integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(471109);
 select ends into deadline from public.dj_slots where member=auth.uid() and starts<=now() and ends>now();
 if deadline is null then raise exception 'Wait for your DJ turn.'; end if;
 select seconds into strict duration from public.room_tracks where id=track_id;
 select greatest(now(),max(ends)) into start_time from public.room_queue;
 if start_time+duration*interval '1 second'>deadline then raise exception 'The track would exceed your DJ turn.'; end if;
 insert into public.room_queue(member,track,starts,ends) values(auth.uid(),track_id,start_time,start_time+duration*interval '1 second');
end $$;
create function public.room_clock() returns timestamptz language sql stable as $$ select now() $$;
revoke all on function public.join_dj_rotation(),public.queue_room_track(text),public.room_clock() from public,anon;
grant execute on function public.join_dj_rotation(),public.queue_room_track(text),public.room_clock() to authenticated;
create function public.wanted_pressings(release_ids text[]) returns table(title text,release_id text) language sql stable security invoker set search_path='' as $$
select distinct w.payload->>'title',w.payload->>'discogsId' from public.wantlist_items w where w.user_id=auth.uid() and w.payload->>'discogsId'=any(release_ids)
$$;
revoke all on function public.wanted_pressings(text[]) from public,anon;
grant execute on function public.wanted_pressings(text[]) to authenticated;
create function public.collector_scores(who uuid) returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object('points',(select count(*) from public.mixtape_burns b join public.threads t on t.id=b.thread_id where t.user_id=who),'Positive',count(*) filter(where rating='Positive'),'Neutral',count(*) filter(where rating='Neutral'),'Negative',count(*) filter(where rating='Negative')) from public.trade_feedback where subject=who
$$;
revoke all on function public.collector_scores(uuid) from public,anon;
grant execute on function public.collector_scores(uuid) to authenticated;
