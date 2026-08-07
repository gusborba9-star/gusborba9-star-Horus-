-- Hórus Economic Safety 0010
-- Runtime hard caps: net-revenue margin invariant, FX snapshots, kill switches,
-- atomic attempt authorization and actual-cost reconciliation.

create table if not exists public.fx_snapshots (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  base_currency text not null check (base_currency = 'USD'),
  quote_currency text not null check (quote_currency = 'BRL'),
  rate numeric(20,8) not null check (rate > 0),
  observed_at timestamptz not null default now(),
  payload_hash text not null,
  unique(source, payload_hash)
);

alter table public.execution_budgets
  add column if not exists fx_snapshot_id uuid references public.fx_snapshots(id) on delete restrict,
  add column if not exists net_revenue_brl numeric(20,8) not null default 0,
  add column if not exists gross_revenue_brl numeric(20,8) not null default 0,
  add column if not exists revenue_deductions_brl numeric(20,8) not null default 0,
  add column if not exists pricing_freshness text not null default 'FRESH' check (pricing_freshness in ('FRESH','STALE','VERY_STALE','EXPIRED')),
  add column if not exists pricing_age_seconds bigint not null default 0 check (pricing_age_seconds >= 0),
  add column if not exists maximum_tree_cost_brl numeric(20,8) not null default 0;

alter table public.execution_budgets
  add constraint execution_budget_revenue_consistency_check
    check (gross_revenue_brl >= 0 and revenue_deductions_brl >= 0 and net_revenue_brl >= 0),
  add constraint execution_budget_tree_bound_check
    check (maximum_tree_cost_brl >= 0 and maximum_tree_cost_brl <= net_revenue_brl * (1 - minimum_margin_rate));

alter table public.execution_attempts
  add column if not exists endpoint_id text,
  add column if not exists authorized_at timestamptz,
  add column if not exists pricing_snapshot_id uuid references public.pricing_snapshots(id) on delete restrict,
  add column if not exists fx_snapshot_id uuid references public.fx_snapshots(id) on delete restrict;

create table if not exists public.economic_kill_switches (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('GLOBAL','PROVIDER','MODEL','CAPABILITY','ENDPOINT','TIER','OPERATION')),
  target_id text,
  enabled boolean not null default true,
  reason text not null,
  version bigint not null default 1 check (version > 0),
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  unique(scope, target_id)
);
create index if not exists economic_kill_switch_lookup_idx on public.economic_kill_switches(scope, target_id, enabled);

alter table public.fx_snapshots enable row level security;
alter table public.economic_kill_switches enable row level security;
revoke all on public.fx_snapshots from anon, authenticated;
revoke all on public.economic_kill_switches from anon, authenticated;

create or replace function public.authorize_horus_execution_attempt(
  p_budget_id uuid,
  p_attempt_number integer,
  p_provider_id text,
  p_model_id text,
  p_capability text,
  p_maximum_cost_brl numeric,
  p_input_tokens bigint,
  p_output_tokens bigint,
  p_reasoning_tokens bigint,
  p_endpoint_id text default null,
  p_fallback_from_attempt_id uuid default null
)
returns public.execution_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_budget public.execution_budgets;
  v_attempt public.execution_attempts;
begin
  if p_attempt_number <= 0 or p_maximum_cost_brl < 0 or p_input_tokens < 0 or p_output_tokens < 0 or p_reasoning_tokens < 0 then
    raise exception 'INVALID_ATTEMPT_BUDGET';
  end if;

  select * into v_budget from public.execution_budgets where id = p_budget_id for update;
  if not found then raise exception 'EXECUTION_BUDGET_NOT_FOUND'; end if;
  if v_budget.status not in ('AUTHORIZED','RUNNING') then raise exception 'EXECUTION_BUDGET_NOT_ACTIVE'; end if;
  if p_attempt_number > v_budget.max_attempts or v_budget.remaining_attempts <= 0 then raise exception 'EXECUTION_ATTEMPT_LIMIT_EXCEEDED'; end if;
  if p_maximum_cost_brl > v_budget.remaining_cost_brl then raise exception 'ECONOMIC_BUDGET_EXHAUSTED'; end if;
  if p_input_tokens > v_budget.remaining_input_tokens or p_output_tokens > v_budget.remaining_output_tokens or p_reasoning_tokens > v_budget.remaining_reasoning_tokens then raise exception 'TOKEN_BUDGET_EXCEEDED'; end if;

  update public.execution_budgets
    set remaining_cost_brl = remaining_cost_brl - p_maximum_cost_brl,
        remaining_attempts = remaining_attempts - 1,
        remaining_input_tokens = remaining_input_tokens - p_input_tokens,
        remaining_output_tokens = remaining_output_tokens - p_output_tokens,
        remaining_reasoning_tokens = remaining_reasoning_tokens - p_reasoning_tokens,
        status = 'RUNNING',
        started_at = coalesce(started_at, now())
    where id = p_budget_id;

  insert into public.execution_attempts(
    budget_id, attempt_number, provider_id, model_id, capability, maximum_cost_brl,
    status, fallback_from_attempt_id, endpoint_id, authorized_at,
    pricing_snapshot_id, fx_snapshot_id
  ) values (
    p_budget_id, p_attempt_number, p_provider_id, p_model_id, p_capability, p_maximum_cost_brl,
    'AUTHORIZED', p_fallback_from_attempt_id, p_endpoint_id, now(),
    v_budget.pricing_snapshot_id, v_budget.fx_snapshot_id
  ) returning * into v_attempt;

  return v_attempt;
exception when unique_violation then
  raise exception 'DUPLICATE_EXECUTION_ATTEMPT';
end;
$$;

create or replace function public.reconcile_horus_execution_attempt(
  p_attempt_id uuid,
  p_actual_cost_brl numeric,
  p_status text,
  p_input_tokens bigint,
  p_output_tokens bigint,
  p_reasoning_tokens bigint,
  p_cached_input_tokens bigint default 0,
  p_request_units numeric default 0,
  p_image_units numeric default 0,
  p_provider_request_id text default null,
  p_actual_provider text default null,
  p_actual_model text default null,
  p_latency_ms integer default null,
  p_raw_usage jsonb default '{}'::jsonb
)
returns public.execution_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.execution_attempts;
  v_budget public.execution_budgets;
  v_release numeric;
begin
  if p_actual_cost_brl < 0 or p_input_tokens < 0 or p_output_tokens < 0 or p_reasoning_tokens < 0 or p_cached_input_tokens < 0 then
    raise exception 'INVALID_ACTUAL_USAGE';
  end if;

  select * into v_attempt from public.execution_attempts where id = p_attempt_id for update;
  if not found then raise exception 'EXECUTION_ATTEMPT_NOT_FOUND'; end if;
  if v_attempt.status not in ('AUTHORIZED','RUNNING') then return v_attempt; end if;
  if p_actual_cost_brl > v_attempt.maximum_cost_brl then
    update public.execution_attempts set status='OVERAGE_REVIEW', actual_cost_brl=p_actual_cost_brl, failure_code='ACTUAL_COST_EXCEEDS_AUTHORIZED_ATTEMPT' where id=p_attempt_id returning * into v_attempt;
    raise exception 'ACTUAL_COST_EXCEEDS_AUTHORIZED_ATTEMPT';
  end if;

  select * into v_budget from public.execution_budgets where id=v_attempt.budget_id for update;
  v_release := v_attempt.maximum_cost_brl - p_actual_cost_brl;

  if v_release > 0 then
    update public.execution_budgets set remaining_cost_brl=least(maximum_total_cost_brl, remaining_cost_brl + v_release) where id=v_budget.id;
  end if;

  insert into public.execution_usage(
    attempt_id,input_tokens,output_tokens,reasoning_tokens,cached_input_tokens,request_units,image_units,
    actual_provider_cost_brl,actual_total_cost_brl,raw_usage
  ) values (
    p_attempt_id,p_input_tokens,p_output_tokens,p_reasoning_tokens,p_cached_input_tokens,p_request_units,p_image_units,
    p_actual_cost_brl,p_actual_cost_brl,p_raw_usage
  ) on conflict (attempt_id) do update set
    input_tokens=excluded.input_tokens,output_tokens=excluded.output_tokens,reasoning_tokens=excluded.reasoning_tokens,
    cached_input_tokens=excluded.cached_input_tokens,request_units=excluded.request_units,image_units=excluded.image_units,
    actual_provider_cost_brl=excluded.actual_provider_cost_brl,actual_total_cost_brl=excluded.actual_total_cost_brl,
    raw_usage=excluded.raw_usage,recorded_at=now();

  update public.execution_attempts set
    actual_cost_brl=p_actual_cost_brl,status=p_status,provider_request_id=p_provider_request_id,
    actual_provider=p_actual_provider,actual_model=p_actual_model,latency_ms=p_latency_ms,completed_at=now()
    where id=p_attempt_id returning * into v_attempt;

  return v_attempt;
end;
$$;

revoke all on function public.authorize_horus_execution_attempt(uuid,integer,text,text,text,numeric,bigint,bigint,bigint,text,uuid) from public,anon,authenticated;
revoke all on function public.reconcile_horus_execution_attempt(uuid,numeric,text,bigint,bigint,bigint,bigint,numeric,numeric,text,text,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.authorize_horus_execution_attempt(uuid,integer,text,text,text,numeric,bigint,bigint,bigint,text,uuid) to service_role;
grant execute on function public.reconcile_horus_execution_attempt(uuid,numeric,text,bigint,bigint,bigint,bigint,numeric,numeric,text,text,text,integer,jsonb) to service_role;
