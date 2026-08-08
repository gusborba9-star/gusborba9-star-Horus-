insert into public.providers (id, display_name, status, priority, region, capabilities)
values ('vercel', 'Vercel Deployment', 'ACTIVE', 100, null, '["DEV","WEBSITES","APPS"]'::jsonb)
on conflict (id) do update
set display_name = excluded.display_name,
    status = excluded.status,
    capabilities = excluded.capabilities,
    updated_at = now();

insert into public.models (
  id,
  provider_id,
  capability,
  input_price_per_million,
  output_price_per_million,
  currency,
  quality_score,
  latency_score,
  reliability_score,
  context_window,
  enabled,
  metadata,
  canonical_slug,
  request_price,
  image_price,
  reasoning_price_per_million,
  cached_input_price_per_million,
  cache_write_price_per_million,
  supported_parameters,
  input_modalities,
  output_modalities
)
values (
  'vercel/deployment',
  'vercel',
  'DEV',
  0,
  0,
  'BRL',
  1,
  1,
  1,
  null,
  true,
  '{"operation":"deployment","billable":false}'::jsonb,
  'vercel/deployment',
  0,
  0,
  0,
  0,
  0,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb
)
on conflict (id) do update
set provider_id = excluded.provider_id,
    capability = excluded.capability,
    enabled = excluded.enabled,
    metadata = excluded.metadata,
    updated_at = now();
