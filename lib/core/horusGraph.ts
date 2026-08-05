import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { MemoryGraph } from '@/lib/memoryGraph';
import { authorizeHorusExecution } from './economicAuthorization';

export type HorusCoreInput = {
  event_type?: string;
  payload?: Record<string, unknown>;
  source?: string;
};

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
});

export type HorusCoreState = typeof HorusState.State;

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

async function authorizeEconomicExecution(state: HorusCoreState): Promise<Partial<HorusCoreState>> {
  if (state.error || state.requiresHuman || state.action !== 'route_to_service') {
    return { economicAuthorized: false };
  }

  const budgetId = typeof state.payload.budget_id === 'string' ? state.payload.budget_id : '';
  const providerId = typeof state.payload.provider_id === 'string' ? state.payload.provider_id : '';
  const modelId = typeof state.payload.model_id === 'string' ? state.payload.model_id : '';
  const capability = typeof state.payload.capability === 'string'
    ? state.payload.capability
    : typeof state.payload.operation === 'string'
      ? state.payload.operation
      : '';

  if (!budgetId || !providerId || !modelId || !capability) {
    return {
      economicAuthorized: false,
      action: 'economic_authorization_required',
      error: 'economic_authorization_requires_budget_provider_model_capability',
    };
  }

  const result = await authorizeHorusExecution({
    budgetId,
    providerId,
    modelId,
    capability,
    inputTokens: state.payload.input_tokens,
    outputTokens: state.payload.output_tokens,
    reasoningTokens: state.payload.reasoning_tokens,
    endpointId: typeof state.payload.endpoint_id === 'string' ? state.payload.endpoint_id : undefined,
    fallbackFromAttemptId:
      typeof state.payload.fallback_from_attempt_id === 'string'
        ? state.payload.fallback_from_attempt_id
        : undefined,
  });

  if (!result.authorized) {
    return {
      economicAuthorized: false,
      executionBudgetId: budgetId,
      action: 'economic_authorization_denied',
      error: result.error ?? 'economic_authorization_denied',
    };
  }

  return {
    economicAuthorized: true,
    executionBudgetId: result.budgetId,
    executionAttemptId: result.attemptId,
    error: undefined,
  };
}

const graph = new StateGraph(HorusState)
  .addNode('validate_input', validateInput)
  .addNode('retrieve_memory', retrieveMemory)
  .addNode('assess_confidence', assessConfidence)
  .addNode('route_decision', routeDecision)
  .addNode('economic_authorization', authorizeEconomicExecution)
  .addEdge(START, 'validate_input')
  .addEdge('validate_input', 'retrieve_memory')
  .addEdge('retrieve_memory', 'assess_confidence')
  .addEdge('assess_confidence', 'route_decision')
  .addEdge('route_decision', 'economic_authorization')
  .addEdge('economic_authorization', END)
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
  });
}
