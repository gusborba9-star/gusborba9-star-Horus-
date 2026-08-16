import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveNexusPlan } from '@/lib/nexus/core';
import { estimateStudioPricing, type StudioEconomicPolicy, type StudioPricing } from '@/lib/studio/pricing';

export async function priceStudioProject(service: SupabaseClient, project: {
  objective: string;
  context?: unknown;
  requirements?: unknown;
  changeClass?: string;
}): Promise<StudioPricing & { optimizedPrompt: string }> {
  const { data: policy, error: policyError } = await service
    .from('economic_policy')
    .select('version,target_gross_margin_rate,minimum_gross_margin_rate,provider_fee_rate,infrastructure_rate,exchange_buffer_rate,safety_buffer_rate,pricing_drift_buffer_rate,usage_uncertainty_rate,retry_reserve_rate,failure_reserve_rate,fx_buffer_rate,credit_brl_value')
    .eq('id', true)
    .maybeSingle();
  if (policyError || !policy) throw new Error('STUDIO_ECONOMIC_POLICY_UNAVAILABLE');

  const normalizedPolicy: StudioEconomicPolicy = {
    version: Number(policy.version),
    targetGrossMarginRate: Number(policy.target_gross_margin_rate),
    minimumGrossMarginRate: Number(policy.minimum_gross_margin_rate),
    providerFeeRate: Number(policy.provider_fee_rate),
    infrastructureRate: Number(policy.infrastructure_rate),
    exchangeBufferRate: Number(policy.exchange_buffer_rate),
    safetyBufferRate: Number(policy.safety_buffer_rate),
    pricingDriftBufferRate: Number(policy.pricing_drift_buffer_rate),
    usageUncertaintyRate: Number(policy.usage_uncertainty_rate),
    retryReserveRate: Number(policy.retry_reserve_rate),
    failureReserveRate: Number(policy.failure_reserve_rate),
    fxBufferRate: Number(policy.fx_buffer_rate),
  };

  const context = [
    typeof project.context === 'string' ? project.context : JSON.stringify(project.context ?? {}),
    typeof project.requirements === 'string' ? project.requirements : JSON.stringify(project.requirements ?? {}),
  ].filter(Boolean);

  const routingBudget = Math.max(Number(policy.credit_brl_value ?? 0.01) * 10, 0.10);
  const plan = await resolveNexusPlan(service, {
    intent: project.objective,
    context,
    budgetBrl: routingBudget,
  });

  const pricing = estimateStudioPricing({
    optimizedPrompt: plan.optimized.prompt,
    changeClass: project.changeClass ?? 'MEDIUM',
    model: plan.model,
    policy: normalizedPolicy,
  });

  return { ...pricing, optimizedPrompt: plan.optimized.prompt };
}
