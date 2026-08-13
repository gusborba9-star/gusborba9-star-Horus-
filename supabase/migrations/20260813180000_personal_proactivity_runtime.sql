create extension if not exists pg_cron;

create or replace function public.process_personal_time_intentions()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  grant_row record;
  execution_id uuid;
  reminder_id uuid;
  processed integer := 0;
  skipped integer := 0;
  due_key text;
begin
  for item in
    select id, user_id, description, trigger_config, next_evaluation_at
    from public.personal_intentions
    where status = 'ACTIVE'
      and trigger_type = 'TIME'
      and next_evaluation_at is not null
      and next_evaluation_at <= now()
    order by next_evaluation_at asc
    for update skip locked
  loop
    due_key := 'intention:' || item.id::text || ':' || to_char(item.next_evaluation_at, 'YYYYMMDDHH24MISSMS');

    select id, scope, autonomy, confirmation_required, status
      into grant_row
    from public.personal_capability_grants
    where user_id = item.user_id
      and capability_id = 'REMINDERS_CREATE'
      and status = 'GRANTED'
    order by granted_at desc
    limit 1;

    if grant_row.id is null or grant_row.autonomy not in ('EXECUTE','AUTONOMOUS') or grant_row.confirmation_required then
      insert into public.personal_permission_audit(user_id, grant_id, capability_id, action, metadata)
      values (item.user_id, grant_row.id, 'REMINDERS_CREATE', 'CHECK', jsonb_build_object('result','DENIED','reason',case when grant_row.id is null then 'NO_GRANT' when grant_row.confirmation_required then 'CONFIRMATION_REQUIRED' else 'AUTONOMY_BLOCKED' end,'intention_id',item.id));
      update public.personal_intentions set status = 'PAUSED', updated_at = now() where id = item.id;
      skipped := skipped + 1;
      continue;
    end if;

    select id into execution_id
    from public.personal_executions
    where user_id = item.user_id and idempotency_key = due_key
    limit 1;

    if execution_id is not null then
      update public.personal_intentions set status = 'COMPLETED', updated_at = now() where id = item.id;
      skipped := skipped + 1;
      continue;
    end if;

    insert into public.personal_executions(
      user_id, persona_id, kind, intent, task_profile, prompt_original, prompt_optimized,
      capability_id, autonomy, policy_decision, memory_context, idempotency_key, request_hash, status
    )
    select item.user_id, p.persona_id, 'ACTION', item.description,
      jsonb_build_object('expectedFormat','ACTION','action','REMINDERS_CREATE','source','PROACTIVITY'),
      item.description, item.description, 'REMINDERS_CREATE', grant_row.autonomy,
      jsonb_build_object('permission_grant_id',grant_row.id,'scope',grant_row.scope,'source','PROACTIVITY','trigger_type','TIME','intention_id',item.id),
      '[]'::jsonb, due_key, md5(due_key), 'RUNNING'
    from public.personal_profiles p
    where p.user_id = item.user_id and p.status = 'ACTIVE'
    returning id into execution_id;

    if execution_id is null then
      update public.personal_intentions set status = 'PAUSED', updated_at = now() where id = item.id;
      skipped := skipped + 1;
      continue;
    end if;

    insert into public.personal_reminders(user_id, title, due_at, status, source_execution_id)
    values (item.user_id, item.description, now(), 'ACTIVE', execution_id)
    returning id into reminder_id;

    update public.personal_executions
    set status = 'SUCCEEDED', result = jsonb_build_object('action','REMINDERS_CREATE','reminder_id',reminder_id,'source','PROACTIVITY'), completed_at = now(), updated_at = now()
    where id = execution_id;

    insert into public.personal_permission_audit(user_id, grant_id, capability_id, action, metadata)
    values (item.user_id, grant_row.id, 'REMINDERS_CREATE', 'CHECK', jsonb_build_object('result','ALLOWED','action','REMINDERS_CREATE','source','PROACTIVITY','intention_id',item.id,'execution_id',execution_id,'reminder_id',reminder_id));

    update public.personal_intentions
    set status = 'COMPLETED', updated_at = now()
    where id = item.id;
    processed := processed + 1;
  end loop;

  return jsonb_build_object('processed',processed,'skipped',skipped);
end;
$$;

revoke all on function public.process_personal_time_intentions() from public, anon, authenticated;
grant execute on function public.process_personal_time_intentions() to service_role;

select cron.schedule('horus-personal-intentions','* * * * *','select public.process_personal_time_intentions();');
