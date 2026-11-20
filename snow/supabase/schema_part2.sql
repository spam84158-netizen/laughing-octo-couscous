-- À exécuter APRÈS schema.sql : stickers, stockage d'images, jointure de groupes, et correction de récursion RLS.
create or replace function public.is_member(gid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from group_members where group_id=gid and user_id=auth.uid()) $$;
drop policy if exists gm_read on group_members;
create policy gm_read on group_members for select using (user_id=auth.uid() or public.is_member(group_id) or public.is_mod());
drop policy if exists g_read on groups;
create policy g_read on groups for select using (kind in ('public','official') or created_by=auth.uid() or public.is_member(id) or public.is_mod());
drop policy if exists m_read on messages;
create policy m_read on messages for select using (not deleted and ((group_id is not null and public.is_member(group_id)) or sender=auth.uid() or dm_to=auth.uid()) or public.is_mod());
drop policy if exists m_ins on messages;
create policy m_ins on messages for insert with check (sender=auth.uid() and not exists(select 1 from profiles where id=auth.uid() and suspended) and (group_id is null or public.is_member(group_id)) and not exists(select 1 from blocks b where b.blocker=messages.dm_to and b.blocked=auth.uid()));
create policy gm_join on group_members for insert with check (user_id=auth.uid() and exists(select 1 from groups g where g.id=group_id and (g.kind='public' or g.created_by=auth.uid())));
create policy rx_read on reactions for select using (auth.uid() is not null);
create table public.stickers(id uuid primary key default gen_random_uuid(), owner uuid references profiles on delete cascade, url text not null, category text default 'custom', created_at timestamptz default now());
alter table public.stickers enable row level security;
create policy s_read on stickers for select using (auth.uid() is not null);
create policy s_ins on stickers for insert with check (owner=auth.uid());
create policy s_del on stickers for delete using (owner=auth.uid() or public.is_mod());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',true,5242880,array['image/png','image/jpeg','image/webp','image/gif']) on conflict do nothing;
create policy media_up on storage.objects for insert to authenticated with check (bucket_id='media' and (storage.foldername(name))[1]=auth.uid()::text);
create policy media_read on storage.objects for select using (bucket_id='media');
create policy media_del on storage.objects for delete to authenticated using (bucket_id='media' and (storage.foldername(name))[1]=auth.uid()::text);
