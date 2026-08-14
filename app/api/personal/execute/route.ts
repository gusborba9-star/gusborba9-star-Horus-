import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { executePersonalText, loadPersonalContext, assertActiveDevice } from '@/lib/personal/engine';
import { parsePersonalAction, assertPersonalCapabilityGrant, createReminder } from '@/lib/personal/actions';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'PERSONAL_EXECUTION_FAILED';
  const status = message === 'AUTHENTICATION_REQUIRED' ? 401
    : message === 'PERSONAL_SUBSCRIPTION_REQUIRED' || message === 'PERSONAL_NOT_ACTIVATED' ? 403
    : message === 'PERSONAL_PERMISSION_REQUIRED' || message === 'PERSONAL_ACTION_CONFIRMATION_REQUIRED' || message === 'PERSONAL_ACTION_AUTONOMY_BLOCKED' ? 403
    : message === 'IDEMPOTENCY_KEY_REUSE_MISMATCH' ? 409
    : message === 'PERSONAL_DEVICE_NOT_ACTIVE' ? 403
    : 400;
  return NextResponse.json({ success: false, error: message }, { status });
}

async function recoverIdempotentAction(service: ReturnType<typeof getServiceSupabase>, userId: string, idempotencyKey: string, requestHash: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const { data: existing, error } = await service.from('personal_executions').select('*').eq('user_id', userId).eq('idempotency_key', idempotencyKey).single();
    if (error || !existing) throw new Error(`PERSONAL_ACTION_IDEMPOTENCY_RECOVERY_FAILED:${error?.message ?? 'NOT_FOUND'}`);
    if (existing.request_hash !== requestHash) throw new Error('IDEMPOTENCY_KEY_REUSE_MISMATCH');
    if (existing.status === 'SUCCEEDED' || existing.status === 'FAILED') {
      return NextResponse.json({ success: existing.status === 'SUCCEEDED', replay: true, execution: existing, reminder: existing.result?.reminder_id ? { id: existing.result.reminder_id } : undefined }, { status: existing.status === 'SUCCEEDED' ? 200 : 500 });
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('PERSONAL_ACTION_IDEMPOTENCY_IN_PROGRESS');
}

export async function GET(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const service = getServiceSupabase();
    const deviceId = request.headers.get('x-horus-device-id');
    await assertActiveDevice(service, user.id, deviceId);
    const { data, error } = await service.from('personal_executions').select('id,persona_id,kind,intent,task_profile,provider_id,model_id,status,result,error_code,error_message,created_at,completed_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
    if (error) throw new Error(`PERSONAL_EXECUTION_HISTORY_FAILED:${error.message}`);
    return NextResponse.json({ success: true, executions: data ?? [] });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const body = await request.json();
    const intent = typeof body.intent === 'string' ? body.intent.trim() : '';
    const idempotencyKey = request.headers.get('idempotency-key')?.trim() || (typeof body.idempotency_key === 'string' ? body.idempotency_key.trim() : '');
    const deviceId = request.headers.get('x-horus-device-id') || (typeof body.device_id === 'string' ? body.device_id : null);
    const confirmed = body.confirmed === true;
    if (!intent) throw new Error('INTENT_REQUIRED');
    if (!idempotencyKey || idempotencyKey.length > 160) throw new Error('IDEMPOTENCY_KEY_REQUIRED');

    const service = getServiceSupabase();
    const context = await loadPersonalContext(service, user.id);
    await assertActiveDevice(service, user.id, deviceId);
    const actionPlan = parsePersonalAction(intent);
    if (actionPlan) {
      const requestHash = `${actionPlan.capabilityId}:${actionPlan.title}`;
      const grant = await assertPersonalCapabilityGrant(service, user.id, actionPlan.capabilityId, confirmed);
      const { data: execution, error: executionError } = await service.from('personal_executions').insert({ user_id: user.id, device_id: deviceId, persona_id: context.profile.persona_id, kind: 'ACTION', intent, task_profile: { expectedFormat: 'ACTION', action: actionPlan.action }, prompt_original: intent, prompt_optimized: intent, capability_id: actionPlan.capabilityId, autonomy: grant.autonomy, policy_decision: { permission_grant_id: grant.id, scope: grant.scope, confirmation_required: grant.confirmation_required, autonomy: grant.autonomy }, memory_context: [], idempotency_key: idempotencyKey, request_hash: requestHash, status: 'RUNNING' }).select('*').single();
      if (executionError) {
        if (executionError.code !== '23505') throw new Error(`PERSONAL_ACTION_EXECUTION_CREATE_FAILED:${executionError.message}`);
        return recoverIdempotentAction(service, user.id, idempotencyKey, requestHash);
      }
      if (!execution) throw new Error('PERSONAL_ACTION_EXECUTION_CREATE_FAILED:EMPTY');

      const { data: log, error: logError } = await service.from('horus_execution_logs').insert({ request_id: execution.id, event_type: 'PERSONAL_ACTION', source: 'personal', action: actionPlan.action, status: 'RUNNING', confidence: 1, requires_human_review: false, memory_matches: 0, error_message: null, metadata: { capability_id: actionPlan.capabilityId, permission_grant_id: grant.id } }).select('id').single();
      if (logError || !log) throw new Error(`PERSONAL_ACTION_LOG_CREATE_FAILED:${logError?.message ?? 'UNKNOWN'}`);
      const reminder = await createReminder(service, user.id, deviceId, actionPlan, execution.id);
      const { data: finalExecution } = await service.from('personal_executions').update({ status: 'SUCCEEDED', execution_log_id: log.id, result: { action: actionPlan.action, reminder_id: reminder.id, persona_id: context.profile.persona_id }, completed_at: new Date().toISOString() }).eq('id', execution.id).select('*').single();
      await service.from('horus_execution_logs').update({ status: 'COMPLETED', completed_at: new Date().toISOString(), metadata: { capability_id: actionPlan.capabilityId, permission_grant_id: grant.id, reminder_id: reminder.id } }).eq('id', log.id);
      await service.from('personal_permission_audit').insert({ user_id: user.id, grant_id: grant.id, capability_id: actionPlan.capabilityId, action: 'CHECK', metadata: { result: 'ALLOWED', action: actionPlan.action } });
      return NextResponse.json({ success: true, replay: false, action: actionPlan.action, reminder, execution: finalExecution });
    }

    const result = await executePersonalText({ userId: user.id, deviceId, intent, idempotencyKey });
    return NextResponse.json({ success: true, ...result });
  } catch (error) { return errorResponse(error); }
}
