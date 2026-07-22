export const MODEL_LAYERS = {
  LIGHT: [
    'deepseek/deepseek-chat',
    'google/gemini-2.5-flash-lite',
    'meta-llama/llama-3.3-70b-instruct:free'
  ],
  HEAVY: [
    'anthropic/claude-3.5-sonnet',
    'deepseek/deepseek-reasoner'
  ],
  BACKUP_GEMINI: 'gemini-2.5-pro'
};

export type Complexity = 'light' | 'heavy';

export interface AgentProfile {
  name: string;
  niche: string;
  role: string;
  complexity: Complexity;
}

export function getModelChain(complexity: Complexity): string[] {
  return complexity === 'heavy' ? MODEL_LAYERS.HEAVY : MODEL_LAYERS.LIGHT;
}
