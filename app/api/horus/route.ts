import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/server';
import { persistHorusExecutionError, persistHorusExecutionLog } from '@/lib/core/executionLog';
import { runHorusCore } from '@/lib/core/horusGraph';
import { geminiCircuitBreaker } from '@/utils/circuitBreaker';

function apiError(error: unknown): { status: number; code: string } {
  if (error instanceof Error) {
    if (error.message === 'AUTHENTICATION_REQUIRED') return { status: 401, code: 'AUTHENTICATION_REQUIRED' };
    if (error.message === 'FORBIDDEN') return { status: 403, code: 'FORBIDDEN' };
    if (error.name === 'SyntaxError') return { status: 400, code: 'INVALID_JSON' };
  }
  return { status: 500, code: 'INTERNAL_SERVER_ERROR' };
}

function publicCoreError(error?: string): string | undefined {
  if (!error) return undefined;
  const base = error.split(':', 1)[0];
  const safe = /^[A-Za-z][A-Za-z0-9_]*$/.test(base);
  if (!safe) return 'CORE_EXECUTION_FAILED';
  const known = new Set([
    'economic_authorization_requires_budget_and_input',
    'provider_execution_not_supported',
    'INVALID_MAX_OUTPUT_TOKENS',
    'PRICING_STALE_OR_UNAVAILABLE',
    'economic_pricing_unavailable',
    'economic_authorization_denied',
    'economic_authorization_missing_attempt_id',
    'execution_budget_not_found',
    'execution_budget_not_active',
    'execution_budget_attempts_exhausted',
    'execution_budget_cost_exhausted',
    'execution_maximum_total_cost_exceeded',
    'execution_tree_cost_exceeded',
    'execution_margin_guard_failed',
    'execution_minimum_margin_failed',
    'execution_input_token_budget_exhausted',
    'execution_output_token_budget_exhausted',
    'execution_reasoning_token_budget_exhausted',
    'PRICING_SNAPSHOT_REQUIRED',
    'ECONOMIC_BUDGET_EXHAUSTED',
    'TOKEN_BUDGET_EXCEEDED',
    'EXECUTION_ATTEMPT_LIMIT_EXCEEDED',
    'DUPLICATE_EXECUTION_ATTEMPT',
    'INVALID_ATTEMPT_BUDGET',
  ]);
  return known.has(base) ? base : 'CORE_EXECUTION_FAILED';
}

export async function POST(req: Request) {
  const startedAt = new Date();
  let requestId = crypto.randomUUID();
  let eventType = '';
  let source = '';
  let ownerScope: string | null = null;
  let ownerUserId: string | null = null;
  let ownerOrganizationId: string | null = null;

  try {
    const authorization = await requirePermission('ai.execute');
    ownerUserId = authorization.user.id;
    ownerOrganizationId = authorization.user.organizationId;
    ownerScope = ownerOrganizationId ? `org:${ownerOrganizationId}` : `user:${ownerUserId}`;

    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'INVALID_REQUEST_BODY' }, { status: 400 });
    }
    const { event_type, payload, source: requestSource } = body as Record<string, unknown>;
    const normalizedPayload = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload as Record<string, unknown> : {};
    eventType = typeof event_type === 'string' ? event_type : '';
    source = typeof requestSource === 'string' ? requestSource : '';
    if (typeof normalizedPayload.request_id === 'string' && normalizedPayload.request_id.trim()) requestId = normalizedPayload.request_id.trim();

    const result = await geminiCircuitBreaker.execute(() => runHorusCore({ event_type: eventType, payload: normalizedPayload, source }));
    const executionLogId = await persistHorusExecutionLog({
      requestId, eventType, source, startedAt, state: result,
      ownership: { ownerScope, userId: ownerUserId, organizationId: ownerOrganizationId },
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
      error: publicCoreError(result.error),
    }, { status });
  } catch (error) {
    const authError = apiError(error);
    if (authError.status === 401 || authError.status === 403 || authError.status === 400) {
      return NextResponse.json({ success: false, error: authError.code }, { status: authError.status });
    }

    console.error('[Hórus Core] Erro de orquestração:', error instanceof Error ? error.message : 'unknown error');
    const executionLogId = await persistHorusExecutionError({
      requestId,
      eventType,
      source,
      startedAt,
      error,
      ownership: { ownerScope, userId: ownerUserId, organizationId: ownerOrganizationId },
    });
    return NextResponse.json({ success: false, data: { request_id: requestId, execution_log_id: executionLogId }, error: authError.code }, { status: authError.status });
  }
}
