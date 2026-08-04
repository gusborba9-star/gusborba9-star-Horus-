import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { MemoryGraph } from '@/lib/memoryGraph';

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
  memoryContext: Annotation<unknown[]>({ default: () => [] }),
  requiresHuman: Annotation<boolean>,
  action: Annotation<string>,
  error: Annotation<string | undefined>,
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

const graph = new StateGraph(HorusState)
  .addNode('validate_input', validateInput)
  .addNode('retrieve_memory', retrieveMemory)
  .addNode('assess_confidence', assessConfidence)
  .addNode('route_decision', routeDecision)
  .addEdge(START, 'validate_input')
  .addEdge('validate_input', 'retrieve_memory')
  .addEdge('retrieve_memory', 'assess_confidence')
  .addEdge('assess_confidence', 'route_decision')
  .addEdge('route_decision', END)
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
  });
}
