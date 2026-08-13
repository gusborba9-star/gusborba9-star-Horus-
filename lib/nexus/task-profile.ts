export type TaskProfile = {
  intent: string;
  objective: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoningDepth: 'LOW' | 'MEDIUM' | 'HIGH';
  researchRequired: boolean;
  freshnessRequired: boolean;
  multimodalRequired: boolean;
  contextRequirement: 'SMALL' | 'MEDIUM' | 'LARGE';
  toolRequirement: 'NONE' | 'OPTIONAL' | 'REQUIRED';
  expectedFormat: 'TEXT' | 'STRUCTURED' | 'ACTION' | 'UNKNOWN';
  criticality: 'LOW' | 'MEDIUM' | 'HIGH';
  latencyPreference: 'LOW' | 'BALANCED' | 'QUALITY';
  outputRequirements: string[];
  missingInformation: string[];
};

const HIGH_COMPLEXITY = ['estratégia', 'estratégico', 'arquitetura', 'auditoria', 'jurídico', 'juridico', 'financeiro', 'análise profunda', 'analise profunda', 'debug complexo', 'research', 'pesquisa profunda'];
const RESEARCH = ['pesquis', 'research', 'investig', 'fontes', 'comparar', 'compare'];
const FRESHNESS = ['hoje', 'agora', 'atual', 'atualizado', 'último', 'última', 'recentemente', 'preço', 'precos', 'preços', 'notícia', 'noticias', 'notícias'];
const MULTIMODAL = ['imagem', 'foto', 'vídeo', 'video', 'áudio', 'audio', 'pdf', 'documento anexado', 'arquivo anexado'];
const ACTION = ['envie', 'enviar', 'crie um lembrete', 'me lembre', 'adicione', 'agende', 'execute', 'faça por mim', 'abra', 'ligue'];
const STRUCTURED = ['json', 'tabela', 'checklist', 'passo a passo', 'estrutura', 'schema'];
const CRITICAL = ['jurídico', 'juridico', 'médico', 'medico', 'financeiro', 'pagamento', 'senha', 'segurança', 'seguranca'];

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

export function buildTaskProfile(input: string): TaskProfile {
  const intent = input.trim().replace(/\s+/g, ' ');
  const normalized = intent.toLowerCase();
  if (!intent) throw new Error('PROMPT_EMPTY');
  const complexity: TaskProfile['complexity'] = intent.length > 1200 || includesAny(normalized, HIGH_COMPLEXITY)
    ? 'HIGH'
    : intent.length > 300 || /\b(compare|comparar|analise|análise|planeje|planejar|explique|detalhadamente)\b/i.test(intent)
      ? 'MEDIUM'
      : 'LOW';
  const researchRequired = includesAny(normalized, RESEARCH);
  const freshnessRequired = includesAny(normalized, FRESHNESS);
  const multimodalRequired = includesAny(normalized, MULTIMODAL);
  const actionRequired = includesAny(normalized, ACTION);
  return {
    intent,
    objective: intent,
    complexity,
    reasoningDepth: complexity === 'HIGH' ? 'HIGH' : complexity === 'MEDIUM' ? 'MEDIUM' : 'LOW',
    researchRequired,
    freshnessRequired,
    multimodalRequired,
    contextRequirement: intent.length > 1800 ? 'LARGE' : intent.length > 600 ? 'MEDIUM' : 'SMALL',
    toolRequirement: actionRequired || researchRequired ? 'REQUIRED' : 'NONE',
    expectedFormat: actionRequired ? 'ACTION' : includesAny(normalized, STRUCTURED) ? 'STRUCTURED' : 'TEXT',
    criticality: includesAny(normalized, CRITICAL) ? 'HIGH' : complexity === 'HIGH' ? 'MEDIUM' : 'LOW',
    latencyPreference: freshnessRequired || researchRequired ? 'QUALITY' : complexity === 'HIGH' ? 'QUALITY' : 'BALANCED',
    outputRequirements: ['responder diretamente ao objetivo', 'preservar fatos fornecidos pelo usuário', 'explicitar incertezas relevantes', 'não inventar ações, dados ou fontes'],
    missingInformation: [],
  };
}
