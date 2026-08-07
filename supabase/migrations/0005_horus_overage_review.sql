-- Hórus Foundation 0005
-- Actual provider cost above the authorized hold never becomes an implicit charge.

alter table public.credit_holds drop constraint if exists credit_holds_status_check;
alter table public.credit_holds add constraint credit_holds_status_check
  check (status in ('HELD','SETTLED','RELEASED','FAILED','CANCELLED','OVERAGE_REVIEW'));

create table if not exists public.overage_reviews (
  id uuid primary key default gen_random_uuid(),
  hold_id uuid not null unique references public.credit_holds(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  reserved_credits bigint not null check (reserved_credits > 0),
  actual_credits bigint not null check (actual_credits > reserved_credits),
  status text not null default 'OPEN' check (status in ('OPEN','AUTHORIZED','REJECTED','RESOLVED')),
  reason text not null,
  resolution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null
);

create index if not exists overage_reviews_user_status_idx on public.overage_reviews(user_id, status);
create index if not exists overage_reviews_status_created_idx on public.overage_reviews(status, created_at desc);

alter table public.overage_reviews enable row level security;

create policy overage_reviews_select_own on public.overage_reviews
  for select to authenticated using (user_id = (select auth.uid()));

revoke insert, update, delete on public.overage_reviews from anon, authenticated;

create or replace function public.flag_horus_credit_overage(
  p_hold_id uuid,
  p_actual_credits bigint
)
returns public.credit_holds
language plpgsql
security definer
set search_path = ''
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

  insert into public.overage_reviews(hold_id, user_id, reserved_credits, actual_credits, reason)
  values (v_hold.id, v_user, v_hold.reserved_credits, p_actual_credits, 'ACTUAL_COST_EXCEEDS_AUTHORIZED_HOLD')
  on conflict (hold_id) do nothing;

  insert into public.credit_ledger(
    user_id, operation_id, idempotency_key, event_type, amount_credits, status,
    reserved_cost, actual_cost, metadata
  )
  values (
    v_user, v_hold.operation_id, v_hold.idempotency_key || ':overage',
    'CREDIT_ADJUSTMENT', 0, 'PENDING',
    v_hold.reserved_credits, p_actual_credits,
    jsonb_build_object('reason','ACTUAL_COST_EXCEEDS_AUTHORIZED_HOLD')
  )
  on conflict (user_id, idempotency_key) do nothing;

  return v_hold;
end;
$$;

revoke all on function public.flag_horus_credit_overage(uuid,bigint) from public, anon;
grant execute on function public.flag_horus_credit_overage(uuid,bigint) to authenticated;
