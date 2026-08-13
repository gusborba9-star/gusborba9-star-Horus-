import type { SupabaseClient } from '@supabase/supabase-js';

export type PersonalActionPlan = {
  action: 'REMINDERS_CREATE';
  title: string;
  dueAt: string | null;
  capabilityId: string;
};

export function parsePersonalAction(intent: string): PersonalActionPlan | null {
  const normalized = intent.trim();
  const reminderMatch = normalized.match(/(?:me\s+)?(?:lembre|lembrar|crie\s+um\s+lembrete)\s+(?:de\s+)?(.+)/i);
  if (!reminderMatch) return null;
  const title = reminderMatch[1].trim().replace(/[.!?]+$/, '');
  if (!title) return null;
  return { action: 'REMINDERS_CREATE', title, dueAt: null, capabilityId: 'REMINDERS_CREATE' };
}

export async function assertPersonalCapabilityGrant(
  service: SupabaseClient,
  userId: string,
  capabilityId: string,
  confirmed: boolean,
) {
  const { data, error } = await service
    .from('personal_capability_grants')
    .select('id,capability_id,scope,autonomy,confirmation_required,status')
    .eq('user_id', userId)
    .eq('capability_id', capabilityId)
    .eq('status', 'GRANTED')
    .maybeSingle();
  if (error) throw new Error(`PERSONAL_PERMISSION_LOOKUP_FAILED:${error.message}`);
  if (!data) throw new Error('PERSONAL_PERMISSION_REQUIRED');
  if (!['EXECUTE', 'AUTONOMOUS'].includes(data.autonomy)) throw new Error('PERSONAL_ACTION_AUTONOMY_BLOCKED');
  if (data.confirmation_required && !confirmed) throw new Error('PERSONAL_ACTION_CONFIRMATION_REQUIRED');
  return data;
}

export async function createReminder(
  service: SupabaseClient,
  userId: string,
  deviceId: string | null,
  plan: PersonalActionPlan,
  sourceExecutionId: string | null,
) {
  const { data, error } = await service.from('personal_reminders').insert({ user_id: userId, device_id: deviceId, title: plan.title, due_at: plan.dueAt, status: 'ACTIVE', source_execution_id: sourceExecutionId }).select('*').single();
  if (error || !data) throw new Error(`PERSONAL_REMINDER_CREATE_FAILED:${error?.message ?? 'UNKNOWN'}`);
  return data;
}
