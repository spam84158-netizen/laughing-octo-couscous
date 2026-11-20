-- À exécuter après schema.sql et schema_part2.sql : FAQ, journal admin, retraits sécurisés (remboursement si refusé).
create table public.faq(id serial primary key, lang text not null default 'fr' check (lang in ('fr','en','es')), q text not null, a text not null, sort int default 0);
alter table public.faq enable row level security;
create policy faq_read on faq for select using (true);
create policy faq_admin on faq for all using (public.is_admin()) with check (public.is_admin());
create policy rw_admin on rewards for update using (public.is_admin());
create policy audit_ins on audit_log for insert with check (public.is_admin() and actor=auth.uid());
drop policy if exists wd_admin on withdrawals;  -- les changements de statut passent uniquement par la fonction ci-dessous
create or replace function public.admin_set_withdrawal(p_id uuid,p_status text) returns void language plpgsql security definer set search_path=public as $$
declare w withdrawals; begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if p_status not in ('pending','processing','approved','rejected','paid') then raise exception 'bad status'; end if;
  select * into w from withdrawals where id=p_id for update; if not found then return; end if;
  if w.status in ('rejected','paid') then raise exception 'statut final'; end if;
  if p_status='rejected' then update wallets set balance=balance+w.amount where user_id=w.user_id; end if;
  update withdrawals set status=p_status where id=p_id;
  insert into notifications(user_id,type,title,body) values(w.user_id,'withdrawal','Retrait : '||p_status,'Montant : '||w.amount||' USD');
  insert into audit_log(actor,action,target) values(auth.uid(),'withdrawal:'||p_status,p_id::text); end $$;
