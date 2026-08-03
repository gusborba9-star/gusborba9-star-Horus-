import { createClient } from '@supabase/supabase-js';
import type { CostPolicy } from './cost-engine';
function client() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url || !key) throw new Error('SUPABASE_SERVER_CONFIGURATION_MISSING'); return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }); }
export async function getEconomicPolicy(): Promise<CostPolicy> {
  const db = client();
  const [{ data: policy, error: policyError }, { data: fx, error: fxError }] = await Promise.all([db.from('economic_policy').select('*').eq('id', true).single(), db.from('fx_rates').select('*').eq('base_currency', 'USD').eq('quote_currency', 'BRL').single()]);
  if (policyError) throw new Error(`ECONOMIC_POLICY_UNAVAILABLE:${policyError.message}`);
  if (fxError) throw new Error(`FX_RATE_UNAVAILABLE:${fxError.message}`);
  if (!fx || new Date(fx.expires_at).getTime() <= Date.now()) throw new Error('FX_RATE_EXPIRED');
  return { fxRateUsdToBrl: Number(fx.rate), exchangeBufferRate: Number(policy.exchange_buffer_rate), safetyBufferRate: Number(policy.safety_buffer_rate), infrastructureRate: Number(policy.infrastructure_rate), creditBrlValue: Number(policy.credit_brl_value) };
}
