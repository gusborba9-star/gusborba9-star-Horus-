do $$
begin
  if exists (select 1 from public.providers where id = 'vercel') then
    update public.providers
    set display_name = 'Vercel Deployment',
        status = 'ACTIVE',
        capabilities = '["DEV","WEBSITES","APPS"]'::jsonb,
        updated_at = now()
    where id = 'vercel';
  else
    insert into public.providers (id, display_name, status, priority, region, capabilities)
    values ('vercel', 'Vercel Deployment', 'ACTIVE', 100, null, '["DEV","WEBSITES","APPS"]'::jsonb);
  end if;
end $$;

do $$
begin
  if exists (select 1 from public.models where id = 'vercel/deployment') then
    update public.models
    set provider_id = 'vercel',
        capability = 'DEV',
        enabled = true,
        metadata = '{"operation":"deployment","billable":false}'::jsonb,
        updated_at = now()
    where id = 'vercel/deployment';
  else
    insert into public.models (
      id, provider_id, capability, input_price_per_million, output_price_per_million,
      currency, quality_score, latency_score, reliability_score, context_window,
      enabled, metadata, canonical_slug, request_price, image_price,
      reasoning_price_per_million, cached_input_price_per_million,
      cache_write_price_per_million, supported_parameters, input_modalities,
      output_modalities
    )
    values (
      'vercel/deployment', 'vercel', 'DEV', 0, 0, 'BRL', 1, 1, 1, null,
      true, '{"operation":"deployment","billable":false}'::jsonb,
      'vercel/deployment', 0, 0, 0, 0, 0, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
    );
  end if;
end $$;
