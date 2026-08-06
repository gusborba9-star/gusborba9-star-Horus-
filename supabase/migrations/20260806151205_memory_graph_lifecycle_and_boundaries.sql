create extension if not exists vector;
create table if not exists public.memory_graph_nodes (
  id uuid primary key default gen_random_uuid(), node_type text not null check (node_type in ('operational_event','core_knowledge','human_feedback')),
  content text not null check (length(trim(content)) > 0), embedding vector, importance numeric not null default 0.5 check (importance >= 0),
  metadata jsonb not null default '{}'::jsonb, owner_scope text not null default 'SYSTEM' check (owner_scope in ('SYSTEM','USER','ORGANIZATION')),
  user_id uuid references auth.users(id) on delete cascade, organization_id uuid references public.organizations(id) on delete cascade,
  lifecycle_state text not null default 'ACTIVE' check (lifecycle_state in ('ACTIVE','STALE','EXPIRED','PRUNED')),
  last_accessed_at timestamptz, retrieval_count bigint not null default 0 check (retrieval_count >= 0), expires_at timestamptz,
  invalidated_at timestamptz, pruned_at timestamptz, compressed_content text, content_hash text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint memory_graph_nodes_owner_scope_ck check ((owner_scope = 'SYSTEM' and user_id is null and organization_id is null) or (owner_scope = 'USER' and user_id is not null) or (owner_scope = 'ORGANIZATION' and organization_id is not null))
);
create index if not exists memory_graph_nodes_user_active_idx on public.memory_graph_nodes (user_id, lifecycle_state, expires_at, created_at desc) where owner_scope = 'USER';
create index if not exists memory_graph_nodes_org_active_idx on public.memory_graph_nodes (organization_id, lifecycle_state, expires_at, created_at desc) where owner_scope = 'ORGANIZATION';
create index if not exists memory_graph_nodes_system_active_idx on public.memory_graph_nodes (lifecycle_state, expires_at, created_at desc) where owner_scope = 'SYSTEM';
create index if not exists memory_graph_nodes_hash_idx on public.memory_graph_nodes (content_hash);
create or replace function public.memory_graph_touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); if new.content_hash = '' then new.content_hash = md5(new.content); end if; return new; end; $$;
drop trigger if exists memory_graph_nodes_touch_updated_at on public.memory_graph_nodes;
create trigger memory_graph_nodes_touch_updated_at before insert or update on public.memory_graph_nodes for each row execute function public.memory_graph_touch_updated_at();
create or replace function public.match_memory_nodes(query_embedding jsonb, match_threshold double precision default 0.80, match_count integer default 5, requested_user_id uuid default null, requested_organization_id uuid default null, include_cold boolean default false)
returns table (id uuid,node_type text,content text,embedding jsonb,importance numeric,metadata jsonb,owner_scope text,user_id uuid,organization_id uuid,lifecycle_state text,similarity double precision,context_tier text,created_at timestamptz,expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare query_vector vector := query_embedding::text::vector;
begin
  if match_threshold < 0 or match_threshold > 1 then raise exception 'INVALID_MEMORY_THRESHOLD'; end if;
  if match_count < 1 or match_count > 50 then raise exception 'INVALID_MEMORY_LIMIT'; end if;
  with candidates as (
    select m.id, 1-(m.embedding <=> query_vector) as similarity,
      case when coalesce(m.last_accessed_at,m.created_at)>=now()-interval '7 days' or m.retrieval_count>=3 then 'HOT' else 'COLD' end as context_tier
    from public.memory_graph_nodes m
    where m.embedding is not null and m.invalidated_at is null and (m.expires_at is null or m.expires_at>now()) and m.lifecycle_state='ACTIVE'
      and (m.owner_scope='SYSTEM' or (m.owner_scope='USER' and requested_user_id is not null and m.user_id=requested_user_id) or (m.owner_scope='ORGANIZATION' and requested_organization_id is not null and m.organization_id=requested_organization_id))
      and 1-(m.embedding <=> query_vector)>=match_threshold
      and (include_cold or coalesce(m.last_accessed_at,m.created_at)>=now()-interval '7 days' or m.retrieval_count>=3)
    order by (1-(m.embedding <=> query_vector)) desc,m.importance desc,m.retrieval_count desc,m.created_at desc limit match_count
  ), touched as (update public.memory_graph_nodes m set last_accessed_at=now(),retrieval_count=m.retrieval_count+1 from candidates c where m.id=c.id returning m.id)
  select m.id,m.node_type,m.content,case when m.embedding is null then null else to_jsonb(m.embedding::text) end,m.importance,m.metadata,m.owner_scope,m.user_id,m.organization_id,m.lifecycle_state,c.similarity,c.context_tier,m.created_at,m.expires_at
  from candidates c join public.memory_graph_nodes m on m.id=c.id order by c.similarity desc,m.importance desc,m.retrieval_count desc,m.created_at desc;
end; $$;
create or replace function public.prune_memory_graph(stale_after interval default interval '30 days',prune_after interval default interval '90 days',minimum_importance numeric default 0.15,max_rows integer default 500)
returns table(stale_count integer,expired_count integer,pruned_count integer,duplicate_count integer)
language plpgsql security definer set search_path=public as $$
declare stale_count_local integer:=0;expired_count_local integer:=0;pruned_count_local integer:=0;duplicate_count_local integer:=0;
begin
  if stale_after <= interval '0 seconds' or prune_after <= stale_after or max_rows < 1 then raise exception 'INVALID_MEMORY_PRUNING_POLICY'; end if;
  update public.memory_graph_nodes set lifecycle_state='EXPIRED',updated_at=now() where lifecycle_state='ACTIVE' and expires_at is not null and expires_at<=now(); get diagnostics expired_count_local=row_count;
  with candidates as (select id from public.memory_graph_nodes where lifecycle_state='ACTIVE' and coalesce(last_accessed_at,created_at)<now()-stale_after and importance<0.50 and retrieval_count=0 and (expires_at is null or expires_at>now()) order by coalesce(last_accessed_at,created_at) asc limit max_rows)
  update public.memory_graph_nodes m set lifecycle_state='STALE',updated_at=now() from candidates c where m.id=c.id; get diagnostics stale_count_local=row_count;
  with ranked as (select id,row_number() over(partition by content_hash,owner_scope,coalesce(user_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(organization_id,'00000000-0000-0000-0000-000000000000'::uuid) order by importance desc,retrieval_count desc,created_at desc) rn from public.memory_graph_nodes where lifecycle_state in('ACTIVE','STALE') and content_hash<>'')
  update public.memory_graph_nodes m set lifecycle_state='PRUNED',pruned_at=now(),updated_at=now() from ranked r where m.id=r.id and r.rn>1; get diagnostics duplicate_count_local=row_count;
  with candidates as (select id from public.memory_graph_nodes where lifecycle_state in('STALE','EXPIRED') and coalesce(last_accessed_at,created_at)<now()-prune_after and importance<minimum_importance order by coalesce(last_accessed_at,created_at) asc limit max_rows)
  update public.memory_graph_nodes m set lifecycle_state='PRUNED',pruned_at=now(),updated_at=now() from candidates c where m.id=c.id; get diagnostics pruned_count_local=row_count;
  return query select stale_count_local,expired_count_local,pruned_count_local,duplicate_count_local;
end; $$;
revoke all on function public.match_memory_nodes(jsonb,double precision,integer,uuid,uuid,boolean) from public,anon,authenticated; grant execute on function public.match_memory_nodes(jsonb,double precision,integer,uuid,uuid,boolean) to service_role;
revoke all on function public.prune_memory_graph(interval,interval,numeric,integer) from public,anon,authenticated; grant execute on function public.prune_memory_graph(interval,interval,numeric,integer) to service_role;
alter table public.memory_graph_nodes enable row level security;
drop policy if exists memory_graph_nodes_select on public.memory_graph_nodes;
create policy memory_graph_nodes_select on public.memory_graph_nodes for select using (owner_scope='SYSTEM' or (owner_scope='USER' and user_id=auth.uid()) or (owner_scope='ORGANIZATION' and organization_id in(select om.organization_id from public.organization_memberships om where om.user_id=auth.uid())));
drop policy if exists memory_graph_nodes_insert on public.memory_graph_nodes;
create policy memory_graph_nodes_insert on public.memory_graph_nodes for insert with check ((owner_scope='SYSTEM' and auth.role()='service_role') or (owner_scope='USER' and user_id=auth.uid()) or (owner_scope='ORGANIZATION' and organization_id in(select om.organization_id from public.organization_memberships om where om.user_id=auth.uid())));
drop policy if exists memory_graph_nodes_update on public.memory_graph_nodes;
create policy memory_graph_nodes_update on public.memory_graph_nodes for update using ((owner_scope='SYSTEM' and auth.role()='service_role') or (owner_scope='USER' and user_id=auth.uid()) or (owner_scope='ORGANIZATION' and organization_id in(select om.organization_id from public.organization_memberships om where om.user_id=auth.uid()))) with check ((owner_scope='SYSTEM' and auth.role()='service_role') or (owner_scope='USER' and user_id=auth.uid()) or (owner_scope='ORGANIZATION' and organization_id in(select om.organization_id from public.organization_memberships om where om.user_id=auth.uid())));
drop policy if exists memory_graph_nodes_delete on public.memory_graph_nodes;
create policy memory_graph_nodes_delete on public.memory_graph_nodes for delete using ((owner_scope='SYSTEM' and auth.role()='service_role') or (owner_scope='USER' and user_id=auth.uid()) or (owner_scope='ORGANIZATION' and organization_id in(select om.organization_id from public.organization_memberships om where om.user_id=auth.uid())));