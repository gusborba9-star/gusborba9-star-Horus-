alter table public.studio_projects
  add column if not exists execution_graph jsonb not null default '{}'::jsonb,
  add column if not exists environment_state jsonb not null default '{}'::jsonb,
  add column if not exists delivery jsonb not null default '{}'::jsonb,
  add column if not exists intelligence_snapshot jsonb not null default '{}'::jsonb;

alter table public.studio_project_revisions
  add column if not exists parent_revision_id uuid,
  add column if not exists change_class text not null default 'MEDIUM',
  add column if not exists optimized_spec jsonb not null default '{}'::jsonb,
  add column if not exists approval_state text not null default 'NOT_REQUIRED',
  add column if not exists approved_by uuid,
  add column if not exists approved_at timestamptz;

alter table public.studio_connectors
  add column if not exists secret_ref uuid,
  add column if not exists expires_at timestamptz,
  add column if not exists revoked_at timestamptz,
  add column if not exists last_used_at timestamptz;

alter table public.studio_executions
  add column if not exists operation_id uuid,
  add column if not exists budget_id uuid,
  add column if not exists attempt_id uuid,
  add column if not exists execution_log_id uuid,
  add column if not exists provider_id text,
  add column if not exists model_id text,
  add column if not exists complexity text not null default 'MEDIUM',
  add column if not exists environment text not null default 'PREVIEW',
  add column if not exists idempotency_key text,
  add column if not exists risk text not null default 'LOW',
  add column if not exists optimized_spec jsonb not null default '{}'::jsonb,
  add column if not exists preview jsonb not null default '{}'::jsonb,
  add column if not exists staging jsonb not null default '{}'::jsonb,
  add column if not exists delivery jsonb not null default '{}'::jsonb;

alter table public.studio_project_revisions drop constraint if exists studio_project_revisions_change_class_check;
alter table public.studio_project_revisions add constraint studio_project_revisions_change_class_check check (change_class in ('MICRO','LOW','MEDIUM','MAJOR','REBUILD'));
alter table public.studio_project_revisions drop constraint if exists studio_project_revisions_approval_state_check;
alter table public.studio_project_revisions add constraint studio_project_revisions_approval_state_check check (approval_state in ('NOT_REQUIRED','PENDING','APPROVED','REJECTED'));
alter table public.studio_executions drop constraint if exists studio_executions_complexity_check;
alter table public.studio_executions add constraint studio_executions_complexity_check check (complexity in ('MICRO','LOW','MEDIUM','MAJOR','REBUILD'));
alter table public.studio_executions drop constraint if exists studio_executions_environment_check;
alter table public.studio_executions add constraint studio_executions_environment_check check (environment in ('PREVIEW','STAGING','PRODUCTION'));
alter table public.studio_executions drop constraint if exists studio_executions_risk_check;
alter table public.studio_executions add constraint studio_executions_risk_check check (risk in ('LOW','MEDIUM','HIGH','CRITICAL'));

alter table public.studio_project_revisions drop constraint if exists studio_project_revisions_project_version_key;
alter table public.studio_project_revisions add constraint studio_project_revisions_project_version_key unique (project_id, version);
alter table public.studio_executions drop constraint if exists studio_executions_project_idempotency_key_key;
alter table public.studio_executions add constraint studio_executions_project_idempotency_key_key unique (project_id, idempotency_key);

alter table public.studio_project_revisions drop constraint if exists studio_project_revisions_parent_revision_fkey;
alter table public.studio_project_revisions add constraint studio_project_revisions_parent_revision_fkey foreign key (parent_revision_id) references public.studio_project_revisions(id);
alter table public.studio_project_revisions drop constraint if exists studio_project_revisions_approved_by_fkey;
alter table public.studio_project_revisions add constraint studio_project_revisions_approved_by_fkey foreign key (approved_by) references auth.users(id);
alter table public.studio_executions drop constraint if exists studio_executions_budget_fkey;
alter table public.studio_executions add constraint studio_executions_budget_fkey foreign key (budget_id) references public.execution_budgets(id);
alter table public.studio_executions drop constraint if exists studio_executions_attempt_fkey;
alter table public.studio_executions add constraint studio_executions_attempt_fkey foreign key (attempt_id) references public.execution_attempts(id);
alter table public.studio_executions drop constraint if exists studio_executions_provider_fkey;
alter table public.studio_executions add constraint studio_executions_provider_fkey foreign key (provider_id) references public.providers(id);
alter table public.studio_executions drop constraint if exists studio_executions_execution_log_fkey;
alter table public.studio_executions add constraint studio_executions_execution_log_fkey foreign key (execution_log_id) references public.horus_execution_logs(id);

drop policy if exists studio_connectors_access on public.studio_connectors;
create policy studio_connectors_select on public.studio_connectors for select to authenticated using (owner_user_id = auth.uid() or (organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = studio_connectors.organization_id and om.user_id = auth.uid())));
create policy studio_connectors_owner_mutation on public.studio_connectors for all to authenticated using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists studio_executions_access on public.studio_executions;
create policy studio_executions_owner_select on public.studio_executions for select to authenticated using (owner_user_id = auth.uid());
create policy studio_executions_owner_insert on public.studio_executions for insert to authenticated with check (owner_user_id = auth.uid());
create policy studio_executions_owner_update on public.studio_executions for update to authenticated using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

create or replace function public.studio_store_connector_secret(p_secret text, p_name text)
returns uuid language plpgsql security definer set search_path = public, vault as $$
begin
  if current_setting('request.jwt.claim.role', true) <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  if p_secret is null or length(trim(p_secret)) = 0 then raise exception 'INVALID_SECRET'; end if;
  return vault.create_secret(p_secret, p_name, 'Hórus Studio connector credential');
end;
$$;

create or replace function public.studio_read_connector_secret(p_secret_ref uuid)
returns text language plpgsql security definer set search_path = public, vault as $$
declare v_secret text;
begin
  if current_setting('request.jwt.claim.role', true) <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where id = p_secret_ref;
  if v_secret is null then raise exception 'SECRET_NOT_FOUND'; end if;
  return v_secret;
end;
$$;

revoke all on function public.studio_store_connector_secret(text, text) from public, anon, authenticated;
revoke all on function public.studio_read_connector_secret(uuid) from public, anon, authenticated;
grant execute on function public.studio_store_connector_secret(text, text) to service_role;
grant execute on function public.studio_read_connector_secret(uuid) to service_role;

create index if not exists studio_projects_owner_idx on public.studio_projects(owner_user_id);
create index if not exists studio_projects_org_idx on public.studio_projects(organization_id);
create index if not exists studio_revisions_project_idx on public.studio_project_revisions(project_id, version desc);
create index if not exists studio_executions_project_idx on public.studio_executions(project_id, created_at desc);
create index if not exists studio_connectors_project_idx on public.studio_connectors(project_id);
