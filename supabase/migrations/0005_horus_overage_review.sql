-- Never silently spend beyond an authorized credit hold.
-- Provider overage enters an explicit review state and keeps the reservation locked.

alter table public.credit_holds drop constraint if exists credit_holds_status_check;
alter table public.credit_holds add constraint credit_holds_status_check
  check (status in ('HELD', 'SETTLED', 'RELEASED', 'FAILED', 'CANCELLED', 'OVERAGE_REVIEW'));

create or replace function public.flag_horus_credit_overage(
  p_hold_id uuid,
  p_actual_credits bigint
)
returns public.credit_holds
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_hold public.credit_holds;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_actual_credits <= 0 then raise exception 'INVALID_ACTUAL_COST'; end if;

  select * into v_hold
  from public.credit_holds
  where id = p_hold_id and user_id = v_user
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

  insert into public.credit_ledger(
    user_id, operation_id, idempotency_key, event_type,
    amount_credits, status, reserved_cost, actual_cost, metadata
  ) values (
    v_user, v_hold.operation_id, v_hold.idempotency_key || ':overage',
    'CREDIT_ADJUSTMENT', 0, 'PENDING', v_hold.reserved_credits,
    p_actual_credits,
    jsonb_build_object('reason', 'ACTUAL_COST_EXCEEDS_AUTHORIZED_HOLD')
  );

  return v_hold;
end;
$$;

grant execute on function public.flag_horus_credit_overage(uuid, bigint) to authenticated;
