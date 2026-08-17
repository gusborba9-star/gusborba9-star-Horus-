import type { ChangeClass, OptimizedExecutionSpec, ProjectState, StudioCapability, WorkType } from './types';
import { STUDIO_CAPABILITIES } from './types';

const MICRO = /\b(cor|cores|texto|label|copy|padding|margin|fonte|ícone|icone|spacing|espaçamento|typo|tipografia)\b/i;
const LOW = /\b(página|pagina|seção|secao|componente|filtro|campo|section|tela|screen)\b/i;
const MEDIUM = /\b(auth|autenticação|autenticacao|login|permissão|permissao|integração|integracao|api|database|banco|checkout|webhook)\b/i;
const MAJOR = /\b(pagamento|payments|arquitetura|migrar|migração|migracao|reestruturar|backend|infraestrutura|infra|multi-tenant|multitenant)\b/i;
const REBUILD = /\b(reconstru|reescrev|do zero|saas completo|transforme.*saas|rebuild|recrie.*inteiro)\b/i;

const REQUESTED_CAPABILITY_RULES: Array<[StudioCapability, RegExp]> = [
  ['IMAGE', /\b(imagem|foto|fotografia|logo|arte|visual|ilustra(?:ção|cao)|ger(?:ar|e)|criar uma imagem)\b/i],
  ['VIDEO', /\b(vídeo|video|reels|filme|clipe)\b/i],
  ['MUSIC', /\b(música|musica|canção|cancao|composição|composicao)\b/i],
  ['AUDIO', /\b(áudio|audio|podcast|voz|narração|narracao)\b/i],
  ['DOCS', /\b(documento|docs|contrato|relatório|relatorio)\b/i],
  ['CODE', /\b(código|codigo|software|frontend|backend|typescript|react|next|programa|script)\b/i],
  ['WEBSITES', /\b(site|website|landing|página|pagina|web)\b/i],
  ['APPS', /\b(saas|app|aplicativo|aplicação|aplicacao)\b/i],
  ['CAMPAIGNS', /\b(campanha|marketing|anúncio|anuncio)\b/i],
];

const WORK_TYPE_RULES: Array<[WorkType, RegExp]> = [
  ['LANDING_PAGE', /\b(landing page|landing)\b/i],
  ['MOBILE_APP', /\b(app|aplicativo|aplicação|aplicacao)\b.*\b(mobile|celular|android|ios)\b|\b(mobile|android|ios)\b.*\b(app|aplicativo)\b/i],
  ['WEB_APP', /\b(web app|aplicação web|aplicacao web)\b/i],
  ['WEBSITE', /\b(site|website|página|pagina|web)\b/i],
  ['CAMPAIGN', /\b(campanha|marketing|anúncio|anuncio)\b/i],
  ['GAME', /\b(jogo|game)\b/i],
  ['PRESENTATION', /\b(apresentação|apresentacao|slides|deck)\b/i],
  ['DATA_ANALYSIS', /\b(analis[ae]|analytics|dados|data analysis)\b/i],
  ['RESEARCH', /\b(pesquisa|research|investigue|investigação|investigacao)\b/i],
  ['AUTOMATION', /\b(automação|automacao|workflow|automatize)\b/i],
  ['DOCUMENT', /\b(documento|relatório|relatorio|contrato|pdf)\b/i],
  ['CODE', /\b(código|codigo|software|programa|script|backend|frontend)\b/i],
  ['IMAGE', /\b(imagem|foto|fotografia|logo|arte|visual|ilustra(?:ção|cao))\b/i],
  ['VIDEO', /\b(vídeo|video|reels|filme|clipe)\b/i],
  ['MUSIC', /\b(música|musica|canção|cancao|composição|composicao)\b/i],
  ['VOICE', /\b(voz|narração|narracao|locução|locucao)\b/i],
  ['AUDIO', /\b(áudio|audio|podcast)\b/i],
];

export function classifyChange(prompt: string): ChangeClass {
  const value = prompt.trim();
  if (REBUILD.test(value)) return 'REBUILD';
  if (MAJOR.test(value)) return 'MAJOR';
  if (MEDIUM.test(value)) return 'MEDIUM';
  if (LOW.test(value)) return 'LOW';
  if (MICRO.test(value)) return 'MICRO';
  return 'MEDIUM';
}

export function inferRequestedCapability(prompt: string, fallback: StudioCapability = 'CODE'): StudioCapability {
  const value = prompt.trim();
  for (const [capability, rule] of REQUESTED_CAPABILITY_RULES) {
    if (rule.test(value)) return capability;
  }
  return fallback;
}

export function inferWorkType(prompt: string, fallback: WorkType = 'TEXT'): WorkType {
  const value = prompt.trim();
  for (const [workType, rule] of WORK_TYPE_RULES) if (rule.test(value)) return workType;
  return fallback;
}

export function inferCapabilities(prompt: string, project: ProjectState, additionalContext: string[] = []): StudioCapability[] {
  const semanticInput = [prompt, ...additionalContext, ...project.requirements].filter(Boolean).join('\n').toLowerCase();
  const selected = new Set<StudioCapability>();
  if (/\b(site|website|landing|página|pagina|web)\b/.test(semanticInput)) selected.add('WEBSITES');
  if (/\b(saas|app|aplicativo|aplicação|aplicacao)\b/.test(semanticInput)) selected.add('APPS');
  if (/\b(código|codigo|software|frontend|backend|typescript|react|next)\b/.test(semanticInput)) selected.add('CODE');
  if (/\b(api|endpoint|rest|graphql)\b/.test(semanticInput)) selected.add('APIS');
  if (/\b(dashboard|painel|analytics)\b/.test(semanticInput)) selected.add('DASHBOARDS');
  if (/\b(automação|automacao|workflow|integração|integracao)\b/.test(semanticInput)) selected.add('AUTOMATIONS');
  if (/\b(música|musica|canção|cancao)\b/.test(semanticInput)) selected.add('MUSIC');
  if (/\b(áudio|audio|podcast|voz)\b/.test(semanticInput)) selected.add('AUDIO');
  if (/\b(vídeo|video|reels|filme)\b/.test(semanticInput)) selected.add('VIDEO');
  if (/\b(imagem|foto|fotografia|logo|arte|visual|ilustração|ilustracao)\b/.test(semanticInput)) selected.add('IMAGE');
  if (/\b(campanha|marketing|anúncio|anuncio)\b/.test(semanticInput)) selected.add('CAMPAIGNS');
  if (/\b(documento|docs|contrato|relatório|relatorio)\b/.test(semanticInput)) selected.add('DOCS');
  if (/\b(apresentação|apresentacao|slides)\b/.test(semanticInput)) selected.add('PRESENTATIONS');
  if (/\b(dev|engenharia|deploy|git|branch|commit|pull request)\b/.test(semanticInput)) selected.add('DEV');
  return [...selected].filter((capability) => STUDIO_CAPABILITIES.includes(capability));
}

function executionStrategy(changeClass: ChangeClass): OptimizedExecutionSpec['executionStrategy'] {
  if (changeClass === 'MICRO') return { planningDepth: 'DETERMINISTIC', recomputePolicy: 'DELTA_ONLY', requiresReplan: false };
  if (changeClass === 'LOW') return { planningDepth: 'ECONOMIC', recomputePolicy: 'AFFECTED_ARTIFACTS', requiresReplan: false };
  if (changeClass === 'MEDIUM') return { planningDepth: 'DEEP', recomputePolicy: 'AFFECTED_ARTIFACTS', requiresReplan: true };
  if (changeClass === 'MAJOR') return { planningDepth: 'DEEP', recomputePolicy: 'PROJECT_WIDE', requiresReplan: true };
  return { planningDepth: 'FULL_REBUILD', recomputePolicy: 'PROJECT_WIDE', requiresReplan: true };
}

function buildExecutionPrompt(args: { prompt: string; project: ProjectState; changeClass: ChangeClass; capabilities: StudioCapability[]; requestedCapability: StudioCapability; workType: WorkType; }): string {
  return [
    'NEXUS OPTIMIZED EXECUTION SPECIFICATION',
    `USER INTENT: ${args.prompt}`,
    `OBJECTIVE: ${args.project.objective}`,
    `WORK TYPE: ${args.workType}`,
    `CHANGE CLASS: ${args.changeClass}`,
    `REQUESTED CAPABILITY: ${args.requestedCapability}`,
    `PROJECT CAPABILITIES (CONTEXT): ${args.capabilities.join(', ')}`,
    `PROJECT CONTEXT: ${JSON.stringify(args.project.context)}`,
    `REQUIREMENTS: ${JSON.stringify(args.project.requirements)}`,
    `CURRENT ARCHITECTURE: ${JSON.stringify(args.project.architecture)}`,
    'RULES: preserve existing contracts; keep providers invisible to the user; require authorization before billable execution; preview before production; produce auditable revisions and real artifacts.',
  ].join('\n');
}

export function buildOptimizedSpec(args: { prompt: string; project: ProjectState; requirements?: unknown[]; maxCostBrl?: number | null; conversationContext?: string[]; }): OptimizedExecutionSpec {
  const changeClass = classifyChange(args.prompt);
  const workType = inferWorkType(args.prompt);
  const requestedCapability = inferRequestedCapability(args.prompt, workType === 'IMAGE' ? 'IMAGE' : args.project.capabilities[0] ?? 'CODE');
  const capabilities = inferCapabilities(args.prompt, args.project, args.conversationContext ?? []);
  if (capabilities.length === 0) capabilities.push(requestedCapability);
  return {
    userPrompt: args.prompt,
    optimizedExecutionPrompt: buildExecutionPrompt({ prompt: args.prompt, project: args.project, changeClass, capabilities, requestedCapability, workType }),
    objective: args.project.objective,
    workType,
    changeClass,
    context: args.project.context,
    requirements: args.requirements ?? args.project.requirements,
    projectState: { identity: args.project.identity, architecture: args.project.architecture, executionGraph: args.project.executionGraph, environment: args.project.environment, environmentState: args.project.environmentState, delivery: args.project.delivery },
    capabilities,
    requestedCapability,
    connectors: args.project.connectors,
    executionStrategy: executionStrategy(changeClass),
    economicConstraints: { maxCostBrl: args.maxCostBrl ?? null, economicAuthorizationRequired: true },
    executionPolicy: { providerInvisible: true, productionApprovalRequired: true, previewFirst: true },
  };
}

export function revisionRisk(changeClass: ChangeClass): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (changeClass === 'MICRO' || changeClass === 'LOW') return 'LOW';
  if (changeClass === 'MEDIUM') return 'MEDIUM';
  if (changeClass === 'MAJOR') return 'HIGH';
  return 'CRITICAL';
}
