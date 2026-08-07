import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { MemoryGraph } from '@/lib/memoryGraph';
import { estimateTextCost } from '@/lib/economic/cost-engine';
import { EconomicRouter } from '@/lib/economic/router';
import { SupabaseModelRegistry, SupabaseProviderRegistry } from '@/lib/economic/supabase-registry';
import { getEconomicPolicy } from '@/lib/economic/supabase-policy';
import { requirePermission } from '@/lib/auth/server';
import { authorizeHorusExecution } from './economicAuthorization';
import { executeAuthorizedCachedText, executeAuthorizedHorusText } from './textExecution';
import { ensureBudgetPricingSnapshot, getEndpointPricing, type PricingCandidate } from './pricingSnapshot';
import { isPricingFresh } from '@/lib/economic/economic-safety';
import { assessCoreConfidence, validateCoreInput } from './confidence';
import { lookupSemanticCache } from './semanticCache';

export type HorusCoreInput = { event_type?: string; payload?: Record<string, unknown>; source?: string; humanApproval?: { reviewId: string; approved: boolean } };
const router = new EconomicRouter(new SupabaseProviderRegistry(), new SupabaseModelRegistry());
const HorusState = Annotation.Root({
  eventType: Annotation<string>, payload: Annotation<Record<string, unknown>>, source: Annotation<string>, confidence: Annotation<number>,
  humanApproval: Annotation<{ reviewId: string; approved: boolean } | undefined>, memoryContext: Annotation<unknown[]>({ reducer: (_current, update) => update, default: () => [] }),
  requiresHuman: Annotation<boolean>, action: Annotation<string>, error: Annotation<string | undefined>, economicAuthorized: Annotation<boolean>, cacheHit: Annotation<boolean>,
  executionAttemptId: Annotation<string | undefined>, executionBudgetId: Annotation<string | undefined>, pricingSnapshotId: Annotation<string | undefined>, endpointId: Annotation<string | undefined>,
  routedProviderId: Annotation<string | undefined>, routedModelId: Annotation<string | undefined>, executionText: Annotation<string | undefined>, actualCostBrl: Annotation<number | undefined>, usage: Annotation<Record<string, unknown> | undefined>,
});
export type HorusCoreState = typeof HorusState.State;
function numericPayloadValue(value: unknown): number | undefined { return typeof value === 'number' && Number.isFinite(value) ? value : undefined; }
function embeddingPayloadValue(value: unknown): number[] | undefined { return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'number' && Number.isFinite(item)) ? value : undefined; }
function validateInput(state: HorusCoreState): Partial<HorusCoreState> { const validation = validateCoreInput({ eventType: state.eventType, payload: state.payload, source: state.source, memoryMatches: state.memoryContext.length, humanApproval: state.humanApproval }); return validation.valid ? { error: undefined } : { error: validation.error, confidence: 0, requiresHuman: true, action: 'invalid_request' }; }
async function retrieveMemory(state: HorusCoreState): Promise<Partial<HorusCoreState>> { const embedding = state.payload.embedding; if (!Array.isArray(embedding) || !embedding.every((value) => typeof value === 'number')) return { memoryContext: [] }; const memoryContext = await MemoryGraph.searchSimilarContext(embedding, 0.8, 5); return { memoryContext: memoryContext ?? [] }; }
function assessConfidence(state: HorusCoreState): Partial<HorusCoreState> { const result = assessCoreConfidence({ eventType: state.eventType, payload: state.payload, source: state.source, memoryMatches: state.memoryContext.length, humanApproval: state.humanApproval }); return { confidence: result.confidence, requiresHuman: result.requiresHuman, action: result.action }; }
function routeDecision(state: HorusCoreState): Partial<HorusCoreState> { return state.error ? { action: 'invalid_request' } : { action: state.requiresHuman ? 'human_review' : 'route_to_service' }; }

async function authorizeEconomicExecution(state: HorusCoreState): Promise<Partial<HorusCoreState>> {
  if (state.error || state.requiresHuman || state.action !== 'route_to_service') return { economicAuthorized: false, cacheHit: false };
  await requirePermission('ai.execute');
  const budgetId = typeof state.payload.budget_id === 'string' ? state.payload.budget_id : '';
  const input = typeof state.payload.input === 'string' ? state.payload.input : '';
  const capability = typeof state.payload.capability === 'string' ? state.payload.capability : 'TEXT_GENERATION';
  const endpointId = typeof state.payload.endpoint_id === 'string' ? state.payload.endpoint_id : undefined;
  const maxOutputTokens = numericPayloadValue(state.payload.max_output_tokens) ?? 1024;
  const maxReasoningTokens = numericPayloadValue(state.payload.max_reasoning_tokens) ?? 0;
  const inputTokens = Math.max(1, Math.ceil(input.length / 4));
  const embedding = embeddingPayloadValue(state.payload.embedding);
  if (!budgetId || !input) return { economicAuthorized: false, cacheHit: false, action: 'economic_authorization_required', error: 'economic_authorization_requires_budget_and_input' };
  if (capability !== 'TEXT_GENERATION') return { economicAuthorized: false, cacheHit: false, action: 'provider_execution_not_supported', error: `provider_execution_not_supported:${capability}` };
  if (!Number.isSafeInteger(maxOutputTokens) || maxOutputTokens <= 0) return { economicAuthorized: false, cacheHit: false, action: 'invalid_execution_budget', error: 'INVALID_MAX_OUTPUT_TOKENS' };
  const policy = await getEconomicPolicy();
  const candidates = await router.routeCandidates({ capability: 'TEXT_GENERATION', qualityRequired: numericPayloadValue(state.payload.quality_required), inputTokens, maxOutputTokens, maxReasoningTokens, maxAttempts: 1, allowFallback: true }, 3);
  const pricingCandidates: PricingCandidate[] = [];
  for (const candidate of candidates) { if (!isPricingFresh(candidate.model.priceVerifiedAt, candidate.model.expirationDate)) continue; pricingCandidates.push({ model: candidate.model, endpointPricing: await getEndpointPricing(candidate.provider.id, candidate.model.id, endpointId) }); }
  if (pricingCandidates.length === 0) return { economicAuthorized: false, cacheHit: false, action: 'economic_pricing_unavailable', error: 'PRICING_STALE_OR_UNAVAILABLE' };
  const snapshot = await ensureBudgetPricingSnapshot({ budgetId, candidates: pricingCandidates });
  let lastAuthorizationError = 'economic_authorization_denied';
  for (const candidate of pricingCandidates) {
    const estimate = estimateTextCost(candidate.model, inputTokens, maxOutputTokens, policy, { maxOutputTokens, maxReasoningTokens, maxAttempts: 1 });
    const result = await authorizeHorusExecution({ budgetId, providerId: candidate.model.providerId, modelId: candidate.model.id, capability: candidate.model.capability, maximumCostBrl: estimate.maximumProviderCostBrl, maximumTotalCostBrl: estimate.maximumTotalCostBrl, minimumRevenueBrl: estimate.minimumRevenueBrl, inputTokens, outputTokens: maxOutputTokens, reasoningTokens: maxReasoningTokens, endpointId: candidate.endpointPricing?.endpointId ?? endpointId });
    if (result.authorized) {
      if (!result.attemptId) return { economicAuthorized: false, cacheHit: false, action: 'economic_authorization_denied', error: 'ECONOMIC_AUTHORIZATION_MISSING_ATTEMPT_ID' };
      const base = { economicAuthorized: true, executionBudgetId: result.budgetId, executionAttemptId: result.attemptId, pricingSnapshotId: result.pricingSnapshotId ?? snapshot.id, endpointId: candidate.endpointPricing?.endpointId ?? endpointId, routedProviderId: candidate.model.providerId, routedModelId: candidate.model.id, error: undefined };
      if (embedding) {
        const cache = await lookupSemanticCache({ embedding, eventType: state.eventType, source: state.source, capability: candidate.model.capability, providerId: candidate.model.providerId, modelId: candidate.model.id, endpointId: candidate.endpointPricing?.endpointId ?? endpointId, pricingSnapshotId: result.pricingSnapshotId ?? snapshot.id });
        if (cache) {
          const cached = await executeAuthorizedCachedText({ attemptId: result.attemptId, providerId: candidate.model.providerId, modelId: candidate.model.id, text: cache.responseText, usage: cache.usage, requestId: typeof state.payload.request_id === 'string' ? state.payload.request_id : crypto.randomUUID() });
          return { ...base, cacheHit: true, executionText: cached.text, actualCostBrl: 0, usage: cached.usage, action: 'execution_completed' };
        }
      }
      return { ...base, cacheHit: false };
    }
    lastAuthorizationError = result.error ?? lastAuthorizationError;
  }
  return { economicAuthorized: false, cacheHit: false, executionBudgetId: budgetId, pricingSnapshotId: snapshot.id, action: 'economic_authorization_denied', error: lastAuthorizationError };
}

async function executeProvider(state: HorusCoreState): Promise<Partial<HorusCoreState>> {
  if (!state.economicAuthorized || state.cacheHit || !state.executionAttemptId || !state.routedProviderId || !state.routedModelId) return {};
  const input = typeof state.payload.input === 'string' ? state.payload.input : '';
  const maxOutputTokens = numericPayloadValue(state.payload.max_output_tokens) ?? 1024;
  const maxReasoningTokens = numericPayloadValue(state.payload.max_reasoning_tokens) ?? 0;
  const result = await executeAuthorizedHorusText({ attemptId: state.executionAttemptId, providerId: state.routedProviderId, modelId: state.routedModelId, input, maxOutputTokens, maxReasoningTokens, temperature: numericPayloadValue(state.payload.temperature), requestId: typeof state.payload.request_id === 'string' ? state.payload.request_id : crypto.randomUUID(), eventType: state.eventType, source: state.source, endpointId: state.endpointId, pricingSnapshotId: state.pricingSnapshotId, embedding: embeddingPayloadValue(state.payload.embedding) });
  return { action: 'execution_completed', executionText: result.text, actualCostBrl: result.actualCostBrl, usage: result.usage, error: undefined };
}
const graph = new StateGraph(HorusState).addNode('validate_input', validateInput).addNode('retrieve_memory', retrieveMemory).addNode('assess_confidence', assessConfidence).addNode('route_decision', routeDecision).addNode('economic_authorization', authorizeEconomicExecution).addNode('provider_execution', executeProvider).addEdge(START, 'validate_input').addEdge('validate_input', 'retrieve_memory').addEdge('retrieve_memory', 'assess_confidence').addEdge('assess_confidence', 'route_decision').addEdge('route_decision', 'economic_authorization').addEdge('economic_authorization', 'provider_execution').addEdge('provider_execution', END).compile();
export async function runHorusCore(input: HorusCoreInput): Promise<HorusCoreState> { return graph.invoke({ eventType: input.event_type ?? '', payload: input.payload ?? {}, source: input.source ?? '', humanApproval: input.humanApproval, confidence: 0, memoryContext: [], requiresHuman: false, action: 'pending', error: undefined, economicAuthorized: false, cacheHit: false, executionAttemptId: undefined, executionBudgetId: undefined, pricingSnapshotId: undefined, endpointId: undefined, routedProviderId: undefined, routedModelId: undefined, executionText: undefined, actualCostBrl: undefined, usage: undefined }); }