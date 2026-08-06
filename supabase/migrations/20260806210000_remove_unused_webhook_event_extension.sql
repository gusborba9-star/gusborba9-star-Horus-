drop index if exists public.economic_events_provider_event_unique_idx;
alter table public.economic_events drop column if exists provider_event_id;
