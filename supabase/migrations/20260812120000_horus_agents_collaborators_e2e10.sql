create table if not exists public.horus_collaborators (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  description text not null default '',
  role text not null,
  specialization text not null default '',
  personality jsonb not null default '{}'::jsonb,
  objectives jsonb not null default '[]'::jsonb,
  instructions text not null default '',
  memory_scope jsonb not null default '{"working":true,"episodic":true,"semantic":true,"organizational":true}'::jsonb,
  knowledge_sources jsonb not null default '[]'::jsonb,
  tool_policy jsonb not null default '{"read":true,"suggest":true,"prepare":true,"execute":false}'::jsonb,
  connector_policy jsonb not null default '{}'::jsonb,
  execution_policy jsonb not null default '{"max_steps":3,"max_tool_calls":0,"timeout_seconds":120}'::jsonb,
  economic_policy_version bigint not null references public.economic_policy_versions(version),
  autonomy_level text not null default 'SUGGEST',
  preferred_provider_id text,
  preferred_model_id text,
  fallback_policy jsonb not null default '{"enabled":true,"max_fallbacks":1}'::jsonb,
  status text not null default 'ACTIVE',
  version integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint horus_collaborators_slug_check check (slug ~ '^[a-z0-9][a-z0-9_-]{1,79}$'),
  constraint horus_collaborators_name_check check (length(trim(name)) between 1 and 160),
  constraint horus_collaborators_status_check check (status in ('DRAFT','ACTIVE','PAUSED','ARCHIVED')),
  constraint horus_collaborators_autonomy_check check (autonomy_level in ('READ','SUGGEST','PREPARE','EXECUTE','AUTONOMOUS')),
  constraint horus_collaborators_version_check check (version > 0)
);
create unique index if not exists horus_collaborators_owner_slug_key on public.horus_collaborators(owner_user_id, slug) where organization_id is null;
create unique index if not exists horus_collaborators_org_slug_key on public.horus_collaborators(organization_id, slug) where organization_id is not null;
create index if not exists horus_collaborators_owner_idx on public.horus_collaborators(owner_user_id, updated_at desc);
create index if not exists horus_collaborators_org_idx on public.horus_collaborators(organization_id, updated_at desc);
create index if not exists horus_collaborators_status_idx on public.horus_collaborators(status) where status = 'ACTIVE';

create table if not exists public.horus_collaborator_capabilities (
  collaborator_id uuid not null references public.horus_collaborators(id) on delete cascade,
  capability_id text not null references public.capabilities(id) on delete restrict,
  enabled boolean not null default true,
  policy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collaborator_id, capability_id)
);
create index if not exists horus_collaborator_capabilities_capability_idx on public.horus_collaborator_capabilities(capability_id, enabled);

create table if not exists public.horus_collaborator_versions (
  id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references public.horus_collaborators(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (collaborator_id, version),
  constraint horus_collaborator_versions_version_check check (version > 0)
);
create index if not exists horus_collaborator_versions_collaborator_idx on public.horus_collaborator_versions(collaborator_id, version desc);

create table if not exists public.horus_collaborator_executions (
  id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references public.horus_collaborators(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  parent_execution_id uuid references public.horus_collaborator_executions(id) on delete set null,
  intent text not null,
  capability_id text not null references public.capabilities(id),
  provider_id text references public.providers(id),
  model_id text,
  status text not null default 'QUEUED',
  policy_decision jsonb not null default '{}'::jsonb,
  memory_context jsonb not null default '[]'::jsonb,
  budget_id uuid references public.execution_budgets(id),
  attempt_id uuid references public.execution_attempts(id),
  execution_log_id uuid references public.horus_execution_logs(id),
  idempotency_key text not null,
  request_hash text not null,
  result jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id, idempotency_key),
  constraint horus_collaborator_executions_intent_check check (length(trim(intent)) between 1 and 20000),
  constraint horus_collaborator_executions_status_check check (status in ('QUEUED','AUTHORIZED','RUNNING','SUCCEEDED','FAILED','CANCELED','BLOCKED'))
);
create index if not exists horus_collaborator_executions_owner_idx on public.horus_collaborator_executions(owner_user_id, created_at desc);
create index if not exists horus_collaborator_executions_collaborator_idx on public.horus_collaborator_executions(collaborator_id, created_at desc);
create index if not exists horus_collaborator_executions_parent_idx on public.horus_collaborator_executions(parent_execution_id);
create index if not exists horus_collaborator_executions_status_idx on public.horus_collaborator_executions(status, created_at desc);

alter table public.horus_collaborators enable row level security;
alter table public.horus_collaborator_capabilities enable row level security;
alter table public.horus_collaborator_versions enable row level security;
alter table public.horus_collaborator_executions enable row level security;

drop policy if exists horus_collaborators_select on public.horus_collaborators;
create policy horus_collaborators_select on public.horus_collaborators for select to authenticated using (owner_user_id = auth.uid() or (organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborators.organization_id and om.user_id = auth.uid())));
drop policy if exists horus_collaborators_insert on public.horus_collaborators;
create policy horus_collaborators_insert on public.horus_collaborators for insert to authenticated with check (owner_user_id = auth.uid() and (organization_id is null or exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborators.organization_id and om.user_id = auth.uid())));
drop policy if exists horus_collaborators_update on public.horus_collaborators;
create policy horus_collaborators_update on public.horus_collaborators for update to authenticated using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid() and (organization_id is null or exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborators.organization_id and om.user_id = auth.uid())));
drop policy if exists horus_collaborators_delete on public.horus_collaborators;
create policy horus_collaborators_delete on public.horus_collaborators for delete to authenticated using (owner_user_id = auth.uid());
create policy horus_collaborator_capabilities_select on public.horus_collaborator_capabilities for select to authenticated using (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_capabilities.collaborator_id and (c.owner_user_id = auth.uid() or (c.organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = c.organization_id and om.user_id = auth.uid())))));
create policy horus_collaborator_capabilities_mutation on public.horus_collaborator_capabilities for all to authenticated using (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_capabilities.collaborator_id and c.owner_user_id = auth.uid())) with check (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_capabilities.collaborator_id and c.owner_user_id = auth.uid()));
create policy horus_collaborator_versions_select on public.horus_collaborator_versions for select to authenticated using (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_versions.collaborator_id and (c.owner_user_id = auth.uid() or (c.organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = c.organization_id and om.user_id = auth.uid())))));
create policy horus_collaborator_executions_select on public.horus_collaborator_executions for select to authenticated using (owner_user_id = auth.uid() or (organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborator_executions.organization_id and om.user_id = auth.uid())));
create policy horus_collaborator_executions_insert on public.horus_collaborator_executions for insert to authenticated with check (owner_user_id = auth.uid() and (organization_id is null or exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborator_executions.organization_id and om.user_id = auth.uid())));

create or replace function public.horus_touch_collaborator_updated_at()
returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists horus_collaborators_touch on public.horus_collaborators;
create trigger horus_collaborators_touch before update on public.horus_collaborators for each row execute function public.horus_touch_collaborator_updated_at();
drop trigger if exists horus_collaborator_capabilities_touch on public.horus_collaborator_capabilities;
create trigger horus_collaborator_capabilities_touch before update on public.horus_collaborator_capabilities for each row execute function public.horus_touch_collaborator_updated_at();
revoke all on function public.horus_touch_collaborator_updated_at() from public, anon, authenticated;
