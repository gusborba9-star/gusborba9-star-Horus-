export type PromptTaskProfile = {
  intent: string;
  objective: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoningDepth: 'LOW' | 'MEDIUM' | 'HIGH';
  freshnessRequired: boolean;
  multimodalRequired: boolean;
  contextRequirement: 'SMALL' | 'MEDIUM' | 'LARGE';
  outputRequirements: string[];
  missingInformation: string[];
};

export type OptimizedPrompt = {
  original: string;
  optimized: string;
  profile: PromptTaskProfile;
};

const HIGH_COMPLEXITY = ['estratégia', 'estratégico', 'arquitetura', 'auditoria', 'jurídico', 'juridico', 'financeiro', 'análise profunda', 'analise profunda', 'debug complexo', 'research', 'pesquisa profunda'];
const FRESHNESS = ['hoje', 'agora', 'atual', 'atualizado', 'último', 'última', 'recentemente', 'preço', 'precos', 'preços', 'notícia', 'noticias', 'notícias'];
const MULTIMODAL = ['imagem', 'foto', 'vídeo', 'video', 'áudio', 'audio', 'pdf', 'documento anexado', 'arquivo anexado'];

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function inferComplexity(text: string): PromptTaskProfile['complexity'] {
  if (text.length > 1200 || includesAny(text, HIGH_COMPLEXITY)) return 'HIGH';
  if (text.length > 300 || /\b(compare|comparar|analise|análise|planeje|planejar|explique|detalhadamente)\b/i.test(text)) return 'MEDIUM';
  return 'LOW';
}

export function buildTaskProfile(input: string): PromptTaskProfile {
  const intent = input.trim().replace(/\s+/g, ' ');
  const complexity = inferComplexity(intent);
  return {
    intent,
    objective: intent,
    complexity,
    reasoningDepth: complexity === 'HIGH' ? 'HIGH' : complexity === 'MEDIUM' ? 'MEDIUM' : 'LOW',
    freshnessRequired: includesAny(intent.toLowerCase(), FRESHNESS),
    multimodalRequired: includesAny(intent.toLowerCase(), MULTIMODAL),
    contextRequirement: intent.length > 1800 ? 'LARGE' : intent.length > 600 ? 'MEDIUM' : 'SMALL',
    outputRequirements: ['responder diretamente ao objetivo', 'preservar fatos fornecidos pelo usuário', 'explicitar incertezas relevantes', 'não inventar ações, dados ou fontes'],
    missingInformation: [],
  };
}

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
    `Freshness required: ${profile.freshnessRequired ? 'yes' : 'no'}`,
    `Multimodal required: ${profile.multimodalRequired ? 'yes' : 'no'}`,
    `Context requirement: ${profile.contextRequirement}`,
    contextBlock ? `Relevant authorized context:\n${contextBlock}` : '',
    'Execution requirements:',
    ...profile.outputRequirements.map((item) => `- ${item}`),
    'User request:',
    original,
  ].filter(Boolean).join('\n');
  return { original, optimized, profile };
}
