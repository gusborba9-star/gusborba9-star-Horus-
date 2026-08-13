import { buildTaskProfile, type TaskProfile } from '@/lib/nexus/task-profile';

export type PromptTaskProfile = TaskProfile;

export type OptimizedPrompt = {
  original: string;
  optimized: string;
  profile: PromptTaskProfile;
};

export function optimizePrompt(input: string, context: string[] = []): OptimizedPrompt {
  const original = input.trim();
  if (!original) throw new Error('PROMPT_EMPTY');
  const profile = buildTaskProfile(original);
  const contextBlock = context.filter(Boolean).slice(0, 8).map((item) => `- ${item.slice(0, 1200)}`).join('\n');
  const optimized = [
    'HORUS TASK INSTRUCTION',
    `Objective: ${profile.objective}`,
    `Complexity: ${profile.complexity}`,
    `Reasoning depth: ${profile.reasoningDepth}`,
    `Research required: ${profile.researchRequired ? 'yes' : 'no'}`,
    `Freshness required: ${profile.freshnessRequired ? 'yes' : 'no'}`,
    `Multimodal required: ${profile.multimodalRequired ? 'yes' : 'no'}`,
    `Context requirement: ${profile.contextRequirement}`,
    `Tool requirement: ${profile.toolRequirement}`,
    `Expected format: ${profile.expectedFormat}`,
    `Criticality: ${profile.criticality}`,
    `Latency preference: ${profile.latencyPreference}`,
    contextBlock ? `Relevant authorized context:\n${contextBlock}` : '',
    'Execution requirements:',
    ...profile.outputRequirements.map((item) => `- ${item}`),
    'User request:',
    original,
  ].filter(Boolean).join('\n');
  return { original, optimized, profile };
}

export { buildTaskProfile } from '@/lib/nexus/task-profile';
