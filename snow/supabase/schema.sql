-- Snow Cloud Chek — schéma Supabase (à exécuter dans SQL Editor). RLS activée partout.
create extension if not exists pgcrypto;
create table public.profiles(id uuid primary key references auth.users on delete cascade, username text unique not null, display_name text, avatar_url text, bio text,
  role text not null default 'member' check (role in ('admin','moderator','member')), badge text, suspended boolean not null default false, lang text default 'fr', settings jsonb default '{}', created_at timestamptz default now());
create table public.groups(id uuid primary key default gen_random_uuid(), name text not null, description text, avatar_url text, banner_url text,
  kind text not null default 'public' check (kind in ('public','private','invite','official')), is_general boolean default false, created_by uuid references profiles, created_at timestamptz default now());
create table public.group_members(group_id uuid references groups on delete cascade, user_id uuid references profiles on delete cascade, role text default 'member', joined_at timestamptz default now(), primary key(group_id,user_id));
create table public.messages(id uuid primary key default gen_random_uuid(), group_id uuid references groups on delete cascade, dm_to uuid references profiles, sender uuid not null references profiles,
  body text check (length(body)<=4000), kind text default 'text' check (kind in ('text','image','file','sticker')), media_url text, reply_to uuid references messages, edited_at timestamptz, deleted boolean default false, created_at timestamptz default now(),
  check ((group_id is null) <> (dm_to is null)));
create index on messages(group_id,created_at desc); create index on messages(dm_to,sender,created_at desc);
create table public.reactions(message_id uuid references messages on delete cascade, user_id uuid references profiles, emoji text, primary key(message_id,user_id,emoji));
create table public.reports(id uuid primary key default gen_random_uuid(), reporter uuid references profiles, message_id uuid references messages, reason text, status text default 'open', created_at timestamptz default now());
create table public.blocks(blocker uuid references profiles, blocked uuid references profiles, primary key(blocker,blocked));
create table public.notifications(id uuid primary key default gen_random_uuid(), user_id uuid references profiles on delete cascade, type text, title text, body text, read boolean default false, created_at timestamptz default now());
create table public.checks(id uuid primary key default gen_random_uuid(), user_id uuid references profiles, number text not null, status text not null check (status in ('not_banned','banned','undetermined','unavailable')), reason text, created_at timestamptz default now());
create index on checks(user_id,number,created_at desc);
create table public.wallets(user_id uuid primary key references profiles, balance numeric(10,2) not null default 0 check (balance>=0), total_earned numeric(10,2) not null default 0);
create table public.rewards(id uuid primary key default gen_random_uuid(), user_id uuid references profiles, check_id uuid unique references checks, number_hash text, amount numeric(10,2) not null default 0.50, status text default 'pending' check (status in ('pending','approved','rejected')), created_at timestamptz default now());
create unique index one_reward_per_number on rewards(number_hash);  -- un numéro ne rapporte qu'une seule fois, tous comptes confondus
create table public.withdrawals(id uuid primary key default gen_random_uuid(), user_id uuid references profiles, amount numeric(10,2) not null check (amount>=25), method text not null, details text, status text default 'pending' check (status in ('pending','processing','approved','rejected','paid')), created_at timestamptz default now(), note text);
create table public.audit_log(id bigserial primary key, actor uuid, action text, target text, meta jsonb, created_at timestamptz default now());
create table public.channels(id serial primary key, category text, name text, description text, logo text, url text, sort int default 0, active boolean default true);
create table public.announcements(id serial primary key, title text, body text, created_at timestamptz default now());

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public,auth as $$
  select exists(select 1 from auth.users u where u.id=auth.uid() and lower(u.email)='yureijianyu@gmail.com' and u.email_confirmed_at is not null) $$;
create or replace function public.is_mod() returns boolean language sql stable security definer set search_path=public as $$
  select public.is_admin() or exists(select 1 from profiles where id=auth.uid() and role='moderator' and not suspended) $$;

-- Inscription : profil + groupe général + notification de bienvenue (idempotent)
create or replace function public.on_signup() returns trigger language plpgsql security definer set search_path=public as $$
declare g uuid; uname text; begin
  uname := lower(regexp_replace(coalesce(split_part(new.email,'@',1),'user'),'[^a-z0-9_]','','g'))||'_'||substr(replace(new.id::text,'-',''),1,5);
  insert into profiles(id,username,display_name,avatar_url,role,badge) values(new.id,uname,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)),new.raw_user_meta_data->>'avatar_url',
    case when lower(new.email)='yureijianyu@gmail.com' then 'admin' else 'member' end, case when lower(new.email)='yureijianyu@gmail.com' then 'admin' end) on conflict do nothing;
  insert into wallets(user_id) values(new.id) on conflict do nothing;
  select id into g from groups where is_general limit 1;
  if g is not null then insert into group_members(group_id,user_id) values(g,new.id) on conflict do nothing; end if;
  insert into notifications(user_id,type,title,body) values(new.id,'welcome','Bienvenue sur Snow Cloud Chek','Vous avez rejoint la communauté générale.');
  return new; end $$;
create trigger t_signup after insert on auth.users for each row execute function public.on_signup();
insert into groups(name,description,kind,is_general) values('Communauté générale','Groupe principal de Snow Cloud Chek','official',true);

-- Récompense : serveur seulement. 0,50 USD si le DERNIER statut connu du même numéro (par cet utilisateur) était non banni et que le nouveau est banni.
create or replace function public.claim_reward(p_check uuid) returns text language plpgsql security definer set search_path=public as $$
declare c checks; prev checks; h text; begin
  select * into c from checks where id=p_check and user_id=auth.uid(); if not found or c.status<>'banned' then return 'not_eligible'; end if;
  select * into prev from checks where user_id=c.user_id and number=c.number and created_at<c.created_at and status in ('not_banned','banned') order by created_at desc limit 1;
  if not found or prev.status<>'not_banned' or c.created_at-prev.created_at < interval '24 hours' then return 'not_eligible'; end if;
  h := encode(digest(c.number,'sha256'),'hex');
  insert into rewards(user_id,check_id,number_hash,status) values(c.user_id,c.id,h,'pending') on conflict do nothing;
  if not found then return 'duplicate'; end if; return 'pending_review'; end $$;
create or replace function public.approve_reward(p_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare r rewards; begin if not is_admin() then raise exception 'forbidden'; end if;
  update rewards set status='approved' where id=p_id and status='pending' returning * into r; if not found then return; end if;
  update wallets set balance=balance+r.amount,total_earned=total_earned+r.amount where user_id=r.user_id;
  insert into audit_log(actor,action,target) values(auth.uid(),'approve_reward',p_id::text); end $$;
create or replace function public.request_withdrawal(p_amount numeric,p_method text,p_details text) returns uuid language plpgsql security definer set search_path=public as $$
declare w uuid; begin if p_amount<25 then raise exception 'min 25 USD'; end if;
  update wallets set balance=balance-p_amount where user_id=auth.uid() and balance>=p_amount; if not found then raise exception 'solde insuffisant'; end if;
  insert into withdrawals(user_id,amount,method,details) values(auth.uid(),p_amount,p_method,p_details) returning id into w; return w; end $$;

-- RLS
do $$ declare t text; begin for t in select unnest(array['profiles','groups','group_members','messages','reactions','reports','blocks','notifications','checks','wallets','rewards','withdrawals','audit_log','channels','announcements']) loop execute format('alter table public.%I enable row level security',t); end loop; end $$;
create policy p_read on profiles for select using (auth.uid() is not null);
create policy p_upd on profiles for update using (id=auth.uid()) with check (id=auth.uid() and role=(select role from profiles where id=auth.uid()) and badge is not distinct from (select badge from profiles where id=auth.uid()) and not suspended);
create policy p_admin on profiles for all using (is_admin()) with check (is_admin());
create policy g_read on groups for select using (kind in ('public','official') or exists(select 1 from group_members m where m.group_id=id and m.user_id=auth.uid()) or is_mod());
create policy g_ins on groups for insert with check (created_by=auth.uid() and not is_general and kind<>'official');
create policy g_mod on groups for all using (is_mod()) with check (is_mod());
create policy gm_read on group_members for select using (user_id=auth.uid() or exists(select 1 from group_members x where x.group_id=group_id and x.user_id=auth.uid()) or is_mod());
create policy gm_leave on group_members for delete using (user_id=auth.uid() or is_mod());
create policy m_read on messages for select using (not deleted and ((group_id is not null and exists(select 1 from group_members x where x.group_id=messages.group_id and x.user_id=auth.uid())) or sender=auth.uid() or dm_to=auth.uid()) or is_mod());
create policy m_ins on messages for insert with check (sender=auth.uid() and not exists(select 1 from profiles where id=auth.uid() and suspended) and (group_id is null or exists(select 1 from group_members x where x.group_id=messages.group_id and x.user_id=auth.uid())) and not exists(select 1 from blocks b where b.blocker=messages.dm_to and b.blocked=auth.uid()));
create policy m_upd on messages for update using (sender=auth.uid() or is_mod());
create policy r_all on reactions for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy rp_ins on reports for insert with check (reporter=auth.uid()); create policy rp_mod on reports for all using (is_mod());
create policy b_all on blocks for all using (blocker=auth.uid()) with check (blocker=auth.uid());
create policy n_own on notifications for select using (user_id=auth.uid()); create policy n_upd on notifications for update using (user_id=auth.uid());
create policy c_own on checks for select using (user_id=auth.uid() or is_admin()); create policy c_ins on checks for insert with check (user_id=auth.uid());
create policy w_own on wallets for select using (user_id=auth.uid() or is_admin());   -- aucune écriture client
create policy rw_own on rewards for select using (user_id=auth.uid() or is_admin());
create policy wd_own on withdrawals for select using (user_id=auth.uid() or is_admin()); create policy wd_admin on withdrawals for update using (is_admin());
create policy a_admin on audit_log for select using (is_admin());
create policy ch_read on channels for select using (true); create policy ch_admin on channels for all using (is_admin());
create policy an_read on announcements for select using (true); create policy an_admin on announcements for all using (is_mod());
insert into channels(category,name,description,url,sort) values
 ('Communautés','Chaîne WhatsApp','Annonces officielles','https://whatsapp.com/channel/0029VbDkVUS5Ui2gyY7hmE0Y',1),
 ('Communautés','Canal Telegram','Aldetic Ltd','https://t.me/Aldetic_Ltd',2),
 ('Communautés','Groupe Telegram','Aldetic Chat','https://t.me/AldeticChat',3),
 ('Communautés','Groupe Telegram','Aldetic Bio','https://t.me/AldeticBio',4),
 ('Développement','Seen Angel','Développeur sur Telegram','https://t.me/Seen_Angel',5);
