create table public.buddies (
 id uuid primary key default gen_random_uuid(),
 requester uuid not null references public.profiles on delete cascade,
 recipient uuid not null references public.profiles on delete cascade,
 accepted boolean not null default false,
 check(requester <> recipient)
);
create unique index buddies_pair on public.buddies(least(requester, recipient), greatest(requester,recipient));
alter table public.buddies enable row level security;
revoke all on public.buddies from public, anon, authenticated;
grant select, insert(requester,recipient), update(accepted), delete on public.buddies to authenticated;
create policy participants on public.buddies for select to authenticated using(auth.uid() in (requester,recipient));
create policy request on public.buddies for insert to authenticated with check(auth.uid()=requester and not accepted);
create policy accept on public.buddies for update to authenticated using(auth.uid()=recipient and not accepted) with check(auth.uid()=recipient and accepted);
create policy remove on public.buddies for delete to authenticated using(auth.uid() in (requester,recipient));
create policy accepted_buddies on public.messages as restrictive for insert to authenticated with check(exists(select 1 from public.buddies b where b.accepted and ((b.requester=sender_id and b.recipient=recipient_id) or (b.recipient=sender_id and b.requester=recipient_id))));
alter publication supabase_realtime add table public.buddies;
create index messages_pair_time on public.messages(sender_id, recipient_id, created_at desc);
