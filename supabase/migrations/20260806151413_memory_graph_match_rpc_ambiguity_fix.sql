create or replace function public.match_memory_nodes(query_embedding jsonb, match_threshold double precision default 0.80, match_count integer default 5, requested_user_id uuid default null, requested_organization_id uuid default null, include_cold boolean default false)
returns table (id uuid,node_type text,content text,embedding jsonb,importance numeric,metadata jsonb,owner_scope text,user_id uuid,organization_id uuid,lifecycle_state text,similarity double precision,context_tier text,created_at timestamptz,expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare query_vector vector := query_embedding::text::vector;
begin
  if match_threshold < 0 or match_threshold > 1 then raise exception 'INVALID_MEMORY_THRESHOLD'; end if;
  if match_count < 1 or match_count > 50 then raise exception 'INVALID_MEMORY_LIMIT'; end if;
  with candidates as (
    select m.id as candidate_id
    from public.memory_graph_nodes m
    where m.embedding is not null and m.invalidated_at is null and (m.expires_at is null or m.expires_at > now()) and m.lifecycle_state='ACTIVE'
      and (m.owner_scope='SYSTEM' or (m.owner_scope='USER' and requested_user_id is not null and m.user_id=requested_user_id) or (m.owner_scope='ORGANIZATION' and requested_organization_id is not null and m.organization_id=requested_organization_id))
      and 1-(m.embedding <=> query_vector) >= match_threshold
      and (include_cold or coalesce(m.last_accessed_at,m.created_at)>=now()-interval '7 days' or m.retrieval_count>=3)
    order by (1-(m.embedding <=> query_vector)) desc,m.importance desc,m.retrieval_count desc,m.created_at desc limit match_count
  ), touched as (
    update public.memory_graph_nodes m set last_accessed_at=now(),retrieval_count=m.retrieval_count+1 from candidates c where m.id=c.candidate_id returning m.id
  )
  return query
  select m.id,m.node_type,m.content,case when m.embedding is null then null else to_jsonb(m.embedding::text) end,m.importance,m.metadata,m.owner_scope,m.user_id,m.organization_id,m.lifecycle_state,
    1-(m.embedding <=> query_vector),
    case when coalesce(m.last_accessed_at,m.created_at)>=now()-interval '7 days' or m.retrieval_count>=1 then 'HOT' else 'COLD' end,
    m.created_at,m.expires_at
  from candidates c join public.memory_graph_nodes m on m.id=c.candidate_id
  order by (1-(m.embedding <=> query_vector)) desc,m.importance desc,m.retrieval_count desc,m.created_at desc;
end; $$;
revoke all on function public.match_memory_nodes(jsonb,double precision,integer,uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.match_memory_nodes(jsonb,double precision,integer,uuid,uuid,boolean) to service_role;