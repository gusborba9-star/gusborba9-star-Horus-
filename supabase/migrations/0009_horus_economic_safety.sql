-- Hórus Economic Safety 0009
-- Dynamic pricing, policy versioning and execution-budget primitives.
-- This migration deliberately does not migrate API routes yet.

alter table public.models
  add column if not exists canonical_slug text,
  add column if not exists request_price numeric(30,18) not null default 0,
  add column if not exists image_price numeric(30,18) not null default 0,
  add column if not exists reasoning_price_per_million numeric(30,18) not null default 0,
  add column if not exists cached_input_price_per_million numeric(30,18) not null default 0,
  add column if not exists cache_write_price_per_million numeric(30,18) not null default 0,
  add column if not exists max_completion_tokens integer,
  add column if not exists supported_parameters jsonb not null default '[]'::jsonb,
  add column if not exists input_modalities jsonb not null default '[]'::jsonb,
  add column if not exists output_modalities jsonb not null default '[]'::jsonb,
  add column if not exists expiration_date timestamptz;

alter table public.models
  add constraint models_economic_pricing_nonnegative_check
    check (request_price >= 0 and image_price >= 0 and reasoning_price_per_million >= 0
      and cached_input_price_per_million >= 0 and cache_write_price_per_million >= 0),
  add constraint models_max_completion_positive_check
    check (max_completion_tokens is null or max_completion_tokens > 0);

alter table public.models drop constraint if exists models_pkey;
alter table public.models add primary key (provider_id, id, capability);

alter table public.economic_policy
  add column if not exists target_gross_margin_rate numeric(10,6) not null default 0.70,
  add column if not exists minimum_gross_margin_rate numeric(10,6) not null default 0.60,
  add column if not exists provider_fee_rate numeric(10,6) not null default 0,
  add column if not exists fx_buffer_rate numeric(10,6) not null default 0,
  add column if not exists pricing_drift_buffer_rate numeric(10,6) not null default 0,
  add column if not exists usage_uncertainty_rate numeric(10,6) not null default 0,
  add column if not exists retry_reserve_rate numeric(10,6) not null default 0,
  add column if not exists failure_reserve_rate numeric(10,6) not null default 0,
  add column if not exists global_execution_enabled boolean not null default true,
  add column if not exists version bigint not null default 1;

alter table public.economic_policy
  add constraint economic_policy_margin_bounds_check
    check (target_gross_margin_rate >= 0 and target_gross_margin_rate < 1
      and minimum_gross_margin_rate >= 0 and minimum_gross_margin_rate < 1
      and target_gross_margin_rate >= minimum_gross_margin_rate),
  add constraint economic_policy_buffer_bounds_check
    check (provider_fee_rate >= 0 and fx_buffer_rate >= 0
      and pricing_drift_buffer_rate >= 0 and usage_uncertainty_rate >= 0
      and retry_reserve_rate >= 0 and failure_reserve_rate >= 0),
  add constraint economic_policy_version_positive_check check (version > 0);

create table if not exists public.economic_policy_versions (
  id uuid primary key default gen_random_uuid(),
  version bigint not null unique,
  target_gross_margin_rate numeric(10,6) not null,
  minimum_gross_margin_rate numeric(10,6) not null,
  provider_fee_rate numeric(10,6) not null,
  exchange_buffer_rate numeric(10,6) not null,
  fx_buffer_rate numeric(10,6) not null,
  pricing_drift_buffer_rate numeric(10,6) not null,
  safety_buffer_rate numeric(10,6) not null,
  infrastructure_rate numeric(10,6) not null,
  usage_uncertainty_rate numeric(10,6) not null,
  retry_reserve_rate numeric(10,6) not null,
  failure_reserve_rate numeric(10,6) not null,
  credit_brl_value numeric(20,8) not null,
  global_execution_enabled boolean not null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (target_gross_margin_rate >= minimum_gross_margin_rate),
  check (minimum_gross_margin_rate >= 0 and minimum_gross_margin_rate < 1),
  check (target_gross_margin_rate >= 0 and target_gross_margin_rate < 1),
  check (credit_brl_value > 0)
);

create table if not exists public.pricing_snapshots (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_endpoint text not null,
  observed_at timestamptz not null default now(),
  model_count integer not null check (model_count >= 0),
  payload_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  unique (source, payload_hash)
);

create table if not exists public.model_price_history (
  id bigint generated always as identity primary key,
  snapshot_id uuid references public.pricing_snapshots(id) on delete set null,
  provider_id text not null,
  model_id text not null,
  canonical_slug text,
  observed_at timestamptz not null default now(),
  input_price_per_token numeric(30,18) not null check (input_price_per_token >= 0),
  output_price_per_token numeric(30,18) not null check (output_price_per_token >= 0),
  request_price numeric(30,18) not null default 0 check (request_price >= 0),
  image_price numeric(30,18) not null default 0 check (image_price >= 0),
  reasoning_price numeric(30,18) not null default 0 check (reasoning_price >= 0),
  cached_input_price numeric(30,18) not null default 0 check (cached_input_price >= 0),
  cache_write_price numeric(30,18) not null default 0 check (cache_write_price >= 0),
  currency text not null default 'USD' check (currency = 'USD'),
  context_window integer check (context_window is null or context_window > 0),
  expiration_date timestamptz,
  supported_parameters jsonb not null default '[]'::jsonb,
  modalities jsonb not null default '{}'::jsonb,
  raw_pricing jsonb not null default '{}'::jsonb,
  unique (provider_id, model_id, observed_at)
);

create index if not exists model_price_history_lookup_idx on public.model_price_history(provider_id, model_id, observed_at desc);
create index if not exists model_price_history_snapshot_idx on public.model_price_history(snapshot_id);

create table if not exists public.provider_endpoint_history (
  id bigint generated always as identity primary key,
  snapshot_id uuid references public.pricing_snapshots(id) on delete set null,
  provider_id text not null,
  model_id text not null,
  endpoint_id text,
  observed_at timestamptz not null default now(),
  enabled boolean not null default true,
  context_length integer check (context_length is null or context_length > 0),
  pricing jsonb not null default '{}'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists provider_endpoint_history_lookup_idx on public.provider_endpoint_history(provider_id, model_id, observed_at desc);

create table if not exists public.execution_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete restrict,
  operation_id uuid not null unique,
  economic_policy_version bigint not null references public.economic_policy_versions(version),
  pricing_snapshot_id uuid references public.pricing_snapshots(id) on delete restrict,
  authorized_credits bigint not null check (authorized_credits > 0),
  revenue_allocated_brl numeric(20,8) not null check (revenue_allocated_brl > 0),
  minimum_margin_rate numeric(10,6) not null check (minimum_margin_rate >= 0 and minimum_margin_rate < 1),
  maximum_provider_cost_brl numeric(20,8) not null check (maximum_provider_cost_brl >= 0),
  maximum_total_cost_brl numeric(20,8) not null check (maximum_total_cost_brl >= 0),
  max_attempts integer not null check (max_attempts > 0),
  max_input_tokens bigint not null check (max_input_tokens >= 0),
  max_output_tokens bigint not null check (max_output_tokens >= 0),
  max_reasoning_tokens bigint not null check (max_reasoning_tokens >= 0),
  max_steps integer not null check (max_steps > 0),
  max_tool_calls integer not null check (max_tool_calls >= 0),
  max_execution_seconds integer not null check (max_execution_seconds > 0),
  remaining_cost_brl numeric(20,8) not null check (remaining_cost_brl >= 0),
  remaining_attempts integer not null check (remaining_attempts >= 0),
  remaining_input_tokens bigint not null check (remaining_input_tokens >= 0),
  remaining_output_tokens bigint not null check (remaining_output_tokens >= 0),
  remaining_reasoning_tokens bigint not null check (remaining_reasoning_tokens >= 0),
  status text not null default 'AUTHORIZED' check (status in ('AUTHORIZED','RUNNING','SETTLED','RELEASED','EXHAUSTED','BLOCKED','OVERAGE_REVIEW','FAILED')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
create index if not exists execution_budgets_user_status_idx on public.execution_budgets(user_id, status, created_at desc);

create table if not exists public.execution_attempts (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.execution_budgets(id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  provider_id text not null,
  model_id text not null,
  capability text not null references public.capabilities(id) on delete restrict,
  maximum_cost_brl numeric(20,8) not null check (maximum_cost_brl >= 0),
  actual_cost_brl numeric(20,8) check (actual_cost_brl is null or actual_cost_brl >= 0),
  provider_request_id text,
  actual_provider text,
  actual_model text,
  status text not null check (status in ('AUTHORIZED','RUNNING','SUCCEEDED','FAILED','CANCELLED','OVERAGE_REVIEW')),
  fallback_from_attempt_id uuid references public.execution_attempts(id) on delete restrict,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  failure_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (budget_id, attempt_number)
);
create index if not exists execution_attempts_budget_idx on public.execution_attempts(budget_id, attempt_number);

create table if not exists public.execution_usage (
  attempt_id uuid primary key references public.execution_attempts(id) on delete restrict,
  input_tokens bigint not null default 0 check (input_tokens >= 0),
  output_tokens bigint not null default 0 check (output_tokens >= 0),
  reasoning_tokens bigint not null default 0 check (reasoning_tokens >= 0),
  cached_input_tokens bigint not null default 0 check (cached_input_tokens >= 0),
  request_units numeric(20,8) not null default 0 check (request_units >= 0),
  image_units numeric(20,8) not null default 0 check (image_units >= 0),
  actual_provider_cost_brl numeric(20,8) not null check (actual_provider_cost_brl >= 0),
  actual_total_cost_brl numeric(20,8) not null check (actual_total_cost_brl >= 0),
  raw_usage jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

create table if not exists public.economic_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  operation_id uuid,
  event_type text not null,
  severity text not null default 'INFO' check (severity in ('INFO','WARN','CRITICAL')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists economic_events_operation_idx on public.economic_events(operation_id, created_at desc);
create index if not exists economic_events_type_idx on public.economic_events(event_type, created_at desc);

-- Overage is system-owned. The legacy authenticated entry point is revoked.
revoke execute on function public.flag_horus_credit_overage(uuid, bigint) from public, anon, authenticated;

create or replace function public.flag_horus_credit_overage_system(
  p_user_id uuid,
  p_hold_id uuid,
  p_actual_credits bigint
)
returns public.credit_holds
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hold public.credit_holds;
begin
  if p_user_id is null then raise exception 'INVALID_USER_ID'; end if;
  if p_actual_credits <= 0 then raise exception 'INVALID_ACTUAL_COST'; end if;

  select * into v_hold
  from public.credit_holds
  where id = p_hold_id and user_id = p_user_id
  for update;

  if not found then raise exception 'CREDIT_HOLD_NOT_FOUND'; end if;
  if v_hold.status <> 'HELD' then return v_hold; end if;
  if p_actual_credits <= v_hold.reserved_credits then raise exception 'OVERAGE_NOT_DETECTED'; end if;

  update public.credit_holds
    set actual_credits = p_actual_credits,
        actual_cost = p_actual_credits,
        status = 'OVERAGE_REVIEW'
    where id = p_hold_id
    returning * into v_hold;

  insert into public.overage_reviews(hold_id, user_id, reserved_credits, actual_credits, reason)
  values (v_hold.id, p_user_id, v_hold.reserved_credits, p_actual_credits, 'ACTUAL_COST_EXCEEDS_AUTHORIZED_HOLD')
  on conflict (hold_id) do nothing;

  insert into public.credit_ledger(
    user_id, operation_id, idempotency_key, event_type, amount_credits, status,
    reserved_cost, actual_cost, metadata
  ) values (
    p_user_id, v_hold.operation_id, v_hold.idempotency_key || ':overage',
    'CREDIT_ADJUSTMENT', 0, 'PENDING', v_hold.reserved_credits, p_actual_credits,
    jsonb_build_object('reason', 'ACTUAL_COST_EXCEEDS_AUTHORIZED_HOLD')
  ) on conflict (user_id, idempotency_key) do nothing;

  return v_hold;
end;
$$;

revoke all on function public.flag_horus_credit_overage_system(uuid, uuid, bigint) from public, anon, authenticated;
grant execute on function public.flag_horus_credit_overage_system(uuid, uuid, bigint) to service_role;

alter table public.economic_policy_versions enable row level security;
alter table public.pricing_snapshots enable row level security;
alter table public.model_price_history enable row level security;
alter table public.provider_endpoint_history enable row level security;
alter table public.execution_budgets enable row level security;
alter table public.execution_attempts enable row level security;
alter table public.execution_usage enable row level security;
alter table public.economic_events enable row level security;

create policy execution_budgets_select_own on public.execution_budgets
  for select to authenticated using (user_id = (select auth.uid()));
create policy execution_attempts_select_own on public.execution_attempts
  for select to authenticated
  using (exists (select 1 from public.execution_budgets b where b.id = budget_id and b.user_id = (select auth.uid())));
create policy execution_usage_select_own on public.execution_usage
  for select to authenticated
  using (exists (
    select 1 from public.execution_attempts a
    join public.execution_budgets b on b.id = a.budget_id
    where a.id = attempt_id and b.user_id = (select auth.uid())
  ));
create policy economic_events_select_own on public.economic_events
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.economic_policy_versions from anon, authenticated;
revoke all on public.pricing_snapshots from anon, authenticated;
revoke all on public.model_price_history from anon, authenticated;
revoke all on public.provider_endpoint_history from anon, authenticated;
revoke insert, update, delete on public.execution_budgets from anon, authenticated;
revoke insert, update, delete on public.execution_attempts from anon, authenticated;
revoke insert, update, delete on public.execution_usage from anon, authenticated;
revoke insert, update, delete on public.economic_events from anon, authenticated;

insert into public.economic_policy_versions(
  version, target_gross_margin_rate, minimum_gross_margin_rate, provider_fee_rate,
  exchange_buffer_rate, fx_buffer_rate, pricing_drift_buffer_rate,
  safety_buffer_rate, infrastructure_rate, usage_uncertainty_rate,
  retry_reserve_rate, failure_reserve_rate, credit_brl_value,
  global_execution_enabled, snapshot
)
select
  version, target_gross_margin_rate, minimum_gross_margin_rate, provider_fee_rate,
  exchange_buffer_rate, fx_buffer_rate, pricing_drift_buffer_rate,
  safety_buffer_rate, infrastructure_rate, usage_uncertainty_rate,
  retry_reserve_rate, failure_reserve_rate, credit_brl_value,
  global_execution_enabled, to_jsonb(economic_policy)
from public.economic_policy
on conflict (version) do nothing;
