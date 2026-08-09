-- Keep the economic pricing snapshot contract compatible with the executor.
-- pricing_snapshots uses observed_at as its canonical observation timestamp;
-- the execution boundary currently orders by created_at. Expose created_at
-- as a generated compatibility alias so the selected snapshot is deterministic
-- without duplicating or fabricating timestamp data.
alter table public.pricing_snapshots
  add column if not exists created_at timestamptz
  generated always as (observed_at) stored;
