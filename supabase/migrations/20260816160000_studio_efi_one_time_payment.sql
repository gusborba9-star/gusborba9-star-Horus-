create table if not exists public.studio_project_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.studio_projects(id) on delete restrict,
  revision_id uuid not null references public.studio_project_revisions(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  amount_brl numeric(12,2) not null check (amount_brl > 0),
  economic_cost_brl numeric(12,6) not null check (economic_cost_brl >= 0),
  pricing_snapshot jsonb not null default '{}'::jsonb,
  charge_id text unique,
  custom_id text not null unique,
  payment_url text,
  efi_status text not null default 'link',
  status text not null default 'CREATING',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_project_payments_status_check
    check (status in ('CREATING','AWAITING_PAYMENT','PAID','FAILED','REFUNDED'))
);

create unique index if not exists studio_project_payments_project_revision_key
  on public.studio_project_payments(project_id, revision_id);

create index if not exists studio_project_payments_project_status_idx
  on public.studio_project_payments(project_id, status);

create index if not exists studio_project_payments_owner_idx
  on public.studio_project_payments(owner_user_id, created_at desc);

alter table public.studio_project_payments enable row level security;

drop policy if exists studio_project_payments_owner_select on public.studio_project_payments;
create policy studio_project_payments_owner_select
  on public.studio_project_payments for select to authenticated
  using (owner_user_id = auth.uid());

-- Canonical commercial-price materialization over the existing economic policy.
-- This is deliberately a materialization contract, not a second pricing engine.
create or replace function public.materialize_studio_commercial_price(p_economic_cost_brl numeric)
returns table (
  final_price_brl numeric,
  policy_version bigint,
  economic_cost_brl numeric,
  reserve_rate numeric,
  provider_fee_rate numeric,
  gross_margin_rate numeric,
  policy_snapshot jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  p economic_policy%rowtype;
  reserve_rate numeric;
  gross_margin_rate numeric;
  cost_with_reserves numeric;
  final_price numeric;
begin
  if p_economic_cost_brl is null or p_economic_cost_brl < 0 then
    raise exception 'STUDIO_ECONOMIC_COST_INVALID';
  end if;

  select * into p from public.economic_policy where id = true;
  if not found then raise exception 'ECONOMIC_POLICY_UNAVAILABLE'; end if;

  reserve_rate := coalesce(p.infrastructure_rate,0)
    + coalesce(p.exchange_buffer_rate,0)
    + coalesce(p.fx_buffer_rate,0)
    + coalesce(p.safety_buffer_rate,0)
    + coalesce(p.pricing_drift_buffer_rate,0)
    + coalesce(p.usage_uncertainty_rate,0)
    + coalesce(p.retry_reserve_rate,0)
    + coalesce(p.failure_reserve_rate,0);

  gross_margin_rate := greatest(
    coalesce(p.minimum_gross_margin_rate,0),
    coalesce(p.target_gross_margin_rate,0)
  );

  if gross_margin_rate >= 1 then raise exception 'ECONOMIC_POLICY_MARGIN_INVALID'; end if;

  cost_with_reserves := p_economic_cost_brl * (1 + reserve_rate);
  cost_with_reserves := cost_with_reserves * (1 + coalesce(p.provider_fee_rate,0));
  final_price := cost_with_reserves / (1 - gross_margin_rate);

  if final_price < 0.01 then raise exception 'STUDIO_COMMERCIAL_PRICE_BELOW_PROVIDER_MINIMUM'; end if;

  return query
  select
    round(final_price, 2),
    p.version,
    round(p_economic_cost_brl, 6),
    round(reserve_rate, 8),
    round(coalesce(p.provider_fee_rate,0), 8),
    round(gross_margin_rate, 8),
    jsonb_build_object(
      'version', p.version,
      'target_gross_margin_rate', p.target_gross_margin_rate,
      'minimum_gross_margin_rate', p.minimum_gross_margin_rate,
      'provider_fee_rate', p.provider_fee_rate,
      'infrastructure_rate', p.infrastructure_rate,
      'exchange_buffer_rate', p.exchange_buffer_rate,
      'fx_buffer_rate', p.fx_buffer_rate,
      'safety_buffer_rate', p.safety_buffer_rate,
      'pricing_drift_buffer_rate', p.pricing_drift_buffer_rate,
      'usage_uncertainty_rate', p.usage_uncertainty_rate,
      'retry_reserve_rate', p.retry_reserve_rate,
      'failure_reserve_rate', p.failure_reserve_rate,
      'fx_buffer_rate', p.fx_buffer_rate,
      'reserve_rate', reserve_rate,
      'gross_margin_rate', gross_margin_rate
    );
end;
$$;

revoke all on function public.materialize_studio_commercial_price(numeric) from public, anon, authenticated;
grant execute on function public.materialize_studio_commercial_price(numeric) to service_role;
