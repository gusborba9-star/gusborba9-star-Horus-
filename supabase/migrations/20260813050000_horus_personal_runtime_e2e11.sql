create table if not exists public.personal_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.personal_devices(id) on delete set null,
  persona_id text not null references public.personal_personas(id),
  kind text not null default 'CHAT' check (kind in ('CHAT','ACTION','VOICE')),
  intent text not null check (length(trim(intent)) between 1 and 20000),
  task_profile jsonb not null default '{}'::jsonb,
  prompt_original text not null default '',
  prompt_optimized text not null default '',
  capability_id text references public.capabilities(id),
  autonomy text not null default 'SUGGEST' check (autonomy in ('READ','SUGGEST','PREPARE','EXECUTE','AUTONOMOUS')),
  policy_decision jsonb not null default '{}'::jsonb,
  memory_context jsonb not null default '[]'::jsonb,
  provider_id text references public.providers(id),
  model_id text,
  budget_id uuid references public.execution_budgets(id),
  attempt_id uuid references public.execution_attempts(id),
  execution_log_id uuid references public.horus_execution_logs(id),
  idempotency_key text not null,
  request_hash text not null,
  status text not null default 'QUEUED' check (status in ('QUEUED','AUTHORIZED','RUNNING','SUCCEEDED','FAILED','CANCELED','BLOCKED')),
  result jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, idempotency_key)
);
create index if not exists personal_executions_user_idx on public.personal_executions(user_id, created_at desc);
create index if not exists personal_executions_attempt_idx on public.personal_executions(attempt_id);
create index if not exists personal_executions_budget_idx on public.personal_executions(budget_id);
create index if not exists personal_executions_status_idx on public.personal_executions(status, created_at desc);

create table if not exists public.personal_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.personal_devices(id) on delete set null,
  title text not null check (length(trim(title)) between 1 and 500),
  due_at timestamptz,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','CANCELLED')),
  source_execution_id uuid references public.personal_executions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists personal_reminders_user_idx on public.personal_reminders(user_id, status, due_at);

create table if not exists public.personal_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null check (length(trim(description)) between 1 and 2000),
  trigger_type text not null check (trigger_type in ('TIME','EVENT','LOCATION','CONDITION')),
  trigger_config jsonb not null default '{}'::jsonb,
  status text not null default 'PENDING' check (status in ('PENDING','ACTIVE','PAUSED','COMPLETED','CANCELLED')),
  next_evaluation_at timestamptz,
  created_by_execution_id uuid references public.personal_executions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists personal_intentions_user_idx on public.personal_intentions(user_id, status, next_evaluation_at);

insert into public.capabilities (id, display_name, category, enabled)
values
 ('PERSONAL_TEXT','Personal Text','personal',true),
 ('PERSONAL_VOICE','Personal Voice','personal',true),
 ('REMINDERS_CREATE','Create Reminder','personal',true)
on conflict (id) do update set display_name = excluded.display_name, category = excluded.category, enabled = true;

alter table public.personal_executions enable row level security;
alter table public.personal_reminders enable row level security;
alter table public.personal_intentions enable row level security;

drop policy if exists personal_executions_select_own on public.personal_executions;
create policy personal_executions_select_own on public.personal_executions for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists personal_executions_insert_own on public.personal_executions;
create policy personal_executions_insert_own on public.personal_executions for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists personal_reminders_select_own on public.personal_reminders;
create policy personal_reminders_select_own on public.personal_reminders for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists personal_reminders_insert_own on public.personal_reminders;
create policy personal_reminders_insert_own on public.personal_reminders for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists personal_reminders_update_own on public.personal_reminders;
create policy personal_reminders_update_own on public.personal_reminders for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists personal_intentions_select_own on public.personal_intentions;
create policy personal_intentions_select_own on public.personal_intentions for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists personal_intentions_insert_own on public.personal_intentions;
create policy personal_intentions_insert_own on public.personal_intentions for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists personal_intentions_update_own on public.personal_intentions;
create policy personal_intentions_update_own on public.personal_intentions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create or replace function public.touch_personal_runtime_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_personal_executions_updated_at on public.personal_executions;
create trigger trg_personal_executions_updated_at before update on public.personal_executions for each row execute function public.touch_personal_runtime_updated_at();
drop trigger if exists trg_personal_reminders_updated_at on public.personal_reminders;
create trigger trg_personal_reminders_updated_at before update on public.personal_reminders for each row execute function public.touch_personal_runtime_updated_at();
drop trigger if exists trg_personal_intentions_updated_at on public.personal_intentions;
create trigger trg_personal_intentions_updated_at before update on public.personal_intentions for each row execute function public.touch_personal_runtime_updated_at();
revoke all on function public.touch_personal_runtime_updated_at() from public, anon, authenticated;
