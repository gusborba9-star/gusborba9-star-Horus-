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

export interface CreditHold {
  id: string;
  user_id: string;
  operation_id: string;
  idempotency_key: string;
  reserved_credits: number;
  actual_credits: number | null;
  status: string;
}

export async function reserveCredits(operationId: string, idempotencyKey: string, credits: number): Promise<CreditHold> {
  if (!Number.isSafeInteger(credits) || credits <= 0) throw new Error('INVALID_CREDIT_HOLD');
  const token = await getAccessTokenFromCookies();
  if (!token) throw new Error('AUTHENTICATION_REQUIRED');

  const { data, error } = await createUserScopedClient(token).rpc('reserve_horus_credits', {
    p_operation_id: operationId,
    p_idempotency_key: idempotencyKey,
    p_amount: credits,
  }).single<CreditHold>();

  if (error || !data) throw new Error(`CREDIT_HOLD_FAILED:${error?.message ?? 'NO_RESULT'}`);
  return data;
}

export async function reconcileCredits(holdId: string, actualCredits: number, status: 'SETTLED' | 'FAILED' | 'CANCELLED' = 'SETTLED'): Promise<CreditHold> {
  if (!Number.isSafeInteger(actualCredits) || actualCredits < 0) throw new Error('INVALID_ACTUAL_CREDIT_COST');
  const token = await getAccessTokenFromCookies();
  if (!token) throw new Error('AUTHENTICATION_REQUIRED');

  const { data, error } = await createUserScopedClient(token).rpc('reconcile_horus_credit_hold', {
    p_hold_id: holdId,
    p_actual_credits: actualCredits,
    p_status: status,
  }).single<CreditHold>();

  if (error || !data) throw new Error(`CREDIT_RECONCILIATION_FAILED:${error?.message ?? 'NO_RESULT'}`);
  return data;
}
