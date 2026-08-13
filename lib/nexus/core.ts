import type { SupabaseClient } from '@supabase/supabase-js';
import { optimizePrompt, type OptimizedPrompt } from './prompt-optimizer';
import { resolveAdaptiveModel, type ModelCatalogEntry, type RoutedModel } from './model-router';

export type NexusCoreInput = {
  intent: string;
  context: string[];
  budgetBrl: number;
  liveCatalog?: ModelCatalogEntry[];
};

export type NexusCorePlan = {
  optimized: OptimizedPrompt;
  model: RoutedModel;
  context: string[];
  routing: {
    providerNeutral: true;
    objective: 'BEST_FIT';
    factors: readonly ['quality', 'cost', 'latency', 'reliability', 'context', 'modality', 'task_profile'];
  };
};

/**
 * Shared cognitive planning boundary for Personal and Collaborator surfaces.
 * Provider/model-specific primitives remain implementation details of the Nexus.
 */
export async function resolveNexusPlan(service: SupabaseClient, input: NexusCoreInput): Promise<NexusCorePlan> {
  const context = input.context.filter(Boolean).slice(0, 8).map((item) => item.slice(0, 1200));
  const optimized = optimizePrompt(input.intent, context);
  const model = await resolveAdaptiveModel(service, optimized.profile, input.budgetBrl, input.liveCatalog ?? []);
  return {
    optimized,
    model,
    context,
    routing: {
      providerNeutral: true,
      objective: 'BEST_FIT',
      factors: ['quality', 'cost', 'latency', 'reliability', 'context', 'modality', 'task_profile'],
    },
  };
}

export function buildNexusExecutionMetadata(plan: NexusCorePlan) {
  return {
    prompt_optimization: true,
    task_profile: plan.optimized.profile,
    bounded_memory: plan.context.length,
    provider_id: plan.model.providerId,
    model_id: plan.model.modelId,
    routing_source: plan.model.source,
    routing_objective: plan.routing.objective,
    routing_factors: plan.routing.factors,
    provider_neutral: plan.routing.providerNeutral,
  };
}
