import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/server';
import { runHorusCore } from '@/lib/core/horusGraph';
import { persistHorusExecutionError, persistHorusExecutionLog } from '@/lib/core/executionLog';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const startedAt = new Date();
  try {
    await requirePermission('ai.execute');
    const body = await req.json();
    const requestId = typeof body?.request_id === 'string' ? body.request_id.trim() : '';
    const reviewId = typeof body?.review_id === 'string' ? body.review_id.trim() : '';
    const payload = body?.payload && typeof body.payload === 'object' ? body.payload : null;
    const decision = body?.decision === 'approve' ? 'approve' : body?.decision === 'reject' ? 'reject' : '';

    if (!requestId || !reviewId || !decision) return NextResponse.json({ success: false, error: 'INVALID_REVIEW_REQUEST' }, { status: 400 });

    const supabase = getServiceSupabase();
    const { data: prior, error: priorError } = await supabase
      .from('horus_execution_logs')
      .select('id,status,metadata')
      .eq('request_id', requestId)
      .eq('requires_human_review', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (priorError) throw new Error(`HUMAN_REVIEW_LOOKUP_FAILED:${priorError.message}`);
    if (!prior) return NextResponse.json({ success: false, error: 'HUMAN_REVIEW_NOT_FOUND' }, { status: 404 });

    const metadata = { ...((prior.metadata ?? {}) as Record<string, unknown>), review_id: reviewId, review_decision: decision, reviewed_at: new Date().toISOString() };
    const { error: updateError } = await supabase.from('horus_execution_logs').update({ status: decision === 'approve' ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED', action: decision === 'approve' ? 'human_review_approved' : 'human_review_rejected', metadata }).eq('id', prior.id);
    if (updateError) throw new Error(`HUMAN_REVIEW_UPDATE_FAILED:${updateError.message}`);

    if (decision === 'reject') return NextResponse.json({ success: true, data: { request_id: requestId, review_id: reviewId, action: 'human_review_rejected' } });
    if (!payload) return NextResponse.json({ success: false, error: 'APPROVED_REVIEW_REQUIRES_PAYLOAD' }, { status: 400 });

    const result = await runHorusCore({ event_type: typeof body.event_type === 'string' ? body.event_type : 'human_review.approved', payload, source: 'human-review', humanApproval: { reviewId, approved: true } });
    const executionLogId = await persistHorusExecutionLog({ requestId, eventType: 'human_review.approved', source: 'human-review', startedAt, state: result, metadata: { review_id: reviewId, parent_review_log_id: prior.id } });
    return NextResponse.json({ success: !result.error, data: { request_id: requestId, review_id: reviewId, execution_log_id: executionLogId, action: result.action, economic_authorized: result.economicAuthorized, execution_attempt_id: result.executionAttemptId, pricing_snapshot_id: result.pricingSnapshotId, output: result.executionText, actual_cost_brl: result.actualCostBrl, usage: result.usage }, error: result.error }, { status: result.error ? 400 : 200 });
  } catch (error) {
    const executionLogId = await persistHorusExecutionError({ requestId: 'unknown', eventType: 'human_review', source: 'human-review', startedAt, error });
    return NextResponse.json({ success: false, data: { execution_log_id: executionLogId }, error: error instanceof Error ? error.message : 'HUMAN_REVIEW_FAILED' }, { status: 500 });
  }
}
