import { getServiceSupabase } from '@/lib/supabase';

export type EconomicAuthorizationInput = {
  budgetId: string;
  providerId: string;
  modelId: string;
  capability: string;
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
  maximumCostBrl?: number;
  error?: string;
};

function nonNegativeInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

export async function authorizeHorusExecution(
  input: EconomicAuthorizationInput,
): Promise<EconomicAuthorizationResult> {
  const supabase = getServiceSupabase();

  const { data: budget, error: budgetError } = await supabase
    .from('execution_budgets')
    .select('id, maximum_provider_cost_brl, remaining_cost_brl, remaining_attempts, status')
    .eq('id', input.budgetId)
    .maybeSingle();

  if (budgetError) {
    throw new Error(`Falha ao carregar execution budget: ${budgetError.message}`);
  }

  if (!budget) {
    return {
      authorized: false,
      budgetId: input.budgetId,
      error: 'execution_budget_not_found',
    };
  }

  if (budget.status !== 'ACTIVE') {
    return {
      authorized: false,
      budgetId: input.budgetId,
      error: `execution_budget_not_active:${budget.status}`,
    };
  }

  if (Number(budget.remaining_attempts) <= 0) {
    return {
      authorized: false,
      budgetId: input.budgetId,
      error: 'execution_budget_attempts_exhausted',
    };
  }

  if (Number(budget.remaining_cost_brl) <= 0) {
    return {
      authorized: false,
      budgetId: input.budgetId,
      error: 'execution_budget_cost_exhausted',
    };
  }

  const { count, error: attemptsError } = await supabase
    .from('execution_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('budget_id', input.budgetId);

  if (attemptsError) {
    throw new Error(`Falha ao determinar attempt_number: ${attemptsError.message}`);
  }

  const attemptNumber = (count ?? 0) + 1;
  const maximumCostBrl = Number(budget.maximum_provider_cost_brl);

  const { data, error } = await supabase.rpc('authorize_horus_execution_attempt', {
    p_budget_id: input.budgetId,
    p_attempt_number: attemptNumber,
    p_provider_id: input.providerId,
    p_model_id: input.modelId,
    p_capability: input.capability,
    p_maximum_cost_brl: maximumCostBrl,
    p_input_tokens: nonNegativeInteger(input.inputTokens),
    p_output_tokens: nonNegativeInteger(input.outputTokens),
    p_reasoning_tokens: nonNegativeInteger(input.reasoningTokens),
    p_endpoint_id: input.endpointId ?? null,
    p_fallback_from_attempt_id: input.fallbackFromAttemptId ?? null,
  });

  if (error) {
    return {
      authorized: false,
      budgetId: input.budgetId,
      maximumCostBrl,
      error: error.message,
    };
  }

  const attempt = Array.isArray(data) ? data[0] : data;
  const attemptId = attempt && typeof attempt === 'object' && 'id' in attempt
    ? String(attempt.id)
    : undefined;

  if (!attemptId) {
    return {
      authorized: false,
      budgetId: input.budgetId,
      maximumCostBrl,
      error: 'economic_authorization_missing_attempt_id',
    };
  }

  return {
    authorized: true,
    attemptId,
    budgetId: input.budgetId,
    maximumCostBrl,
  };
}
