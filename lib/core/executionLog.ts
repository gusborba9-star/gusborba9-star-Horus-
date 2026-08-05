import { getServiceSupabase } from '@/lib/supabase';
import type { HorusCoreState } from './horusGraph';

export type HorusExecutionLogInput = { requestId: string; eventType: string; source: string; startedAt: Date; state: HorusCoreState; metadata?: Record<string, unknown> };

export async function persistHorusExecutionLog(input: HorusExecutionLogInput): Promise<string | null> {
  const completedAt = new Date();
  const status = input.state.error ? 'ERROR' : input.state.requiresHuman ? 'HUMAN_REVIEW' : 'COMPLETED';
  try {
    const { data, error } = await getServiceSupabase().from('horus_execution_logs').insert({
      request_id: input.requestId,
      event_type: input.eventType,
      source: input.source,
      action: input.state.action,
      status,
      confidence: input.state.confidence,
      requires_human_review: input.state.requiresHuman,
      memory_matches: input.state.memoryContext.length,
      error_message: input.state.error ?? null,
      started_at: input.startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      latency_ms: Math.max(0, completedAt.getTime() - input.startedAt.getTime()),
      metadata: { ...(input.metadata ?? {}), pricing_snapshot_id: input.state.pricingSnapshotId ?? null, endpoint_id: input.state.endpointId ?? null },
    }).select('id').single();
    if (error) { console.error('[Hórus Execution Log] Falha ao persistir evento:', error.message); return null; }
    return data?.id ?? null;
  } catch (error) {
    console.error('[Hórus Execution Log] Erro inesperado ao persistir evento:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function persistHorusExecutionError(input: { requestId: string; eventType: string; source: string; startedAt: Date; error: unknown }): Promise<string | null> {
  const completedAt = new Date();
  const message = input.error instanceof Error ? input.error.message : 'Erro interno de execução';
  try {
    const { data, error } = await getServiceSupabase().from('horus_execution_logs').insert({
      request_id: input.requestId, event_type: input.eventType, source: input.source, action: 'execution_error', status: 'ERROR', confidence: 0,
      requires_human_review: false, memory_matches: 0, error_message: message, started_at: input.startedAt.toISOString(), completed_at: completedAt.toISOString(),
      latency_ms: Math.max(0, completedAt.getTime() - input.startedAt.getTime()), metadata: { error_type: input.error instanceof Error ? input.error.name : 'unknown' },
    }).select('id').single();
    if (error) { console.error('[Hórus Execution Log] Falha ao persistir erro:', error.message); return null; }
    return data?.id ?? null;
  } catch (error) {
    console.error('[Hórus Execution Log] Erro inesperado ao persistir erro:', error instanceof Error ? error.message : error);
    return null;
  }
}
