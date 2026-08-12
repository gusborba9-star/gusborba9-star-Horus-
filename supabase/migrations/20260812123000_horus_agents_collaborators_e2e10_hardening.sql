drop policy if exists horus_collaborator_capabilities_mutation on public.horus_collaborator_capabilities;
create policy horus_collaborator_capabilities_insert on public.horus_collaborator_capabilities for insert to authenticated with check (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_capabilities.collaborator_id and c.owner_user_id = (select auth.uid())));
create policy horus_collaborator_capabilities_update on public.horus_collaborator_capabilities for update to authenticated using (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_capabilities.collaborator_id and c.owner_user_id = (select auth.uid()))) with check (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_capabilities.collaborator_id and c.owner_user_id = (select auth.uid())));
create policy horus_collaborator_capabilities_delete on public.horus_collaborator_capabilities for delete to authenticated using (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_capabilities.collaborator_id and c.owner_user_id = (select auth.uid())));

drop policy if exists horus_collaborators_select on public.horus_collaborators;
create policy horus_collaborators_select on public.horus_collaborators for select to authenticated using (owner_user_id = (select auth.uid()) or (organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborators.organization_id and om.user_id = (select auth.uid()))));
drop policy if exists horus_collaborators_insert on public.horus_collaborators;
create policy horus_collaborators_insert on public.horus_collaborators for insert to authenticated with check (owner_user_id = (select auth.uid()) and (organization_id is null or exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborators.organization_id and om.user_id = (select auth.uid()))));
drop policy if exists horus_collaborators_update on public.horus_collaborators;
create policy horus_collaborators_update on public.horus_collaborators for update to authenticated using (owner_user_id = (select auth.uid())) with check (owner_user_id = (select auth.uid()) and (organization_id is null or exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborators.organization_id and om.user_id = (select auth.uid()))));
drop policy if exists horus_collaborators_delete on public.horus_collaborators;
create policy horus_collaborators_delete on public.horus_collaborators for delete to authenticated using (owner_user_id = (select auth.uid()));

drop policy if exists horus_collaborator_capabilities_select on public.horus_collaborator_capabilities;
create policy horus_collaborator_capabilities_select on public.horus_collaborator_capabilities for select to authenticated using (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_capabilities.collaborator_id and (c.owner_user_id = (select auth.uid()) or (c.organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = c.organization_id and om.user_id = (select auth.uid()))))));

drop policy if exists horus_collaborator_versions_select on public.horus_collaborator_versions;
create policy horus_collaborator_versions_select on public.horus_collaborator_versions for select to authenticated using (exists (select 1 from public.horus_collaborators c where c.id = horus_collaborator_versions.collaborator_id and (c.owner_user_id = (select auth.uid()) or (c.organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = c.organization_id and om.user_id = (select auth.uid()))))));

drop policy if exists horus_collaborator_executions_select on public.horus_collaborator_executions;
create policy horus_collaborator_executions_select on public.horus_collaborator_executions for select to authenticated using (owner_user_id = (select auth.uid()) or (organization_id is not null and exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborator_executions.organization_id and om.user_id = (select auth.uid()))));
drop policy if exists horus_collaborator_executions_insert on public.horus_collaborator_executions;
create policy horus_collaborator_executions_insert on public.horus_collaborator_executions for insert to authenticated with check (owner_user_id = (select auth.uid()) and (organization_id is null or exists (select 1 from public.organization_memberships om where om.organization_id = horus_collaborator_executions.organization_id and om.user_id = (select auth.uid()))));

create index if not exists horus_collaborators_economic_policy_idx on public.horus_collaborators(economic_policy_version);
create index if not exists horus_collaborator_versions_created_by_idx on public.horus_collaborator_versions(created_by);
create index if not exists horus_collaborator_executions_budget_idx on public.horus_collaborator_executions(budget_id);
create index if not exists horus_collaborator_executions_attempt_idx on public.horus_collaborator_executions(attempt_id);
create index if not exists horus_collaborator_executions_capability_idx on public.horus_collaborator_executions(capability_id);
create index if not exists horus_collaborator_executions_execution_log_idx on public.horus_collaborator_executions(execution_log_id);
create index if not exists horus_collaborator_executions_organization_idx on public.horus_collaborator_executions(organization_id);
create index if not exists horus_collaborator_executions_provider_idx on public.horus_collaborator_executions(provider_id);
