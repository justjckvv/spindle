create function public.create_collector_crate(slug text, about text) returns text language plpgsql security definer set search_path='' as $$
declare key text;
begin
 if slug is null or slug !~ '^[A-Za-z][A-Za-z0-9]{1,30}$' or about is null or length(trim(about)) not between 1 and 160 then raise exception 'Use a 2–31 character crate name and a short description.'; end if;
 key := 'c/'||slug;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(lower(key)));
 if exists(select 1 from public.crates where lower(id)=lower(key)) then raise exception 'That crate already exists.'; end if;
 insert into public.crates(id,name,description) values(key,key,trim(about));
 return key;
end $$;
revoke all on function public.create_collector_crate(text,text) from public,anon;
grant execute on function public.create_collector_crate(text,text) to authenticated;
