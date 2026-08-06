import { getServiceSupabase } from './supabase';

export type MemoryOwnerScope = 'SYSTEM' | 'USER' | 'ORGANIZATION';

export interface MemoryOwnershipContext {
  scope?: MemoryOwnerScope;
  userId?: string | null;
  organizationId?: string | null;
}

export interface MemoryNode {
  id?: string;
  node_type: 'operational_event' | 'core_knowledge' | 'human_feedback';
  content: string;
  embedding?: number[];
  importance: number;
  metadata: Record<string, unknown>;
  owner_scope?: MemoryOwnerScope;
  user_id?: string | null;
  organization_id?: string | null;
  lifecycle_state?: 'ACTIVE' | 'STALE' | 'EXPIRED' | 'PRUNED';
  last_accessed_at?: string;
  retrieval_count?: number;
  expires_at?: string;
  invalidated_at?: string | null;
  pruned_at?: string | null;
  compressed_content?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MemorySearchResult extends MemoryNode {
  similarity: number;
  context_tier: 'HOT' | 'COLD';
}

export interface MemoryPruningResult {
  stale_count: number;
  expired_count: number;
  pruned_count: number;
  duplicate_count: number;
}

const HUMAN_FEEDBACK_WEIGHT_MULTIPLIER = 10;
const DEFAULT_THRESHOLD = 0.8;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

function normalizeOwnerContext(context?: MemoryOwnershipContext): Required<MemoryOwnershipContext> {
  const scope = context?.scope ?? 'SYSTEM';
  const userId = context?.userId ?? null;
  const organizationId = context?.organizationId ?? null;

  if (scope === 'USER' && !userId) throw new Error('MEMORY_USER_OWNERSHIP_REQUIRED');
  if (scope === 'ORGANIZATION' && !organizationId) throw new Error('MEMORY_ORGANIZATION_OWNERSHIP_REQUIRED');
  if (scope === 'SYSTEM' && (userId || organizationId)) throw new Error('MEMORY_SYSTEM_SCOPE_CANNOT_HAVE_OWNER');

  return { scope, userId, organizationId };
}

function serializeEmbedding(embedding?: number[]): string | undefined {
  if (!embedding) return undefined;
  if (embedding.length === 0 || !embedding.every((value) => Number.isFinite(value))) {
    throw new Error('INVALID_MEMORY_EMBEDDING');
  }
  return `[${embedding.join(',')}]`;
}

function normalizeEmbedding(value: unknown): number[] | undefined {
  if (Array.isArray(value)) return value.every((item) => typeof item === 'number' && Number.isFinite(item)) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'number' && Number.isFinite(item)) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function normalizedContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

/**
 * Hórus OS: canonical Memory Graph Engine.
 * Memory Graph is cognitive memory; semantic cache and pricing cache remain separate domains.
 */
export class MemoryGraph {
  static async addNode(node: MemoryNode, ownership?: MemoryOwnershipContext) {
    const supabase = getServiceSupabase();
    const owner = normalizeOwnerContext(ownership ?? {
      scope: node.owner_scope,
      userId: node.user_id,
      organizationId: node.organization_id,
    });

    const importance = node.node_type === 'human_feedback'
      ? (node.importance || 1) * HUMAN_FEEDBACK_WEIGHT_MULTIPLIER
      : node.importance;

    const { data, error } = await supabase
      .from('memory_graph_nodes')
      .insert([{
        ...node,
        embedding: serializeEmbedding(node.embedding),
        importance,
        owner_scope: owner.scope,
        user_id: owner.userId,
        organization_id: owner.organizationId,
        lifecycle_state: node.lifecycle_state ?? 'ACTIVE',
        content: normalizedContent(node.content),
      }])
      .select()
      .single();

    if (error) {
      console.error('Falha ao adicionar nó de memória:', error);
      throw error;
    }

    return data;
  }

  static async searchSimilarContext(
    queryEmbedding: number[],
    threshold: number = DEFAULT_THRESHOLD,
    limit: number = DEFAULT_LIMIT,
    ownership?: MemoryOwnershipContext,
  ): Promise<MemorySearchResult[]> {
    const supabase = getServiceSupabase();
    if (queryEmbedding.length === 0 || !queryEmbedding.every((value) => Number.isFinite(value))) {
      throw new Error('INVALID_MEMORY_QUERY_EMBEDDING');
    }
    const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
    const owner = normalizeOwnerContext(ownership);

    const lookup = async (includeCold: boolean) => supabase.rpc('match_memory_nodes', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: boundedLimit,
      requested_user_id: owner.userId,
      requested_organization_id: owner.organizationId,
      include_cold: includeCold,
    });

    const hotResult = await lookup(false);
    if (hotResult.error) throw hotResult.error;
    let rows = hotResult.data ?? [];

    if (rows.length < boundedLimit) {
      const coldResult = await lookup(true);
      if (coldResult.error) throw coldResult.error;
      rows = coldResult.data ?? [];
    }

    const compressed = this.compressContext(rows as Array<Record<string, unknown>>, boundedLimit);
    return compressed.map((row) => ({
      ...(row as unknown as MemoryNode),
      embedding: normalizeEmbedding(row.embedding),
      similarity: Number(row.similarity ?? 0),
      context_tier: row.context_tier === 'HOT' ? 'HOT' : 'COLD',
    }));
  }

  /**
   * Context compression is deterministic: deduplicate equivalent content and cap result count.
   * No model call is introduced into the critical retrieval path.
   */
  static compressContext<T extends Record<string, unknown>>(nodes: T[], limit: number = DEFAULT_LIMIT): T[] {
    const seen = new Set<string>();
    const result: T[] = [];
    for (const node of nodes) {
      const key = normalizedContent(typeof node.content === 'string' ? node.content : JSON.stringify(node.content ?? ''));
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(node);
      if (result.length >= limit) break;
    }
    return result;
  }

  static async semanticPruning(policy?: {
    staleAfterDays?: number;
    pruneAfterDays?: number;
    minimumImportance?: number;
    maxRows?: number;
  }): Promise<MemoryPruningResult> {
    const supabase = getServiceSupabase();
    const staleAfterDays = policy?.staleAfterDays ?? 30;
    const pruneAfterDays = policy?.pruneAfterDays ?? 90;
    const minimumImportance = policy?.minimumImportance ?? 0.15;
    const maxRows = policy?.maxRows ?? 500;

    const { data, error } = await supabase.rpc('prune_memory_graph', {
      stale_after: `${staleAfterDays} days`,
      prune_after: `${pruneAfterDays} days`,
      minimum_importance: minimumImportance,
      max_rows: maxRows,
    });
    if (error) throw error;
    return (data?.[0] ?? {
      stale_count: 0,
      expired_count: 0,
      pruned_count: 0,
      duplicate_count: 0,
    }) as MemoryPruningResult;
  }
}
