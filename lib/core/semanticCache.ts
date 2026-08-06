import { createHash } from 'node:crypto';
import { requirePermission } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase';

const DEFAULT_TTL_SECONDS = 900;
const DEFAULT_SIMILARITY_THRESHOLD = 0.92;
const MAX_CANDIDATES = 24;

type CacheScope = { ownerScope: string };

type SemanticCacheLookupInput = {
  embedding?: number[];
  eventType: string;
  source: string;
  capability: string;
  providerId: string;
  modelId: string;
  endpointId?: string;
  pricingSnapshotId?: string;
};

type SemanticCacheWriteInput = SemanticCacheLookupInput & {
  responseText: string;
  usage: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type SemanticCacheHit = {
  id: string;
  responseText: string;
  usage: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

function finiteEmbedding(value: unknown): value is number[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'number' && Number.isFinite(item));
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return -1;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return -1;
  return dot / Math.sqrt(normA * normB);
}

async function getCacheScope(): Promise<CacheScope> {
  const { user } = await requirePermission('ai.execute');
  return { ownerScope: user.organizationId ? `org:${user.organizationId}` : `user:${user.id}` };
}

function semanticKey(input: SemanticCacheLookupInput): string {
  const canonical = JSON.stringify({
    eventType: input.eventType,
    source: input.source,
    capability: input.capability,
    providerId: input.providerId,
    modelId: input.modelId,
    endpointId: input.endpointId ?? null,
    pricingSnapshotId: input.pricingSnapshotId ?? null,
  });
  return createHash('sha256').update(canonical).digest('hex');
}

function ttlSeconds(): number {
  const configured = Number(process.env.HORUS_SEMANTIC_CACHE_TTL_SECONDS ?? DEFAULT_TTL_SECONDS);
  return Number.isFinite(configured) && configured >= 60 && configured <= 86400 ? Math.floor(configured) : DEFAULT_TTL_SECONDS;
}

function similarityThreshold(): number {
  const configured = Number(process.env.HORUS_SEMANTIC_CACHE_THRESHOLD ?? DEFAULT_SIMILARITY_THRESHOLD);
  return Number.isFinite(configured) && configured >= 0.8 && configured <= 0.999 ? configured : DEFAULT_SIMILARITY_THRESHOLD;
}

export async function lookupSemanticCache(input: SemanticCacheLookupInput): Promise<SemanticCacheHit | null> {
  if (!finiteEmbedding(input.embedding)) return null;
  const { ownerScope } = await getCacheScope();
  const db = getServiceSupabase();
  const now = new Date().toISOString();

  await db.from('horus_semantic_cache_entries')
    .update({ invalidated_at: now })
    .eq('owner_scope', ownerScope)
    .lt('expires_at', now)
    .is('invalidated_at', null);

  const { data, error } = await db
    .from('horus_semantic_cache_entries')
    .select('id, embedding, response_text, usage, metadata')
    .eq('owner_scope', ownerScope)
    .eq('capability', input.capability)
    .eq('provider_id', input.providerId)
    .eq('model_id', input.modelId)
    .eq('endpoint_id', input.endpointId ?? null)
    .eq('pricing_snapshot_id', input.pricingSnapshotId ?? null)
    .is('invalidated_at', null)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(MAX_CANDIDATES);

  if (error) throw new Error(`SEMANTIC_CACHE_LOOKUP_FAILED:${error.message}`);

  let best: { similarity: number; row: any } | null = null;
  for (const row of data ?? []) {
    if (!finiteEmbedding(row.embedding)) continue;
    const similarity = cosineSimilarity(input.embedding, row.embedding);
    if (similarity >= similarityThreshold() && (!best || similarity > best.similarity)) best = { similarity, row };
  }

  if (!best) return null;
  return {
    id: best.row.id,
    responseText: best.row.response_text,
    usage: best.row.usage ?? {},
    metadata: { ...(best.row.metadata ?? {}), similarity: best.similarity, cache: 'semantic' },
  };
}

export async function writeSemanticCache(input: SemanticCacheWriteInput): Promise<void> {
  if (!finiteEmbedding(input.embedding) || !input.responseText.trim()) return;
  const { ownerScope } = await getCacheScope();
  const db = getServiceSupabase();
  const expiresAt = new Date(Date.now() + ttlSeconds() * 1000).toISOString();
  const key = semanticKey(input);

  const { error } = await db.from('horus_semantic_cache_entries').upsert({
    owner_scope: ownerScope,
    semantic_key: key,
    embedding: input.embedding,
    event_type: input.eventType,
    source: input.source,
    capability: input.capability,
    provider_id: input.providerId,
    model_id: input.modelId,
    endpoint_id: input.endpointId ?? null,
    pricing_snapshot_id: input.pricingSnapshotId ?? null,
    response_text: input.responseText,
    usage: input.usage,
    metadata: input.metadata ?? {},
    expires_at: expiresAt,
    invalidated_at: null,
  }, { onConflict: 'owner_scope,semantic_key' });

  if (error) throw new Error(`SEMANTIC_CACHE_WRITE_FAILED:${error.message}`);
}
