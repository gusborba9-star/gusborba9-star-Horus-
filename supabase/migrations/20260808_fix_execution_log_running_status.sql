alter table public.horus_execution_logs
  drop constraint if exists horus_execution_logs_status_check;

alter table public.horus_execution_logs
  add constraint horus_execution_logs_status_check
  check (status = any (array['RUNNING'::text, 'COMPLETED'::text, 'HUMAN_REVIEW'::text, 'ERROR'::text]));
