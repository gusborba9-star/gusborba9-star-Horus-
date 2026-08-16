-- Persist the identifiers and checkout URL returned by Efí when a Personal subscription link is created.
-- Read-only recovery must never recreate a financial resource.
ALTER TABLE public.personal_subscriptions
  ADD COLUMN IF NOT EXISTS external_charge_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_url TEXT;

CREATE INDEX IF NOT EXISTS idx_personal_subscriptions_external_charge_id
  ON public.personal_subscriptions (external_charge_id)
  WHERE external_charge_id IS NOT NULL;
