import type { StudioCapabilityId, StudioPlan, StudioConnectorProvider } from './types';

const CAPABILITY_KEYWORDS: Array<{ id: StudioCapabilityId; terms: string[] }> = [
  { id: 'CODE', terms: ['código', 'software', 'saas', 'programa', 'backend', 'frontend', 'desenvolvimento'] },
  { id: 'DEV', terms: ['dev', 'desenvolver', 'engenharia', 'refatorar', 'bug', 'typescript', 'api'] },
  { id: 'APPS', terms: ['app', 'aplicativo', 'mobile'] },
  { id: 'WEBSITES', terms: ['site', 'website', 'landing', 'página'] },
  { id: 'APIS', terms: ['api', 'endpoint', 'integração'] },
  { id: 'DASHBOARDS', terms: ['dashboard', 'painel', 'métricas', 'analytics'] },
  { id: 'DOCS', terms: ['documento', 'documentação', 'manual', 'relatório'] },
  { id: 'PRESENTATIONS', terms: ['apresentação', 'slides', 'pitch'] },
  { id: 'IMAGE', terms: ['imagem', 'logo', 'identidade visual', 'arte'] },
  { id: 'MUSIC', terms: ['música', 'canção', 'trilha', 'jingle'] },
  { id: 'AUDIO', terms: ['áudio', 'voz', 'podcast', 'narração'] },
  { id: 'VIDEO', terms: ['vídeo', 'filme', 'reels', 'animação'] },
  { id: 'CAMPAIGNS', terms: ['campanha', 'marketing', 'publicidade', 'anúncio'] },
  { id: 'AUTOMATIONS', terms: ['automação', 'workflow', 'rotina', 'processo'] },
];

function hasTerm(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function selectCapabilities(objective: string): StudioCapabilityId[] {
  const text = objective.trim().toLowerCase();
  const selected = CAPABILITY_KEYWORDS.filter(({ terms }) => hasTerm(text, terms)).map(({ id }) => id);
  if (selected.length > 0) return Array.from(new Set(selected));
  return ['DOCS'];
}

export function classifyComplexity(objective: string, capabilities: StudioCapabilityId[]): StudioPlan['complexity'] {
  const text = objective.trim().toLowerCase();
  if (capabilities.length >= 5 || /plataforma|ecossistema|reconstruir|enterprise|arquitetura/.test(text)) return 'MAJOR_REBUILD';
  if (capabilities.length >= 3 || /sistema|integração|saas|automação/.test(text)) return 'ARCHITECTURAL';
  if (capabilities.length === 2 || text.length > 180) return 'LOCALIZED';
  return 'SIMPLE';
}

export function selectIntegrations(capabilities: StudioCapabilityId[]): StudioConnectorProvider[] {
  const integrations = new Set<StudioConnectorProvider>();
  if (capabilities.includes('CODE') || capabilities.includes('DEV') || capabilities.includes('APIS') || capabilities.includes('WEBSITES')) integrations.add('github');
  if (capabilities.includes('CODE') || capabilities.includes('DEV') || capabilities.includes('WEBSITES') || capabilities.includes('APPS')) integrations.add('vercel');
  if (capabilities.includes('CODE') || capabilities.includes('DEV') || capabilities.includes('APIS') || capabilities.includes('DASHBOARDS')) integrations.add('supabase');
  return [...integrations];
}

export function buildExecutionGraph(capabilities: StudioCapabilityId[]): StudioPlan['execution_graph'] {
  return capabilities.map((capability, index) => ({
    id: `capability-${index + 1}`,
    capability,
    depends_on: index === 0 ? [] : [`capability-${index}`],
  }));
}

export function buildPlan(objective: string, environment: StudioPlan['environment'] = 'PREVIEW'): StudioPlan {
  const capabilities = selectCapabilities(objective);
  const integrations = selectIntegrations(capabilities);
  const complexity = classifyComplexity(objective, capabilities);
  return {
    objective: objective.trim(),
    complexity,
    capabilities,
    integrations,
    execution_graph: buildExecutionGraph(capabilities),
    approval_required: environment === 'PRODUCTION' || complexity === 'MAJOR_REBUILD',
    environment,
    estimated_cost_brl: null,
  };
}
