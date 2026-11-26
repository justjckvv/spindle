create index if not exists shelf_trade_discogs on public.shelf_items ((payload->>'discogsId'), user_id) where open_to_trade;
create or replace function public.my_trade_matches()
returns table(wanted_id text, buddy_id uuid, screen_name text, item_condition text, shelf_id text)
language sql stable security definer set search_path = '' as $$
 select w.id, s.user_id, p.username, s.condition, s.id
 from public.wantlist_items w
 join public.shelf_items s on s.open_to_trade and s.payload->>'discogsId'=w.payload->>'discogsId'
 join public.profiles p on p.id=s.user_id
 where w.user_id=(select auth.uid()) and (w.payload->>'discogsId') ~ '^[1-9][0-9]*$'
 and exists(select 1 from public.buddies b where b.accepted and
 ((b.requester=w.user_id and b.recipient=s.user_id) or (b.recipient=w.user_id and b.requester=s.user_id)))
 order by p.username,s.id
$$;
revoke all on function public.my_trade_matches() from public,anon;
grant execute on function public.my_trade_matches() to authenticated;
