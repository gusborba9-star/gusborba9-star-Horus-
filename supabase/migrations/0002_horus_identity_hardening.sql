-- Foundation hardening: identity provisioning and explicit overage policy.

create or replace function public.ensure_horus_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  insert into public.organizations(name, plan_tier)
  values (coalesce(new.raw_user_meta_data ->> 'full_name', 'Hórus User'), 'free')
  returning id into v_org;

  insert into public.users(id, organization_id, role, full_name, email)
  values (
    new.id,
    v_org,
    'member',
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, new.id::text || '@invalid.local')
  )
  on conflict (id) do update
    set email = excluded.email;

  insert into public.user_entitlements(user_id, organization_id, role, plan_tier)
  values (new.id, v_org, 'member', 'free')
  on conflict (user_id) do update
    set organization_id = excluded.organization_id,
        updated_at = now();

  insert into public.credit_accounts(user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
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
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_actual_credits < 0 then raise exception 'INVALID_ACTUAL_COST'; end if;

  select * into v_hold from public.credit_holds where id = p_hold_id and user_id = v_user for update;
  if not found then raise exception 'CREDIT_HOLD_NOT_FOUND'; end if;
  if v_hold.status <> 'HELD' then return v_hold; end if;
  if p_actual_credits > v_hold.reserved_credits then
    raise exception 'CREDIT_OVERAGE_REQUIRES_NEW_AUTHORIZATION';
  end if;

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
        status = p_status,
        settled_at = now()
    where id = p_hold_id
    returning * into v_hold;

  if p_actual_credits > 0 then
    insert into public.credit_ledger(user_id, operation_id, idempotency_key, event_type, amount_credits, status, actual_cost)
    values (v_user, v_hold.operation_id, v_hold.idempotency_key || ':settle', 'CREDIT_CONSUMPTION', -p_actual_credits, 'SETTLED', p_actual_credits);
  end if;

  if v_delta > 0 then
    insert into public.credit_ledger(user_id, operation_id, idempotency_key, event_type, amount_credits, status)
    values (v_user, v_hold.operation_id, v_hold.idempotency_key || ':release', 'CREDIT_RELEASE', v_delta, 'SETTLED');
  end if;

  return v_hold;
end;
$$;
