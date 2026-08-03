-- Hórus Foundation 0007
-- Remove direct authenticated access from system-only overage handling and
-- make intentionally private economic tables explicit deny-by-policy.

create policy fx_rates_deny_client_select on public.fx_rates
  for select to authenticated using (false);

create policy economic_policy_deny_client_select on public.economic_policy
  for select to authenticated using (false);

revoke execute on function public.flag_horus_credit_overage(uuid,bigint) from public, anon, authenticated;

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

  insert into public.overage_reviews(
    hold_id, user_id, reserved_credits, actual_credits, reason
  )
  values (
    v_hold.id, p_user_id, v_hold.reserved_credits, p_actual_credits,
    'ACTUAL_COST_EXCEEDS_AUTHORIZED_HOLD'
  )
  on conflict (hold_id) do nothing;

  insert into public.credit_ledger(
    user_id, operation_id, idempotency_key, event_type, amount_credits,
    status, reserved_cost, actual_cost, metadata
  )
  values (
    p_user_id, v_hold.operation_id, v_hold.idempotency_key || ':overage',
    'CREDIT_ADJUSTMENT', 0, 'PENDING', v_hold.reserved_credits,
    p_actual_credits,
    jsonb_build_object('reason','ACTUAL_COST_EXCEEDS_AUTHORIZED_HOLD')
  )
  on conflict (user_id, idempotency_key) do nothing;

  return v_hold;
end;
$$;

revoke all on function public.flag_horus_credit_overage_system(uuid,uuid,bigint) from public, anon, authenticated;
grant execute on function public.flag_horus_credit_overage_system(uuid,uuid,bigint) to service_role;
