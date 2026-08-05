import { getServiceSupabase } from '@/lib/supabase';

export type EconomicAuthorizationInput = {
  budgetId: string;
  providerId: string;
  modelId: string;
  capability: string;
  maximumCostBrl: number;
  maximumTotalCostBrl?: number;
  minimumRevenueBrl?: number;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  endpointId?: string;
  fallbackFromAttemptId?: string;
};

export type EconomicAuthorizationResult = {
  authorized: boolean;
  attemptId?: string;
  budgetId: string;
  maximumCostBrl: number;
  pricingSnapshotId?: string;
  error?: string;
};

function nonNegativeInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

export async function authorizeHorusExecution(input: EconomicAuthorizationInput): Promise<EconomicAuthorizationResult> {
  const supabase = getServiceSupabase();
  const maximumCostBrl = Number(input.maximumCostBrl);
  const maximumTotalCostBrl = Number(input.maximumTotalCostBrl ?? input.maximumCostBrl);
  const minimumRevenueBrl = Number(input.minimumRevenueBrl ?? 0);

  if (!Number.isFinite(maximumCostBrl) || maximumCostBrl < 0) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'invalid_maximum_cost_brl' };
  if (!Number.isFinite(maximumTotalCostBrl) || maximumTotalCostBrl < maximumCostBrl) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'invalid_maximum_total_cost_brl' };
  if (!Number.isFinite(minimumRevenueBrl) || minimumRevenueBrl < 0) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'invalid_minimum_revenue_brl' };

  const { data: budget, error: budgetError } = await supabase
    .from('execution_budgets')
    .select('id,pricing_snapshot_id,remaining_cost_brl,remaining_attempts,remaining_input_tokens,remaining_output_tokens,remaining_reasoning_tokens,revenue_allocated_brl,minimum_margin_rate,maximum_provider_cost_brl,maximum_total_cost_brl,maximum_tree_cost_brl,status')
    .eq('id', input.budgetId)
    .maybeSingle();

  if (budgetError) throw new Error(`Falha ao carregar execution budget: ${budgetError.message}`);
  if (!budget) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_budget_not_found' };
  if (!['AUTHORIZED', 'RUNNING'].includes(String(budget.status))) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: `execution_budget_not_active:${budget.status}` };
  if (Number(budget.remaining_attempts) <= 0) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_budget_attempts_exhausted' };
  if (maximumCostBrl > Number(budget.remaining_cost_brl)) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_budget_cost_exhausted' };
  if (maximumTotalCostBrl > Number(budget.maximum_total_cost_brl)) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_maximum_total_cost_exceeded' };
  if (maximumTotalCostBrl > Number(budget.maximum_tree_cost_brl)) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_tree_cost_exceeded' };
  if (minimumRevenueBrl > Number(budget.revenue_allocated_brl)) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_margin_guard_failed' };

  const maximumAuthorizedByMargin = Number(budget.revenue_allocated_brl) * (1 - Number(budget.minimum_margin_rate));
  if (!Number.isFinite(maximumAuthorizedByMargin) || maximumTotalCostBrl > maximumAuthorizedByMargin + 1e-8) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_minimum_margin_failed' };

  const inputTokens = nonNegativeInteger(input.inputTokens);
  const outputTokens = nonNegativeInteger(input.outputTokens);
  const reasoningTokens = nonNegativeInteger(input.reasoningTokens);
  if (inputTokens > Number(budget.remaining_input_tokens)) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_input_token_budget_exhausted' };
  if (outputTokens > Number(budget.remaining_output_tokens)) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_output_token_budget_exhausted' };
  if (reasoningTokens > Number(budget.remaining_reasoning_tokens)) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'execution_reasoning_token_budget_exhausted' };
  if (!budget.pricing_snapshot_id) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, error: 'PRICING_SNAPSHOT_REQUIRED' };

  const { count, error: attemptsError } = await supabase.from('execution_attempts').select('id', { count: 'exact', head: true }).eq('budget_id', input.budgetId);
  if (attemptsError) throw new Error(`Falha ao determinar attempt_number: ${attemptsError.message}`);
  const attemptNumber = (count ?? 0) + 1;

  const { data, error } = await supabase.rpc('authorize_horus_execution_attempt', {
    p_budget_id: input.budgetId,
    p_attempt_number: attemptNumber,
    p_provider_id: input.providerId,
    p_model_id: input.modelId,
    p_capability: input.capability,
    p_maximum_cost_brl: maximumCostBrl,
    p_input_tokens: inputTokens,
    p_output_tokens: outputTokens,
    p_reasoning_tokens: reasoningTokens,
    p_endpoint_id: input.endpointId ?? null,
    p_fallback_from_attempt_id: input.fallbackFromAttemptId ?? null,
  });

  if (error) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, pricingSnapshotId: String(budget.pricing_snapshot_id), error: error.message };
  const attempt = Array.isArray(data) ? data[0] : data;
  const attemptId = attempt && typeof attempt === 'object' && 'id' in attempt ? String(attempt.id) : undefined;
  if (!attemptId) return { authorized: false, budgetId: input.budgetId, maximumCostBrl, pricingSnapshotId: String(budget.pricing_snapshot_id), error: 'economic_authorization_missing_attempt_id' };

  const pricingSnapshotId = attempt && typeof attempt === 'object' && 'pricing_snapshot_id' in attempt
    ? String(attempt.pricing_snapshot_id ?? budget.pricing_snapshot_id)
    : String(budget.pricing_snapshot_id);

  return { authorized: true, attemptId, budgetId: input.budgetId, maximumCostBrl, pricingSnapshotId };
}
