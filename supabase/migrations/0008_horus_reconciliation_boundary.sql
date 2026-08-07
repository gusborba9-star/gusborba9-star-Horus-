-- Hórus Foundation 0008
-- Reconciliation is a privileged financial settlement operation.
-- Clients may reserve their own credits, but may not decide settlement,
-- release, failure or cancellation outcomes after provider execution.

revoke execute on function public.reconcile_horus_credit_hold(uuid, bigint, text)
  from public, anon, authenticated;

grant execute on function public.reconcile_horus_credit_hold(uuid, bigint, text)
  to service_role;

create or replace function public.reconcile_horus_credit_hold_system(
  p_user_id uuid,
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
  v_hold public.credit_holds;
  v_account public.credit_accounts;
  v_delta bigint;
  v_final_status text := p_status;
begin
  if p_user_id is null then raise exception 'INVALID_USER_ID'; end if;
  if p_actual_credits < 0 then raise exception 'INVALID_ACTUAL_COST'; end if;
  if v_final_status not in ('SETTLED','RELEASED','FAILED','CANCELLED') then
    raise exception 'INVALID_RECONCILIATION_STATUS';
  end if;

  select * into v_hold
  from public.credit_holds
  where id = p_hold_id and user_id = p_user_id
  for update;

  if not found then raise exception 'CREDIT_HOLD_NOT_FOUND'; end if;
  if v_hold.status <> 'HELD' then return v_hold; end if;
  if p_actual_credits > v_hold.reserved_credits then
    raise exception 'CREDIT_OVERAGE_REQUIRES_NEW_AUTHORIZATION';
  end if;

  select * into v_account
  from public.credit_accounts
  where user_id = p_user_id
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
    where user_id = p_user_id;

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
      p_user_id, v_hold.operation_id, v_hold.idempotency_key || ':settle',
      'CREDIT_CONSUMPTION', -p_actual_credits, 'SETTLED', p_actual_credits
    );
  end if;

  if v_delta > 0 then
    insert into public.credit_ledger(
      user_id, operation_id, idempotency_key, event_type, amount_credits,
      status, reserved_cost
    )
    values (
      p_user_id, v_hold.operation_id, v_hold.idempotency_key || ':release',
      'CREDIT_RELEASE', 0, 'SETTLED', v_delta
    );
  end if;

  return v_hold;
end;
$$;

revoke all on function public.reconcile_horus_credit_hold_system(uuid, uuid, bigint, text)
  from public, anon, authenticated;

grant execute on function public.reconcile_horus_credit_hold_system(uuid, uuid, bigint, text)
  to service_role;
