create table if not exists public.horus_execution_logs (
  id uuid primary key default gen_random_uuid(),
  request_id text not null,
  event_type text not null,
  source text not null default '',
  action text not null,
  status text not null check (status in ('COMPLETED','HUMAN_REVIEW','ERROR')),
  confidence numeric not null default 0 check (confidence >= 0 and confidence <= 1),
  requires_human_review boolean not null default false,
  memory_matches integer not null default 0 check (memory_matches >= 0),
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz not null default now(),
  latency_ms integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_horus_execution_logs_request_id on public.horus_execution_logs(request_id);
create index if not exists idx_horus_execution_logs_created_at on public.horus_execution_logs(created_at desc);
create index if not exists idx_horus_execution_logs_status on public.horus_execution_logs(status, created_at desc);

alter table public.horus_execution_logs enable row level security;
