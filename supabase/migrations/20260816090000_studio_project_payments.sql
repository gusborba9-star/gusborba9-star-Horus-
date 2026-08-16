create table if not exists public.studio_project_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.studio_projects(id) on delete restrict,
  revision_id uuid not null references public.studio_project_revisions(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  amount_brl numeric(12,2) not null check (amount_brl > 0),
  estimated_cost_brl numeric(12,6) not null check (estimated_cost_brl >= 0),
  pricing_breakdown jsonb not null default '{}'::jsonb,
  charge_id text unique,
  custom_id text not null unique,
  payment_url text,
  efi_status text not null default 'link',
  status text not null default 'CREATING',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_project_payments_status_check check (status in ('CREATING','AWAITING_PAYMENT','PAID','FAILED','REFUNDED')),
  constraint studio_project_payments_efi_status_check check (efi_status in ('link','new','waiting','paid','unpaid','canceled','expired'))
);

create unique index if not exists studio_project_payments_project_unique
  on public.studio_project_payments(project_id);
create index if not exists studio_project_payments_owner_idx
  on public.studio_project_payments(owner_user_id, created_at desc);

alter table public.studio_project_payments enable row level security;
drop policy if exists studio_project_payments_owner_select on public.studio_project_payments;
create policy studio_project_payments_owner_select
  on public.studio_project_payments for select to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists studio_project_payments_owner_insert on public.studio_project_payments;
create policy studio_project_payments_owner_insert
  on public.studio_project_payments for insert to authenticated
  with check (owner_user_id = auth.uid());

drop policy if exists studio_project_payments_owner_update on public.studio_project_payments;
create policy studio_project_payments_owner_update
  on public.studio_project_payments for update to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

alter table public.studio_projects
  add column if not exists final_price_brl numeric(12,2),
  add column if not exists estimated_cost_brl numeric(12,6),
  add column if not exists pricing_breakdown jsonb not null default '{}'::jsonb;
