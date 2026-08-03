-- Hórus Foundation 0001
-- Source of truth for new schema changes. Existing db/schema.sql and
-- supabase_schema.sql remain historical until all consumers are migrated.

create extension if not exists pgcrypto;

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  plan_tier text not null default 'free',
  permissions jsonb not null default '[]'::jsonb,
  entitlements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  currency text not null default 'CREDIT',
  balance_credits bigint not null default 0 check (balance_credits >= 0),
  held_credits bigint not null default 0 check (held_credits >= 0),
  daily_spend_limit bigint,
  monthly_spend_limit bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null default gen_random_uuid(),
  idempotency_key text not null,
  user_id uuid not null references auth.users(id) on delete restrict,
  operation_id uuid,
  event_type text not null check (event_type in (
    'CREDIT_PURCHASE', 'CREDIT_HOLD', 'CREDIT_RELEASE',
    'CREDIT_CONSUMPTION', 'CREDIT_REFUND', 'CREDIT_ADJUSTMENT', 'CREDIT_EXPIRATION'
  )),
  amount_credits bigint not null,
  currency text not null default 'CREDIT',
  provider text,
  model text,
  estimated_cost numeric(20,8),
  reserved_cost numeric(20,8),
  actual_cost numeric(20,8),
  status text not null check (status in ('PENDING', 'HELD', 'EXECUTING', 'SETTLED', 'REFUNDED', 'FAILED', 'CANCELLED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table if not exists public.credit_holds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  operation_id uuid not null,
  idempotency_key text not null,
  reserved_credits bigint not null check (reserved_credits > 0),
  actual_credits bigint,
  status text not null default 'HELD' check (status in ('HELD', 'SETTLED', 'RELEASED', 'FAILED', 'CANCELLED')),
  provider text,
  model text,
  estimated_cost numeric(20,8),
  actual_cost numeric(20,8),
  created_at timestamptz not null default now(),
  settled_at timestamptz,
  unique (user_id, idempotency_key),
  unique (operation_id)
);

create table if not exists public.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  operation_type text not null,
  operation_id uuid,
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELLED')),
  response_hash text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, idempotency_key)
);

create index if not exists credit_ledger_user_created_idx on public.credit_ledger(user_id, created_at desc);
create index if not exists credit_holds_user_status_idx on public.credit_holds(user_id, status);
create index if not exists idempotency_keys_expiry_idx on public.idempotency_keys(expires_at);

alter table public.user_entitlements enable row level security;
alter table public.credit_accounts enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.credit_holds enable row level security;
alter table public.idempotency_keys enable row level security;

create policy user_entitlements_select_own on public.user_entitlements
  for select to authenticated using (user_id = auth.uid());

create policy credit_accounts_select_own on public.credit_accounts
  for select to authenticated using (user_id = auth.uid());

create policy credit_ledger_select_own on public.credit_ledger
  for select to authenticated using (user_id = auth.uid());

create policy credit_holds_select_own on public.credit_holds
  for select to authenticated using (user_id = auth.uid());

create policy idempotency_select_own on public.idempotency_keys
  for select to authenticated using (user_id = auth.uid());

-- No direct client INSERT/UPDATE/DELETE policies are intentional.
-- Mutations must go through transactional SECURITY DEFINER functions below.

create or replace function public.ensure_horus_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_entitlements(user_id, role, plan_tier)
  values (new.id, 'member', 'free')
  on conflict (user_id) do nothing;

  insert into public.credit_accounts(user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_horus on auth.users;
create trigger on_auth_user_created_horus
after insert on auth.users
for each row execute function public.ensure_horus_identity();

create or replace function public.reserve_horus_credits(
  p_operation_id uuid,
  p_idempotency_key text,
  p_amount bigint
)
returns public.credit_holds
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_account public.credit_accounts;
  v_hold public.credit_holds;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_amount <= 0 then raise exception 'INVALID_RESERVATION_AMOUNT'; end if;

  select * into v_hold from public.credit_holds
    where user_id = v_user and idempotency_key = p_idempotency_key;
  if found then return v_hold; end if;

  select * into v_account from public.credit_accounts where user_id = v_user for update;
  if not found then raise exception 'CREDIT_ACCOUNT_NOT_FOUND'; end if;
  if v_account.balance_credits - v_account.held_credits < p_amount then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  update public.credit_accounts
    set held_credits = held_credits + p_amount, updated_at = now()
    where user_id = v_user;

  insert into public.credit_holds(user_id, operation_id, idempotency_key, reserved_credits, status)
  values (v_user, p_operation_id, p_idempotency_key, p_amount, 'HELD')
  returning * into v_hold;

  insert into public.credit_ledger(user_id, operation_id, idempotency_key, event_type, amount_credits, status, reserved_cost)
  values (v_user, p_operation_id, p_idempotency_key, 'CREDIT_HOLD', -p_amount, 'HELD', p_amount);

  return v_hold;
end;
$$;

create or replace function public.reconcile_horus_credit_hold(
  p_hold_id uuid,
  p_actual_credits bigint,
  p_status text default 'SETTLED'
)
returns public.credit_holds
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_hold public.credit_holds;
  v_account public.credit_accounts;
  v_delta bigint;
  v_event text;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_actual_credits < 0 then raise exception 'INVALID_ACTUAL_COST'; end if;

  select * into v_hold from public.credit_holds where id = p_hold_id and user_id = v_user for update;
  if not found then raise exception 'CREDIT_HOLD_NOT_FOUND'; end if;
  if v_hold.status <> 'HELD' then return v_hold; end if;

  select * into v_account from public.credit_accounts where user_id = v_user for update;
  v_delta := v_hold.reserved_credits - p_actual_credits;

  update public.credit_accounts
    set held_credits = held_credits - v_hold.reserved_credits,
        balance_credits = balance_credits - greatest(p_actual_credits, 0),
        updated_at = now()
    where user_id = v_user;

  update public.credit_holds
    set actual_credits = p_actual_credits,
        actual_cost = p_actual_credits,
        status = p_status,
        settled_at = now()
    where id = p_hold_id
    returning * into v_hold;

  if p_actual_credits > 0 then
    insert into public.credit_ledger(user_id, operation_id, idempotency_key, event_type, amount_credits, status, actual_cost)
    values (v_user, v_hold.operation_id, v_hold.idempotency_key || ':settle', 'CREDIT_CONSUMPTION', -p_actual_credits, 'SETTLED', p_actual_credits);
  end if;

  if v_delta > 0 then
    v_event := 'CREDIT_RELEASE';
    insert into public.credit_ledger(user_id, operation_id, idempotency_key, event_type, amount_credits, status)
    values (v_user, v_hold.operation_id, v_hold.idempotency_key || ':release', v_event, v_delta, 'SETTLED');
  end if;

  return v_hold;
end;
$$;

grant execute on function public.reserve_horus_credits(uuid, text, bigint) to authenticated;
grant execute on function public.reconcile_horus_credit_hold(uuid, bigint, text) to authenticated;
