-- Hórus Foundation 0006
-- Runtime hardening discovered by executing the financial path against the real database.
-- pgcrypto functions live in the Supabase extensions schema; security-definer
-- functions use an empty search_path, so every extension reference must be qualified.

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
  v_hash text := coalesce(
    p_request_hash,
    encode(extensions.digest(p_operation_id::text || ':' || p_amount::text, 'sha256'), 'hex')
  );
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
    if v_hold.operation_id <> p_operation_id
       or v_hold.reserved_credits <> p_amount
       or coalesce(v_hold.request_hash, '') <> v_hash then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    return v_hold;
  end if;

  insert into public.idempotency_keys(
    user_id, idempotency_key, operation_type, operation_id, request_hash, status
  )
  values (v_user, p_idempotency_key, 'CREDIT_HOLD', p_operation_id, v_hash, 'IN_PROGRESS')
  on conflict (user_id, idempotency_key) do nothing
  returning * into v_key;

  if v_key is null then
    select * into v_key
    from public.idempotency_keys
    where user_id = v_user and idempotency_key = p_idempotency_key
    for update;

    if v_key.operation_id <> p_operation_id
       or coalesce(v_key.request_hash, '') <> v_hash then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;

    select * into v_hold
    from public.credit_holds
    where user_id = v_user and idempotency_key = p_idempotency_key
    for update;

    if found then return v_hold; end if;
  end if;

  select * into v_account
  from public.credit_accounts
  where user_id = v_user
  for update;

  if not found then raise exception 'CREDIT_ACCOUNT_NOT_FOUND'; end if;
  if v_account.balance_credits - v_account.held_credits < p_amount then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  update public.credit_accounts
    set held_credits = held_credits + p_amount,
        updated_at = now()
    where user_id = v_user;

  insert into public.credit_holds(
    user_id, operation_id, idempotency_key, request_hash, reserved_credits, status
  )
  values (v_user, p_operation_id, p_idempotency_key, v_hash, p_amount, 'HELD')
  returning * into v_hold;

  insert into public.credit_ledger(
    user_id, operation_id, idempotency_key, event_type, amount_credits, status,
    reserved_cost, metadata
  )
  values (
    v_user, p_operation_id, p_idempotency_key, 'CREDIT_HOLD', 0, 'HELD',
    p_amount, jsonb_build_object('reserved_credits', p_amount)
  );

  update public.idempotency_keys
    set status = 'SUCCEEDED',
        response_hash = encode(extensions.digest(v_hold.id::text, 'sha256'), 'hex')
    where id = v_key.id;

  return v_hold;
exception
  when others then
    update public.idempotency_keys
      set status = 'FAILED'
      where user_id = v_user
        and idempotency_key = p_idempotency_key
        and status = 'IN_PROGRESS';
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
  if v_final_status not in ('SETTLED','RELEASED','FAILED','CANCELLED') then
    raise exception 'INVALID_RECONCILIATION_STATUS';
  end if;

  select * into v_hold
  from public.credit_holds
  where id = p_hold_id and user_id = v_user
  for update;

  if not found then raise exception 'CREDIT_HOLD_NOT_FOUND'; end if;
  if v_hold.status <> 'HELD' then return v_hold; end if;
  if p_actual_credits > v_hold.reserved_credits then
    raise exception 'CREDIT_OVERAGE_REQUIRES_NEW_AUTHORIZATION';
  end if;

  select * into v_account
  from public.credit_accounts
  where user_id = v_user
  for update;

  if not found then raise exception 'CREDIT_ACCOUNT_NOT_FOUND'; end if;
  if v_account.held_credits < v_hold.reserved_credits then
    raise exception 'CREDIT_HOLD_ACCOUNT_INVARIANT_VIOLATION';
  end if;
  if v_account.balance_credits < p_actual_credits then
    raise exception 'CREDIT_BALANCE_INVARIANT_VIOLATION';
  end if;

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
    insert into public.credit_ledger(
      user_id, operation_id, idempotency_key, event_type, amount_credits,
      status, actual_cost
    )
    values (
      v_user, v_hold.operation_id, v_hold.idempotency_key || ':settle',
      'CREDIT_CONSUMPTION', -p_actual_credits, 'SETTLED', p_actual_credits
    );
  end if;

  if v_delta > 0 then
    insert into public.credit_ledger(
      user_id, operation_id, idempotency_key, event_type, amount_credits,
      status, reserved_cost
    )
    values (
      v_user, v_hold.operation_id, v_hold.idempotency_key || ':release',
      'CREDIT_RELEASE', 0, 'SETTLED', v_delta
    );
  end if;

  return v_hold;
end;
$$;

revoke all on function public.reconcile_horus_credit_hold(uuid, bigint, text) from public, anon;
grant execute on function public.reconcile_horus_credit_hold(uuid, bigint, text) to authenticated;
