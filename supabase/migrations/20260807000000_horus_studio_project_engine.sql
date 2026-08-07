create table if not exists public.studio_projects (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  name text not null check (length(trim(name)) between 1 and 160), objective text not null check (length(trim(objective)) between 1 and 10000),
  status text not null default 'DRAFT' check (status in ('DRAFT','PLANNING','READY','EXECUTING','REVIEW','STAGED','DELIVERED','ARCHIVED')),
  environment text not null default 'PREVIEW' check (environment in ('PREVIEW','STAGING','PRODUCTION')),
  context jsonb not null default '{}'::jsonb, architecture jsonb not null default '{}'::jsonb, capabilities jsonb not null default '[]'::jsonb,
  integrations jsonb not null default '[]'::jsonb, requirements jsonb not null default '[]'::jsonb, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.studio_project_revisions (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.studio_projects(id) on delete cascade,
  version integer not null, state jsonb not null default '{}'::jsonb, diff jsonb not null default '{}'::jsonb, estimated_cost_brl numeric(18,8),
  tests jsonb not null default '{}'::jsonb, preview jsonb not null default '{}'::jsonb, deployment jsonb not null default '{}'::jsonb,
  audit jsonb not null default '{}'::jsonb, created_by uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default now(),
  unique(project_id, version)
);
create table if not exists public.studio_connectors (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null, project_id uuid references public.studio_projects(id) on delete cascade,
  provider text not null check (provider in ('github','vercel','supabase','external_api')), permissions jsonb not null default '[]'::jsonb,
  status text not null default 'DISCONNECTED' check (status in ('DISCONNECTED','CONNECTED','REVOKED')), metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.studio_executions (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.studio_projects(id) on delete cascade,
  revision_id uuid references public.studio_project_revisions(id) on delete set null, owner_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null, capability text not null,
  connector_id uuid references public.studio_connectors(id) on delete set null,
  status text not null default 'PLANNED' check (status in ('PLANNED','AUTHORIZED','RUNNING','SUCCEEDED','FAILED','CANCELLED')),
  economic_authorized boolean not null default false, approval_required boolean not null default false, approval_granted boolean not null default false,
  estimated_cost_brl numeric(18,8), actual_cost_brl numeric(18,8), request jsonb not null default '{}'::jsonb, result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists studio_projects_owner_idx on public.studio_projects(owner_user_id);
create index if not exists studio_projects_org_idx on public.studio_projects(organization_id);
create index if not exists studio_project_revisions_project_idx on public.studio_project_revisions(project_id, version desc);
create index if not exists studio_connectors_project_idx on public.studio_connectors(project_id);
create index if not exists studio_executions_project_idx on public.studio_executions(project_id, created_at desc);
alter table public.studio_projects enable row level security;
alter table public.studio_project_revisions enable row level security;
alter table public.studio_connectors enable row level security;
alter table public.studio_executions enable row level security;
drop policy if exists studio_projects_owner_or_org_select on public.studio_projects;
create policy studio_projects_owner_or_org_select on public.studio_projects for select to authenticated using (owner_user_id = auth.uid() or (organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = studio_projects.organization_id and om.user_id = auth.uid())));
drop policy if exists studio_projects_owner_insert on public.studio_projects;
create policy studio_projects_owner_insert on public.studio_projects for insert to authenticated with check (owner_user_id = auth.uid());
drop policy if exists studio_projects_owner_update on public.studio_projects;
create policy studio_projects_owner_update on public.studio_projects for update to authenticated using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists studio_project_revisions_access on public.studio_project_revisions;
create policy studio_project_revisions_access on public.studio_project_revisions for all to authenticated using (exists (select 1 from public.studio_projects p where p.id = studio_project_revisions.project_id and (p.owner_user_id = auth.uid() or (p.organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = p.organization_id and om.user_id = auth.uid()))))) with check (exists (select 1 from public.studio_projects p where p.id = studio_project_revisions.project_id and p.owner_user_id = auth.uid()));
drop policy if exists studio_connectors_access on public.studio_connectors;
create policy studio_connectors_access on public.studio_connectors for all to authenticated using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists studio_executions_access on public.studio_executions;
create policy studio_executions_access on public.studio_executions for select to authenticated using (owner_user_id = auth.uid());
grant select, insert, update on public.studio_projects to authenticated;
grant select, insert, update on public.studio_project_revisions to authenticated;
grant select, insert, update on public.studio_connectors to authenticated;
grant select on public.studio_executions to authenticated;
