import { createClient } from '@supabase/supabase-js';
import type { Capability, ModelRecord, ProviderRecord } from './types';
import type { ModelRegistry } from './model-registry';
import type { ProviderRegistry } from './provider-registry';
function client() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url || !key) throw new Error('SUPABASE_SERVER_CONFIGURATION_MISSING'); return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }); }
export class SupabaseProviderRegistry implements ProviderRegistry {
  async get(providerId: string) { const { data, error } = await client().from('providers').select('*').eq('id', providerId).maybeSingle(); if (error) throw new Error(`PROVIDER_REGISTRY_READ_FAILED:${error.message}`); return data ? mapProvider(data) : null; }
  async list(capability?: Capability) { const { data, error } = await client().from('providers').select('*').neq('status', 'DISABLED').order('priority'); if (error) throw new Error(`PROVIDER_REGISTRY_READ_FAILED:${error.message}`); return (data ?? []).map(mapProvider).filter((p) => !capability || p.capabilities.includes(capability)); }
}
export class SupabaseModelRegistry implements ModelRegistry {
  async get(providerId: string, modelId: string) { const { data, error } = await client().from('models').select('*').eq('provider_id', providerId).eq('id', modelId).maybeSingle(); if (error) throw new Error(`MODEL_REGISTRY_READ_FAILED:${error.message}`); return data ? mapModel(data) : null; }
  async list(capability: Capability) { const { data, error } = await client().from('models').select('*').eq('capability', capability).eq('enabled', true); if (error) throw new Error(`MODEL_REGISTRY_READ_FAILED:${error.message}`); return (data ?? []).map(mapModel); }
}
function mapProvider(row: Record<string, unknown>): ProviderRecord { return { id: String(row.id), displayName: String(row.display_name), status: row.status as ProviderRecord['status'], priority: Number(row.priority), region: row.region ? String(row.region) : null, capabilities: Array.isArray(row.capabilities) ? row.capabilities as Capability[] : [] }; }
function mapModel(row: Record<string, unknown>): ModelRecord { return { id: String(row.id), providerId: String(row.provider_id), capability: row.capability as Capability, inputPricePerMillion: Number(row.input_price_per_million), outputPricePerMillion: Number(row.output_price_per_million), currency: row.currency as ModelRecord['currency'], qualityScore: Number(row.quality_score), latencyScore: Number(row.latency_score), reliabilityScore: Number(row.reliability_score), contextWindow: row.context_window == null ? null : Number(row.context_window), enabled: Boolean(row.enabled), priceVerifiedAt: row.price_verified_at ? String(row.price_verified_at) : null }; }
