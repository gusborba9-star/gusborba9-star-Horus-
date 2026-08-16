create table if not exists public.studio_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.studio_projects(id) on delete cascade,
  revision_id uuid null references public.studio_project_revisions(id) on delete set null,
  execution_id uuid null references public.studio_executions(id) on delete set null,
  capability text not null,
  provider_id text not null,
  model_id text not null,
  result_type text not null,
  status text not null default 'READY',
  content_text text null,
  artifact_url text null,
  storage_path text null,
  provider_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_results_status_check check (status in ('PENDING','READY','FAILED'))
);

create index if not exists studio_results_project_created_idx
  on public.studio_results(project_id, created_at desc);

create index if not exists studio_results_revision_created_idx
  on public.studio_results(revision_id, created_at desc);

alter table public.studio_results enable row level security;

create policy "studio_results_owner_select"
  on public.studio_results
  for select
  using (exists (
    select 1 from public.studio_projects p
    where p.id = studio_results.project_id
      and p.owner_user_id = auth.uid()
  ));

create policy "studio_results_owner_insert"
  on public.studio_results
  for insert
  with check (exists (
    select 1 from public.studio_projects p
    where p.id = studio_results.project_id
      and p.owner_user_id = auth.uid()
  ));

create policy "studio_results_owner_update"
  on public.studio_results
  for update
  using (exists (
    select 1 from public.studio_projects p
    where p.id = studio_results.project_id
      and p.owner_user_id = auth.uid()
  ));

insert into storage.buckets (id, name, public)
values ('studio-results', 'studio-results', false)
on conflict (id) do nothing;

create policy "studio_results_storage_owner_read"
  on storage.objects
  for select
  using (
    bucket_id = 'studio-results'
    and exists (
      select 1
      from public.studio_projects p
      where p.owner_user_id = auth.uid()
        and p.id::text = split_part(name, '/', 1)
    )
  );
