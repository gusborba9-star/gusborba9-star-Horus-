import { createClient } from '@supabase/supabase-js';
import { getAccessTokenFromCookies } from '@/lib/auth/server';

function createUserScopedClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('SUPABASE_CLIENT_CONFIGURATION_MISSING');

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

function createSystemClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error('SUPABASE_SERVER_CONFIGURATION_MISSING');

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export interface CreditHold {
  id: string;
  user_id: string;
  operation_id: string;
  idempotency_key: string;
  reserved_credits: number;
  actual_credits: number | null;
  status: string;
}

async function getUserClient() {
  const token = await getAccessTokenFromCookies();
  if (!token) throw new Error('AUTHENTICATION_REQUIRED');
  return createUserScopedClient(token);
}

export async function reserveCredits(operationId: string, idempotencyKey: string, credits: number): Promise<CreditHold> {
  if (!Number.isSafeInteger(credits) || credits <= 0) throw new Error('INVALID_CREDIT_HOLD');
  const { data, error } = await (await getUserClient()).rpc('reserve_horus_credits', {
    p_operation_id: operationId,
    p_idempotency_key: idempotencyKey,
    p_amount: credits,
  }).single<CreditHold>();

  if (error || !data) throw new Error(`CREDIT_HOLD_FAILED:${error?.message ?? 'NO_RESULT'}`);
  return data;
}

/**
 * Reconciliation is intentionally privileged. User-scoped clients cannot decide
 * actual provider cost or settlement state.
 */
export async function reconcileCredits(): Promise<never> {
  throw new Error('PRIVILEGED_RECONCILIATION_REQUIRED');
}

export async function reconcileCreditsSystem(
  userId: string,
  holdId: string,
  actualCredits: number,
  status: 'SETTLED' | 'FAILED' | 'CANCELLED' = 'SETTLED',
): Promise<CreditHold> {
  if (!userId) throw new Error('INVALID_USER_ID');
  if (!Number.isSafeInteger(actualCredits) || actualCredits < 0) throw new Error('INVALID_ACTUAL_CREDIT_COST');

  const { data, error } = await createSystemClient().rpc('reconcile_horus_credit_hold_system', {
    p_user_id: userId,
    p_hold_id: holdId,
    p_actual_credits: actualCredits,
    p_status: status,
  }).single<CreditHold>();

  if (error || !data) throw new Error(`CREDIT_RECONCILIATION_FAILED:${error?.message ?? 'NO_RESULT'}`);
  return data;
}

/**
 * Overage review is also a system decision. A user can observe their review,
 * but cannot manufacture a provider overage or mutate its financial state.
 */
export async function flagCreditOverage(): Promise<never> {
  throw new Error('PRIVILEGED_OVERAGE_REVIEW_REQUIRED');
}

export async function flagCreditOverageSystem(userId: string, holdId: string, actualCredits: number): Promise<CreditHold> {
  if (!userId) throw new Error('INVALID_USER_ID');
  if (!Number.isSafeInteger(actualCredits) || actualCredits <= 0) throw new Error('INVALID_ACTUAL_CREDIT_COST');

  const { data, error } = await createSystemClient().rpc('flag_horus_credit_overage_system', {
    p_user_id: userId,
    p_hold_id: holdId,
    p_actual_credits: actualCredits,
  }).single<CreditHold>();

  if (error || !data) throw new Error(`CREDIT_OVERAGE_FLAG_FAILED:${error?.message ?? 'NO_RESULT'}`);
  return data;
}
