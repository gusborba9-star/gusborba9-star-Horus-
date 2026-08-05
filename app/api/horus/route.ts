import { NextResponse } from 'next/server';
import { persistHorusExecutionError, persistHorusExecutionLog } from '@/lib/core/executionLog';
import { runHorusCore } from '@/lib/core/horusGraph';
import { geminiCircuitBreaker } from '@/utils/circuitBreaker';

/**
 * Hórus OS — Core Execution Endpoint.
 * Entrada canônica: request → LangGraph → memory/confidence → decision → economic authorization → provider execution → reconciliation → execution log.
 */
export async function POST(req: Request) {
  const startedAt = new Date();
  let requestId = crypto.randomUUID();
  let eventType = '';
  let source = '';

  try {
    const body = await req.json();
    const { event_type, payload, source: requestSource } = body ?? {};
    const normalizedPayload = payload && typeof payload === 'object' ? payload : {};

    eventType = typeof event_type === 'string' ? event_type : '';
    source = typeof requestSource === 'string' ? requestSource : '';

    if (typeof normalizedPayload.request_id === 'string' && normalizedPayload.request_id.trim()) {
      requestId = normalizedPayload.request_id;
    }

    const result = await geminiCircuitBreaker.execute(() =>
      runHorusCore({
        event_type: eventType,
        payload: normalizedPayload,
        source,
      }),
    );

    const executionLogId = await persistHorusExecutionLog({
      requestId,
      eventType,
      source,
      startedAt,
      state: result,
      metadata: {
        endpoint: '/api/horus',
        economic_authorized: result.economicAuthorized,
        execution_attempt_id: result.executionAttemptId ?? null,
        execution_budget_id: result.executionBudgetId ?? null,
        routed_provider_id: result.routedProviderId ?? null,
        routed_model_id: result.routedModelId ?? null,
        actual_cost_brl: result.actualCostBrl ?? null,
        usage: result.usage ?? null,
      },
    });

    const status = result.error ? 400 : result.requiresHuman ? 202 : 200;

    return NextResponse.json(
      {
        success: !result.error,
        data: {
          request_id: requestId,
          execution_log_id: executionLogId,
          execution_attempt_id: result.executionAttemptId,
          execution_budget_id: result.executionBudgetId,
          economic_authorized: result.economicAuthorized,
          provider_id: result.routedProviderId,
          model_id: result.routedModelId,
          output: result.executionText,
          actual_cost_brl: result.actualCostBrl,
          usage: result.usage,
          action: result.action,
          confidence_score: result.confidence,
          requires_human_review: result.requiresHuman,
          memory_matches: result.memoryContext.length,
        },
        error: result.error,
      },
      { status },
    );
  } catch (error) {
    console.error('[Hórus Core] Erro de orquestração:', error);

    const executionLogId = await persistHorusExecutionError({
      requestId,
      eventType,
      source,
      startedAt,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        data: {
          request_id: requestId,
          execution_log_id: executionLogId,
        },
        error: error instanceof Error ? error.message : 'Erro interno de orquestração',
      },
      { status: 500 },
    );
  }
}
