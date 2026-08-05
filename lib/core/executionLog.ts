import { getServiceSupabase } from '@/lib/supabase';
import type { HorusCoreState } from './horusGraph';

export type HorusExecutionLogInput = {
  requestId: string;
  eventType: string;
  source: string;
  startedAt: Date;
  state: HorusCoreState;
  metadata?: Record<string, unknown>;
};

export async function persistHorusExecutionLog(input: HorusExecutionLogInput): Promise<string | null> {
  const completedAt = new Date();
  const status = input.state.error
    ? 'ERROR'
    : input.state.requiresHuman
      ? 'HUMAN_REVIEW'
      : 'COMPLETED';

  const { data, error } = await getServiceSupabase()
    .from('horus_execution_logs')
    .insert({
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
      metadata: input.metadata ?? {},
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Hórus Execution Log] Falha ao persistir evento:', error.message);
    return null;
  }

  return data?.id ?? null;
}
