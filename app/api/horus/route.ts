import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/server';
import { persistHorusExecutionError, persistHorusExecutionLog } from '@/lib/core/executionLog';
import { runHorusCore } from '@/lib/core/horusGraph';
import { geminiCircuitBreaker } from '@/utils/circuitBreaker';

function apiError(error: unknown): { status: number; code: string } {
  if (error instanceof Error) {
    if (error.message === 'AUTHENTICATION_REQUIRED') return { status: 401, code: 'AUTHENTICATION_REQUIRED' };
    if (error.message === 'FORBIDDEN') return { status: 403, code: 'FORBIDDEN' };
  }
  return { status: 500, code: 'INTERNAL_SERVER_ERROR' };
}

export async function POST(req: Request) {
  const startedAt = new Date();
  let requestId = crypto.randomUUID();
  let eventType = '';
  let source = '';

  try {
    await requirePermission('ai.execute');
    const body = await req.json();
    const { event_type, payload, source: requestSource } = body ?? {};
    const normalizedPayload = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
    eventType = typeof event_type === 'string' ? event_type : '';
    source = typeof requestSource === 'string' ? requestSource : '';
    if (typeof normalizedPayload.request_id === 'string' && normalizedPayload.request_id.trim()) requestId = normalizedPayload.request_id;

    const result = await geminiCircuitBreaker.execute(() => runHorusCore({ event_type: eventType, payload: normalizedPayload, source }));
    const executionLogId = await persistHorusExecutionLog({
      requestId, eventType, source, startedAt, state: result,
      metadata: {
        endpoint: '/api/horus',
        economic_authorized: result.economicAuthorized,
        semantic_cache_hit: result.cacheHit,
        execution_attempt_id: result.executionAttemptId ?? null,
        execution_budget_id: result.executionBudgetId ?? null,
        routed_provider_id: result.routedProviderId ?? null,
        routed_model_id: result.routedModelId ?? null,
        actual_cost_brl: result.actualCostBrl ?? null,
        usage: result.usage ?? null,
      },
    });

    const status = result.error ? 400 : result.requiresHuman ? 202 : 200;
    return NextResponse.json({
      success: !result.error,
      data: {
        request_id: requestId,
        execution_log_id: executionLogId,
        execution_attempt_id: result.executionAttemptId,
        execution_budget_id: result.executionBudgetId,
        pricing_snapshot_id: result.pricingSnapshotId,
        endpoint_id: result.endpointId,
        economic_authorized: result.economicAuthorized,
        provider_id: result.routedProviderId,
        model_id: result.routedModelId,
        output: result.executionText,
        actual_cost_brl: result.actualCostBrl,
        usage: result.usage,
        action: result.action,
        confidence_score: result.confidence,
        requires_human_review: result.requiresHuman,
        semantic_cache_hit: result.cacheHit,
        memory_matches: result.memoryContext.length,
      },
      error: result.error,
    }, { status });
  } catch (error) {
    const authError = apiError(error);
    if (authError.status === 401 || authError.status === 403) {
      return NextResponse.json({ success: false, error: authError.code }, { status: authError.status });
    }

    console.error('[Hórus Core] Erro de orquestração:', error instanceof Error ? error.message : 'unknown error');
    const executionLogId = await persistHorusExecutionError({ requestId, eventType, source, startedAt, error });
    return NextResponse.json({ success: false, data: { request_id: requestId, execution_log_id: executionLogId }, error: authError.code }, { status: authError.status });
  }
}
