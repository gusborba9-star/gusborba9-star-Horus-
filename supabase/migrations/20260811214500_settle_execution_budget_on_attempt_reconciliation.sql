create or replace function public.reconcile_horus_execution_attempt(p_attempt_id uuid, p_actual_cost_brl numeric, p_status text, p_input_tokens bigint, p_output_tokens bigint, p_reasoning_tokens bigint, p_cached_input_tokens bigint default 0, p_request_units numeric default 0, p_image_units numeric default 0, p_provider_request_id text default null, p_actual_provider text default null, p_actual_model text default null, p_latency_ms integer default null, p_raw_usage jsonb default '{}'::jsonb)
returns public.execution_attempts
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_attempt public.execution_attempts;
  v_budget public.execution_budgets;
  v_release numeric;
  v_budget_status text;
begin
  if p_actual_cost_brl < 0 or p_input_tokens < 0 or p_output_tokens < 0 or p_reasoning_tokens < 0 or p_cached_input_tokens < 0 then
    raise exception 'INVALID_ACTUAL_USAGE';
  end if;
  select * into v_attempt from public.execution_attempts where id=p_attempt_id for update;
  if not found then raise exception 'EXECUTION_ATTEMPT_NOT_FOUND'; end if;
  if v_attempt.status not in ('AUTHORIZED','RUNNING') then return v_attempt; end if;
  if p_actual_cost_brl > v_attempt.maximum_cost_brl then
    update public.execution_attempts set status='OVERAGE_REVIEW',actual_cost_brl=p_actual_cost_brl,failure_code='ACTUAL_COST_EXCEEDS_AUTHORIZED_ATTEMPT' where id=p_attempt_id returning * into v_attempt;
    raise exception 'ACTUAL_COST_EXCEEDS_AUTHORIZED_ATTEMPT';
  end if;
  select * into v_budget from public.execution_budgets where id=v_attempt.budget_id for update;
  v_release := v_attempt.maximum_cost_brl-p_actual_cost_brl;
  if v_release > 0 then
    update public.execution_budgets set remaining_cost_brl=least(maximum_total_cost_brl,remaining_cost_brl+v_release) where id=v_budget.id;
  end if;
  insert into public.execution_usage(attempt_id,input_tokens,output_tokens,reasoning_tokens,cached_input_tokens,request_units,image_units,actual_provider_cost_brl,actual_total_cost_brl,raw_usage)
  values(p_attempt_id,p_input_tokens,p_output_tokens,p_reasoning_tokens,p_cached_input_tokens,p_request_units,p_image_units,p_actual_cost_brl,p_actual_cost_brl,p_raw_usage)
  on conflict(attempt_id) do update set input_tokens=excluded.input_tokens,output_tokens=excluded.output_tokens,reasoning_tokens=excluded.reasoning_tokens,cached_input_tokens=excluded.cached_input_tokens,request_units=excluded.request_units,image_units=excluded.image_units,actual_provider_cost_brl=excluded.actual_provider_cost_brl,actual_total_cost_brl=excluded.actual_total_cost_brl,raw_usage=excluded.raw_usage,recorded_at=now();
  update public.execution_attempts set actual_cost_brl=p_actual_cost_brl,status=p_status,provider_request_id=p_provider_request_id,actual_provider=p_actual_provider,actual_model=p_actual_model,latency_ms=p_latency_ms,completed_at=now() where id=p_attempt_id returning * into v_attempt;
  if p_status='SUCCEEDED' then
    v_budget_status:='SETTLED';
  elsif p_status in ('FAILED','CANCELED') then
    select * into v_budget from public.execution_budgets where id=v_attempt.budget_id for update;
    v_budget_status:=case when v_budget.remaining_attempts <= 0 then 'EXHAUSTED' else 'AUTHORIZED' end;
  else
    v_budget_status:='RUNNING';
  end if;
  update public.execution_budgets set status=v_budget_status where id=v_attempt.budget_id;
  return v_attempt;
end;
$$;
