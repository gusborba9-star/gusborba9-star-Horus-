import { createClient } from '@supabase/supabase-js';
import type { Capability, Currency, ModelRecord, ProviderRecord } from './types';
import type { ModelRegistry } from './model-registry';
import type { ProviderRegistry } from './provider-registry';

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_SERVER_CONFIGURATION_MISSING');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

function requiredNonNegativeNumber(row: Record<string, unknown>, field: string): number {
  const value = row[field];
  if (value === null || value === undefined || value === '') {
    throw new Error(`MODEL_PRICING_UNKNOWN:${field}`);
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`MODEL_PRICING_INVALID:${field}`);
  }
  return parsed;
}

function optionalPositiveNumber(row: Record<string, unknown>, field: string): number | null {
  const value = row[field];
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`MODEL_METADATA_INVALID:${field}`);
  return parsed;
}

const CAPABILITIES = new Set<Capability>([
  'TEXT_GENERATION',
  'VISION',
  'IMAGE_GENERATION',
  'VIDEO_GENERATION',
  'MUSIC_GENERATION',
  'EMBEDDING',
  'SPEECH_TO_TEXT',
  'TEXT_TO_SPEECH',
  'CODE_EXECUTION',
]);

const CURRENCIES = new Set<Currency>(['USD', 'BRL']);

function capability(value: unknown): Capability {
  if (typeof value === 'string' && CAPABILITIES.has(value as Capability)) return value as Capability;
  throw new Error('MODEL_CAPABILITY_INVALID');
}

function currency(value: unknown): Currency {
  if (typeof value === 'string' && CURRENCIES.has(value as Currency)) return value as Currency;
  throw new Error('MODEL_CURRENCY_INVALID');
}

function stringArray(row: Record<string, unknown>, field: string): string[] {
  const value = row[field];
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`MODEL_METADATA_INVALID:${field}`);
  }
  return value;
}

function mapProvider(row: Record<string, unknown>): ProviderRecord {
  return {
    id: String(row.id),
    displayName: String(row.display_name),
    status: row.status as ProviderRecord['status'],
    priority: Number(row.priority),
    region: row.region ? String(row.region) : null,
    capabilities: Array.isArray(row.capabilities) ? row.capabilities.filter((value): value is Capability => typeof value === 'string' && CAPABILITIES.has(value as Capability)) : [],
  };
}

function mapModel(row: Record<string, unknown>): ModelRecord {
  const contextWindow = optionalPositiveNumber(row, 'context_window');
  const maxCompletionTokens = optionalPositiveNumber(row, 'max_completion_tokens');
  const priceVerifiedAt = row.price_verified_at == null ? null : String(row.price_verified_at);
  const expirationDate = row.expiration_date == null ? null : String(row.expiration_date);

  return {
    id: String(row.id),
    providerId: String(row.provider_id),
    capability: capability(row.capability),
    inputPricePerMillion: requiredNonNegativeNumber(row, 'input_price_per_million'),
    outputPricePerMillion: requiredNonNegativeNumber(row, 'output_price_per_million'),
    requestPrice: requiredNonNegativeNumber(row, 'request_price'),
    imagePrice: requiredNonNegativeNumber(row, 'image_price'),
    reasoningPricePerMillion: requiredNonNegativeNumber(row, 'reasoning_price_per_million'),
    cachedInputPricePerMillion: requiredNonNegativeNumber(row, 'cached_input_price_per_million'),
    cacheWritePricePerMillion: requiredNonNegativeNumber(row, 'cache_write_price_per_million'),
    currency: currency(row.currency),
    qualityScore: requiredNonNegativeNumber(row, 'quality_score'),
    latencyScore: requiredNonNegativeNumber(row, 'latency_score'),
    reliabilityScore: requiredNonNegativeNumber(row, 'reliability_score'),
    contextWindow,
    maxCompletionTokens,
    supportedParameters: stringArray(row, 'supported_parameters'),
    inputModalities: stringArray(row, 'input_modalities'),
    outputModalities: stringArray(row, 'output_modalities'),
    canonicalSlug: row.canonical_slug == null ? null : String(row.canonical_slug),
    enabled: Boolean(row.enabled),
    priceVerifiedAt,
    expirationDate,
  };
}

export class SupabaseProviderRegistry implements ProviderRegistry {
  async get(providerId: string) {
    const { data, error } = await client().from('providers').select('*').eq('id', providerId).maybeSingle();
    if (error) throw new Error(`PROVIDER_REGISTRY_READ_FAILED:${error.message}`);
    return data ? mapProvider(data) : null;
  }

  async list(capabilityFilter?: Capability) {
    const { data, error } = await client().from('providers').select('*').neq('status', 'DISABLED').order('priority');
    if (error) throw new Error(`PROVIDER_REGISTRY_READ_FAILED:${error.message}`);
    return (data ?? []).map(mapProvider).filter((provider) => !capabilityFilter || provider.capabilities.includes(capabilityFilter));
  }
}

export class SupabaseModelRegistry implements ModelRegistry {
  async get(providerId: string, modelId: string) {
    const { data, error } = await client().from('models').select('*').eq('provider_id', providerId).eq('id', modelId).maybeSingle();
    if (error) throw new Error(`MODEL_REGISTRY_READ_FAILED:${error.message}`);
    return data ? mapModel(data) : null;
  }

  async list(capabilityFilter: Capability) {
    const { data, error } = await client().from('models').select('*').eq('capability', capabilityFilter).eq('enabled', true);
    if (error) throw new Error(`MODEL_REGISTRY_READ_FAILED:${error.message}`);
    return (data ?? []).map(mapModel);
  }
}
