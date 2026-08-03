-- Hórus Foundation 0001
-- Transactional credit ledger, reservations and idempotency.

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  role text not null default 'member' check (role in ('owner','admin','member')),
  plan_tier text not null default 'free',
  permissions jsonb not null default '[]'::jsonb,
  entitlements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  currency text not null default 'CREDIT' check (currency = 'CREDIT'),
  balance_credits bigint not null default 0 check (balance_credits >= 0),
  held_credits bigint not null default 0 check (held_credits >= 0),
  daily_spend_limit bigint check (daily_spend_limit is null or daily_spend_limit >= 0),
  monthly_spend_limit bigint check (monthly_spend_limit is null or monthly_spend_limit >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (held_credits <= balance_credits)
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null default gen_random_uuid(),
  idempotency_key text not null,
  user_id uuid not null references auth.users(id) on delete restrict,
  operation_id uuid,
  event_type text not null check (event_type in (
    'CREDIT_PURCHASE','CREDIT_HOLD','CREDIT_RELEASE',
    'CREDIT_CONSUMPTION','CREDIT_REFUND','CREDIT_ADJUSTMENT','CREDIT_EXPIRATION'
  )),
  amount_credits bigint not null,
  currency text not null default 'CREDIT' check (currency = 'CREDIT'),
  provider text,
  model text,
  estimated_cost numeric(20,8) check (estimated_cost is null or estimated_cost >= 0),
  reserved_cost numeric(20,8) check (reserved_cost is null or reserved_cost >= 0),
  actual_cost numeric(20,8) check (actual_cost is null or actual_cost >= 0),
  status text not null check (status in ('PENDING','HELD','EXECUTING','SETTLED','REFUNDED','FAILED','CANCELLED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table if not exists public.credit_holds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  operation_id uuid not null,
  idempotency_key text not null,
  request_hash text,
  reserved_credits bigint not null check (reserved_credits > 0),
  actual_credits bigint check (actual_credits is null or actual_credits >= 0),
  status text not null default 'HELD' check (status in ('HELD','SETTLED','RELEASED','FAILED','CANCELLED')),
  provider text,
  model text,
  estimated_cost numeric(20,8) check (estimated_cost is null or estimated_cost >= 0),
  actual_cost numeric(20,8) check (actual_cost is null or actual_cost >= 0),
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
  request_hash text,
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS','SUCCEEDED','FAILED','CANCELLED')),
  response_hash text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, idempotency_key)
);

create index if not exists credit_ledger_user_created_idx on public.credit_ledger(user_id, created_at desc);
create index if not exists credit_ledger_operation_idx on public.credit_ledger(operation_id, created_at desc);
create index if not exists credit_holds_user_status_idx on public.credit_holds(user_id, status);
create index if not exists credit_holds_operation_idx on public.credit_holds(operation_id);
create index if not exists idempotency_keys_expiry_idx on public.idempotency_keys(expires_at);

alter table public.user_entitlements enable row level security;
alter table public.credit_accounts enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.credit_holds enable row level security;
alter table public.idempotency_keys enable row level security;

create policy user_entitlements_select_own on public.user_entitlements
  for select to authenticated using (user_id = (select auth.uid()));

create policy credit_accounts_select_own on public.credit_accounts
  for select to authenticated using (user_id = (select auth.uid()));

create policy credit_ledger_select_own on public.credit_ledger
  for select to authenticated using (user_id = (select auth.uid()));

create policy credit_holds_select_own on public.credit_holds
  for select to authenticated using (user_id = (select auth.uid()));

create policy idempotency_select_own on public.idempotency_keys
  for select to authenticated using (user_id = (select auth.uid()));

-- Financial mutations are not exposed as table writes. They are transactional functions.

create or replace function private.provision_horus_financial_identity(p_user_id uuid, p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_entitlements(user_id, organization_id, role, plan_tier)
  values (p_user_id, p_organization_id, 'member', 'free')
  on conflict (user_id) do nothing;

  insert into public.credit_accounts(user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function private.provision_horus_financial_identity(uuid, uuid) from public, anon, authenticated;

create or replace function private.provision_horus_financial_identity_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
begin
  select u.organization_id into v_org from public.users u where u.id = new.id;
  if v_org is not null then
    perform private.provision_horus_financial_identity(new.id, v_org);
  end if;
  return new;
end;
$$;

revoke all on function private.provision_horus_financial_identity_trigger() from public, anon, authenticated;
drop trigger if exists on_horus_user_financial_identity on public.users;
create trigger on_horus_user_financial_identity
after insert on public.users
for each row execute function private.provision_horus_financial_identity_trigger();

create or replace function public.reserve_horus_credits(
  p_operation_id uuid,
  p_idempotency_key text,
  p_amount bigint,
  p_request_hash text default null
)
returns public.credit_holds
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_account public.credit_accounts;
  v_hold public.credit_holds;
  v_key public.idempotency_keys;
  v_hash text := coalesce(p_request_hash, encode(digest(p_operation_id::text || ':' || p_amount::text, 'sha256'), 'hex'));
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_amount <= 0 then raise exception 'INVALID_RESERVATION_AMOUNT'; end if;
  if p_operation_id is null or p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'INVALID_IDEMPOTENCY_INPUT';
  end if;

  select * into v_hold
  from public.credit_holds
  where user_id = v_user and idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_hold.operation_id <> p_operation_id or v_hold.reserved_credits <> p_amount or coalesce(v_hold.request_hash, '') <> v_hash then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    return v_hold;
  end if;

  insert into public.idempotency_keys(user_id, idempotency_key, operation_type, operation_id, request_hash, status)
  values (v_user, p_idempotency_key, 'CREDIT_HOLD', p_operation_id, v_hash, 'IN_PROGRESS')
  on conflict (user_id, idempotency_key) do nothing
  returning * into v_key;

  if v_key is null then
    select * into v_key from public.idempotency_keys where user_id = v_user and idempotency_key = p_idempotency_key for update;
    if v_key.operation_id <> p_operation_id or coalesce(v_key.request_hash, '') <> v_hash then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    select * into v_hold from public.credit_holds where user_id = v_user and idempotency_key = p_idempotency_key for update;
    if found then return v_hold; end if;
  end if;

  select * into v_account
  from public.credit_accounts
  where user_id = v_user
  for update;

  if not found then raise exception 'CREDIT_ACCOUNT_NOT_FOUND'; end if;
  if v_account.balance_credits - v_account.held_credits < p_amount then raise exception 'INSUFFICIENT_CREDITS'; end if;

  update public.credit_accounts
    set held_credits = held_credits + p_amount, updated_at = now()
    where user_id = v_user;

  insert into public.credit_holds(user_id, operation_id, idempotency_key, request_hash, reserved_credits, status)
  values (v_user, p_operation_id, p_idempotency_key, v_hash, p_amount, 'HELD')
  returning * into v_hold;

  insert into public.credit_ledger(user_id, operation_id, idempotency_key, event_type, amount_credits, status, reserved_cost, metadata)
  values (v_user, p_operation_id, p_idempotency_key, 'CREDIT_HOLD', 0, 'HELD', p_amount, jsonb_build_object('reserved_credits', p_amount));

  update public.idempotency_keys
    set status = 'SUCCEEDED', response_hash = encode(digest(v_hold.id::text, 'sha256'), 'hex')
    where id = v_key.id;

  return v_hold;
exception
  when others then
    update public.idempotency_keys
      set status = 'FAILED'
      where user_id = v_user and idempotency_key = p_idempotency_key and status = 'IN_PROGRESS';
    raise;
end;
$$;

revoke all on function public.reserve_horus_credits(uuid, text, bigint, text) from public, anon;
grant execute on function public.reserve_horus_credits(uuid, text, bigint, text) to authenticated;

create or replace function public.reconcile_horus_credit_hold(
  p_hold_id uuid,
  p_actual_credits bigint,
  p_status text default 'SETTLED'
)
returns public.credit_holds
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_hold public.credit_holds;
  v_account public.credit_accounts;
  v_delta bigint;
  v_final_status text := p_status;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_actual_credits < 0 then raise exception 'INVALID_ACTUAL_COST'; end if;
  if v_final_status not in ('SETTLED','RELEASED','FAILED','CANCELLED') then raise exception 'INVALID_RECONCILIATION_STATUS'; end if;

  select * into v_hold
  from public.credit_holds
  where id = p_hold_id and user_id = v_user
  for update;

  if not found then raise exception 'CREDIT_HOLD_NOT_FOUND'; end if;
  if v_hold.status <> 'HELD' then return v_hold; end if;
  if p_actual_credits > v_hold.reserved_credits then raise exception 'CREDIT_OVERAGE_REQUIRES_NEW_AUTHORIZATION'; end if;

  select * into v_account from public.credit_accounts where user_id = v_user for update;
  if not found then raise exception 'CREDIT_ACCOUNT_NOT_FOUND'; end if;

  v_delta := v_hold.reserved_credits - p_actual_credits;

  update public.credit_accounts
    set held_credits = held_credits - v_hold.reserved_credits,
        balance_credits = balance_credits - p_actual_credits,
        updated_at = now()
    where user_id = v_user;

  update public.credit_holds
    set actual_credits = p_actual_credits,
        actual_cost = p_actual_credits,
        status = v_final_status,
        settled_at = now()
    where id = p_hold_id
    returning * into v_hold;

  if p_actual_credits > 0 then
    insert into public.credit_ledger(user_id, operation_id, idempotency_key, event_type, amount_credits, status, actual_cost)
    values (v_user, v_hold.operation_id, v_hold.idempotency_key || ':settle', 'CREDIT_CONSUMPTION', -p_actual_credits, 'SETTLED', p_actual_credits);
  end if;

  if v_delta > 0 then
    insert into public.credit_ledger(user_id, operation_id, idempotency_key, event_type, amount_credits, status, reserved_cost)
    values (v_user, v_hold.operation_id, v_hold.idempotency_key || ':release', 'CREDIT_RELEASE', 0, 'SETTLED', v_delta);
  end if;

  return v_hold;
end;
$$;

revoke all on function public.reconcile_horus_credit_hold(uuid, bigint, text) from public, anon;
grant execute on function public.reconcile_horus_credit_hold(uuid, bigint, text) to authenticated;
