import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export type CollaboratorRow = {
  id: string;
  owner_user_id: string;
  organization_id: string | null;
  slug: string;
  name: string;
  description: string;
  role: string;
  specialization: string;
  instructions: string;
  memory_scope: Record<string, unknown>;
  tool_policy: Record<string, unknown>;
  connector_policy: Record<string, unknown>;
  execution_policy: Record<string, unknown>;
  autonomy_level: 'READ' | 'SUGGEST' | 'PREPARE' | 'EXECUTE' | 'AUTONOMOUS';
  preferred_provider_id: string | null;
  preferred_model_id: string | null;
  fallback_policy: Record<string, unknown>;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  version: number;
};

export type NexusResolution = {
  collaborator: CollaboratorRow;
  capabilityId: string;
  providerId: string;
  modelId: string;
  modelInputPrice: number;
  modelOutputPrice: number;
  policy: Record<string, unknown>;
  memory: Array<{ id: string; content: string; owner_scope: string; metadata: Record<string, unknown> }>;
};

const CAPABILITY_KEYWORDS: Array<[string, string[]]> = [
  ['CODE', ['code', 'codigo', 'código', 'debug', 'bug', 'typescript', 'javascript', 'program', 'api']],
  ['DOCS', ['document', 'documento', 'escrever', 'write', 'relatório', 'report']],
  ['RESEARCH', ['pesquis', 'research', 'analis', 'compare', 'comparar', 'investig']],
  ['CAMPAIGNS', ['campanha', 'campaign', 'marketing', 'anúncio', 'anuncio', 'ads']],
  ['TEXT_GENERATION', ['texto', 'text', 'escreva', 'write', 'crie', 'create', 'resuma', 'resumo', 'ideia', 'planeje', 'planejar']],
];

export function hashRequest(intent: string, options: Record<string, unknown> = {}) {
  return createHash('sha256').update(JSON.stringify({ intent: intent.trim(), options })).digest('hex');
}

export function inferCapability(intent: string, available: string[]) {
  const normalized = intent.toLowerCase();
  for (const [capability, keywords] of CAPABILITY_KEYWORDS) {
    if (available.includes(capability) && keywords.some((keyword) => normalized.includes(keyword))) return capability;
  }
  if (available.includes('TEXT_GENERATION')) return 'TEXT_GENERATION';
  return available[0] ?? null;
}

export async function resolveCollaborator(
  service: SupabaseClient,
  userId: string,
  organizationId: string | null,
  intent: string,
): Promise<NexusResolution> {
  let collaboratorQuery = service.from('horus_collaborators').select('*').eq('status', 'ACTIVE').order('updated_at', { ascending: false });
  collaboratorQuery = organizationId
    ? collaboratorQuery.or(`owner_user_id.eq.${userId},organization_id.eq.${organizationId}`)
    : collaboratorQuery.eq('owner_user_id', userId);
  const { data: collaborators, error: collaboratorError } = await collaboratorQuery;
  if (collaboratorError) throw new Error(`NEXUS_COLLABORATOR_LOOKUP_FAILED:${collaboratorError.message}`);
  if (!collaborators?.length) throw new Error('COLLABORATOR_NOT_FOUND');

  const collaboratorIds = collaborators.map((item) => item.id);
  const { data: bindings, error: bindingError } = await service
    .from('horus_collaborator_capabilities')
    .select('collaborator_id,capability_id,enabled,policy')
    .in('collaborator_id', collaboratorIds)
    .eq('enabled', true);
  if (bindingError) throw new Error(`NEXUS_CAPABILITY_LOOKUP_FAILED:${bindingError.message}`);

  const byCollaborator = new Map<string, typeof bindings>();
  for (const binding of bindings ?? []) {
    const current = byCollaborator.get(binding.collaborator_id) ?? [];
    current.push(binding);
    byCollaborator.set(binding.collaborator_id, current);
  }

  const ranked = collaborators
    .map((collaborator) => ({ collaborator: collaborator as CollaboratorRow, bindings: byCollaborator.get(collaborator.id) ?? [] }))
    .filter((item) => item.bindings.length > 0)
    .map((item) => ({ ...item, capabilityId: inferCapability(intent, item.bindings.map((binding) => binding.capability_id)) }))
    .filter((item): item is typeof item & { capabilityId: string } => Boolean(item.capabilityId));
  if (!ranked.length) throw new Error('CAPABILITY_NOT_FOUND');

  const selected = ranked[0];
  const binding = selected.bindings.find((item) => item.capability_id === selected.capabilityId);
  if (!binding) throw new Error('CAPABILITY_NOT_FOUND');

  const modelQuery = service.from('models').select('id,provider_id,capability,input_price_per_million,output_price_per_million,quality_score,latency_score,reliability_score,enabled').eq('enabled', true).eq('capability', selected.capabilityId).order('quality_score', { ascending: false }).order('reliability_score', { ascending: false });
  const { data: models, error: modelError } = await modelQuery;
  if (modelError) throw new Error(`NEXUS_MODEL_LOOKUP_FAILED:${modelError.message}`);
  if (!models?.length) throw new Error('MODEL_NOT_FOUND');

  const preferred = models.find((model) => model.id === selected.collaborator.preferred_model_id && model.provider_id === selected.collaborator.preferred_provider_id);
  const model = preferred ?? models[0];
  const providerId = model.provider_id as string;
  const { data: provider, error: providerError } = await service.from('providers').select('id,status').eq('id', providerId).maybeSingle();
  if (providerError) throw new Error(`NEXUS_PROVIDER_LOOKUP_FAILED:${providerError.message}`);
  if (!provider || provider.status !== 'ACTIVE') throw new Error('PROVIDER_UNAVAILABLE');

  const memory: NexusResolution['memory'] = [];
  if (selected.collaborator.memory_scope?.working !== false) {
    const { data: userMemory } = await service.from('memory_graph_nodes').select('id,content,owner_scope,metadata').eq('owner_scope', 'USER').eq('user_id', userId).eq('lifecycle_state', 'ACTIVE').order('importance', { ascending: false }).order('last_accessed_at', { ascending: false, nullsFirst: false }).limit(6);
    memory.push(...((userMemory ?? []) as NexusResolution['memory']).map((item) => ({ ...item, content: item.content.slice(0, 1200) })));
  }
  if (organizationId && selected.collaborator.memory_scope?.organizational !== false) {
    const { data: orgMemory } = await service.from('memory_graph_nodes').select('id,content,owner_scope,metadata').eq('owner_scope', 'ORGANIZATION').eq('organization_id', organizationId).eq('lifecycle_state', 'ACTIVE').order('importance', { ascending: false }).order('last_accessed_at', { ascending: false, nullsFirst: false }).limit(6);
    memory.push(...((orgMemory ?? []) as NexusResolution['memory']).map((item) => ({ ...item, content: item.content.slice(0, 1200) })));
  }

  return {
    collaborator: selected.collaborator,
    capabilityId: selected.capabilityId,
    providerId,
    modelId: model.id as string,
    modelInputPrice: Number(model.input_price_per_million ?? 0),
    modelOutputPrice: Number(model.output_price_per_million ?? 0),
    policy: {
      autonomy: selected.collaborator.autonomy_level,
      capability: binding.policy ?? {},
      execution: selected.collaborator.execution_policy ?? {},
      economic_policy_version: selected.collaborator.economic_policy_version,
      connector: selected.collaborator.connector_policy ?? {},
    },
    memory,
  };
}

export function buildSystemPrompt(resolution: NexusResolution) {
  const memory = resolution.memory.length
    ? `\nRelevant memory (use only when useful):\n${resolution.memory.map((item) => `- ${item.content}`).join('\n')}`
    : '';
  return [
    `You are ${resolution.collaborator.name}, a Digital Collaborator in Hórus Cognitive OS.`,
    `Role: ${resolution.collaborator.role}.`,
    resolution.collaborator.specialization ? `Specialization: ${resolution.collaborator.specialization}.` : '',
    resolution.collaborator.description ? `Mission: ${resolution.collaborator.description}.` : '',
    resolution.collaborator.instructions,
    'Operate as a competent digital workforce member. Do not claim actions you did not perform.',
    'Return concise, actionable output with explicit uncertainty when evidence is missing.',
    memory,
  ].filter(Boolean).join('\n');
}
