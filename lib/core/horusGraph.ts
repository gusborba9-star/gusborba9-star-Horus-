import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { MemoryGraph } from '@/lib/memoryGraph';
import { estimateTextCost } from '@/lib/economic/cost-engine';
import { EconomicRouter } from '@/lib/economic/router';
import { SupabaseModelRegistry, SupabaseProviderRegistry } from '@/lib/economic/supabase-registry';
import { getEconomicPolicy } from '@/lib/economic/supabase-policy';
import { requirePermission } from '@/lib/auth/server';
import { authorizeHorusExecution } from './economicAuthorization';
import { executeAuthorizedHorusText } from './textExecution';

export type HorusCoreInput = {
  event_type?: string;
  payload?: Record<string, unknown>;
  source?: string;
};

const router = new EconomicRouter(new SupabaseProviderRegistry(), new SupabaseModelRegistry());

const HorusState = Annotation.Root({
  eventType: Annotation<string>,
  payload: Annotation<Record<string, unknown>>,
  source: Annotation<string>,
  confidence: Annotation<number>,
  memoryContext: Annotation<unknown[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  requiresHuman: Annotation<boolean>,
  action: Annotation<string>,
  error: Annotation<string | undefined>,
  economicAuthorized: Annotation<boolean>,
  executionAttemptId: Annotation<string | undefined>,
  executionBudgetId: Annotation<string | undefined>,
  routedProviderId: Annotation<string | undefined>,
  routedModelId: Annotation<string | undefined>,
  executionText: Annotation<string | undefined>,
  actualCostBrl: Annotation<number | undefined>,
  usage: Annotation<Record<string, unknown> | undefined>,
});

export type HorusCoreState = typeof HorusState.State;

function numericPayloadValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function validateInput(state: HorusCoreState): Partial<HorusCoreState> {
  if (!state.eventType) {
    return { error: 'event_type é obrigatório', confidence: 0, requiresHuman: true, action: 'invalid_request' };
  }

  return { error: undefined };
}

async function retrieveMemory(state: HorusCoreState): Promise<Partial<HorusCoreState>> {
  const embedding = state.payload.embedding;
  if (!Array.isArray(embedding) || !embedding.every((value) => typeof value === 'number')) {
    return { memoryContext: [] };
  }

  const memoryContext = await MemoryGraph.searchSimilarContext(embedding, 0.8, 5);
  return { memoryContext: memoryContext ?? [] };
}

function assessConfidence(state: HorusCoreState): Partial<HorusCoreState> {
  if (state.error) {
    return { confidence: 0, requiresHuman: true, action: 'invalid_request' };
  }

  let confidence = 0.55;
  if (state.payload.intent) confidence += 0.15;
  if (state.payload.operation) confidence += 0.10;
  if (state.memoryContext.length > 0) confidence += 0.10;
  if (state.source) confidence += 0.05;
  if (state.payload.request_id) confidence += 0.05;

  confidence = Math.min(1, confidence);
  return {
    confidence,
    requiresHuman: confidence < 0.7,
    action: confidence < 0.7 ? 'human_review' : 'route_to_service',
  };
}

function routeDecision(state: HorusCoreState): Partial<HorusCoreState> {
  if (state.error) return { action: 'invalid_request' };
  return { action: state.requiresHuman ? 'human_review' : 'route_to_service' };
}

function isFreshPricing(model: { priceVerifiedAt: string | null; expirationDate: string | null }): boolean {
  if (!model.priceVerifiedAt) return false;
  const verifiedAt = new Date(model.priceVerifiedAt).getTime();
  if (!Number.isFinite(verifiedAt)) return false;
  if (verifiedAt > Date.now()) return false;
  if (model.expirationDate) {
    const expiration = new Date(model.expirationDate).getTime();
    if (!Number.isFinite(expiration) || expiration <= Date.now()) return false;
  }
  return true;
}

async function authorizeEconomicExecution(state: HorusCoreState): Promise<Partial<HorusCoreState>> {
  if (state.error || state.requiresHuman || state.action !== 'route_to_service') {
    return { economicAuthorized: false };
  }

  await requirePermission('ai.execute');

  const budgetId = typeof state.payload.budget_id === 'string' ? state.payload.budget_id : '';
  const input = typeof state.payload.input === 'string' ? state.payload.input : '';
  const capability = typeof state.payload.capability === 'string'
    ? state.payload.capability
    : 'TEXT_GENERATION';
  const maxOutputTokens = numericPayloadValue(state.payload.max_output_tokens) ?? 1024;
  const maxReasoningTokens = numericPayloadValue(state.payload.max_reasoning_tokens) ?? 0;
  const inputTokens = Math.max(1, Math.ceil(input.length / 4));

  if (!budgetId || !input) {
    return {
      economicAuthorized: false,
      action: 'economic_authorization_required',
      error: 'economic_authorization_requires_budget_and_input',
    };
  }

  if (capability !== 'TEXT_GENERATION') {
    return {
      economicAuthorized: false,
      action: 'provider_execution_not_supported',
      error: `provider_execution_not_supported:${capability}`,
    };
  }

  if (!Number.isSafeInteger(maxOutputTokens) || maxOutputTokens <= 0) {
    return { economicAuthorized: false, action: 'invalid_execution_budget', error: 'INVALID_MAX_OUTPUT_TOKENS' };
  }

  const policy = await getEconomicPolicy();
  const candidates = await router.routeCandidates({
    capability: 'TEXT_GENERATION',
    qualityRequired: numericPayloadValue(state.payload.quality_required),
    inputTokens,
    maxOutputTokens,
    maxReasoningTokens,
    maxAttempts: 1,
    allowFallback: true,
  }, 3);

  let lastAuthorizationError = 'economic_authorization_denied';
  let freshCandidateCount = 0;

  for (const candidate of candidates) {
    if (!isFreshPricing(candidate.model)) {
      lastAuthorizationError = `pricing_stale:${candidate.model.id}`;
      continue;
    }

    freshCandidateCount += 1;
    const estimate = estimateTextCost(candidate.model, inputTokens, maxOutputTokens, policy, {
      maxOutputTokens,
      maxReasoningTokens,
      maxAttempts: 1,
    });

    const result = await authorizeHorusExecution({
      budgetId,
      providerId: candidate.provider.id,
      modelId: candidate.model.id,
      capability: candidate.model.capability,
      maximumCostBrl: estimate.maximumProviderCostBrl,
      maximumTotalCostBrl: estimate.maximumTotalCostBrl,
      minimumRevenueBrl: estimate.minimumRevenueBrl,
      inputTokens,
      outputTokens: maxOutputTokens,
      reasoningTokens: maxReasoningTokens,
    });

    if (result.authorized) {
      return {
        economicAuthorized: true,
        executionBudgetId: result.budgetId,
        executionAttemptId: result.attemptId,
        routedProviderId: candidate.provider.id,
        routedModelId: candidate.model.id,
        error: undefined,
      };
    }

    lastAuthorizationError = result.error ?? lastAuthorizationError;
  }

  return {
    economicAuthorized: false,
    executionBudgetId: budgetId,
    action: freshCandidateCount === 0 ? 'economic_pricing_unavailable' : 'economic_authorization_denied',
    error: lastAuthorizationError,
  };
}

async function executeProvider(state: HorusCoreState): Promise<Partial<HorusCoreState>> {
  if (!state.economicAuthorized || !state.executionAttemptId || !state.routedProviderId || !state.routedModelId) {
    return {};
  }

  const input = typeof state.payload.input === 'string' ? state.payload.input : '';
  const maxOutputTokens = numericPayloadValue(state.payload.max_output_tokens) ?? 1024;
  const maxReasoningTokens = numericPayloadValue(state.payload.max_reasoning_tokens) ?? 0;

  const result = await executeAuthorizedHorusText({
    attemptId: state.executionAttemptId,
    providerId: state.routedProviderId,
    modelId: state.routedModelId,
    input,
    maxOutputTokens,
    maxReasoningTokens,
    temperature: numericPayloadValue(state.payload.temperature),
    requestId: typeof state.payload.request_id === 'string' ? state.payload.request_id : crypto.randomUUID(),
  });

  return {
    action: 'execution_completed',
    executionText: result.text,
    actualCostBrl: result.actualCostBrl,
    usage: result.usage,
    error: undefined,
  };
}

const graph = new StateGraph(HorusState)
  .addNode('validate_input', validateInput)
  .addNode('retrieve_memory', retrieveMemory)
  .addNode('assess_confidence', assessConfidence)
  .addNode('route_decision', routeDecision)
  .addNode('economic_authorization', authorizeEconomicExecution)
  .addNode('provider_execution', executeProvider)
  .addEdge(START, 'validate_input')
  .addEdge('validate_input', 'retrieve_memory')
  .addEdge('retrieve_memory', 'assess_confidence')
  .addEdge('assess_confidence', 'route_decision')
  .addEdge('route_decision', 'economic_authorization')
  .addEdge('economic_authorization', 'provider_execution')
  .addEdge('provider_execution', END)
  .compile();

export async function runHorusCore(input: HorusCoreInput): Promise<HorusCoreState> {
  return graph.invoke({
    eventType: input.event_type ?? '',
    payload: input.payload ?? {},
    source: input.source ?? '',
    confidence: 0,
    memoryContext: [],
    requiresHuman: false,
    action: 'pending',
    error: undefined,
    economicAuthorized: false,
    executionAttemptId: undefined,
    executionBudgetId: undefined,
    routedProviderId: undefined,
    routedModelId: undefined,
    executionText: undefined,
    actualCostBrl: undefined,
    usage: undefined,
  });
}
