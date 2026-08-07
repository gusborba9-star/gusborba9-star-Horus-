import type { ChangeClass, OptimizedExecutionSpec, ProjectState, StudioCapability } from './types';
import { STUDIO_CAPABILITIES } from './types';

const MICRO = /\b(cor|cor(es)?|texto|label|copy|padding|margin|fonte|ícone|icone|spacing|espaçamento)\b/i;
const LOW = /\b(página|pagina|seção|secao|componente|filtro|campo|seção|section)\b/i;
const MEDIUM = /\b(auth|autenticação|autenticacao|login|permissão|permissao|integração|integracao|api|database|banco|checkout)\b/i;
const MAJOR = /\b(pagamento|payments|arquitetura|migrar|migração|migracao|reestruturar|backend|infraestrutura|infra)\b/i;
const REBUILD = /\b(reconstru|reescrev|do zero|saas completo|transforme.*saas|rebuild)\b/i;

export function classifyChange(prompt: string): ChangeClass {
  const value = prompt.trim();
  if (REBUILD.test(value)) return 'REBUILD';
  if (MAJOR.test(value)) return 'MAJOR';
  if (MEDIUM.test(value)) return 'MEDIUM';
  if (LOW.test(value)) return 'LOW';
  if (MICRO.test(value)) return 'MICRO';
  return 'MEDIUM';
}

function inferCapabilities(prompt: string): StudioCapability[] {
  const p = prompt.toLowerCase();
  const selected = new Set<StudioCapability>();
  if (/\b(site|website|landing|página|pagina)\b/.test(p)) selected.add('WEBSITES');
  if (/\b(saas|app|aplicativo|aplicação|aplicacao)\b/.test(p)) selected.add('APPS');
  if (/\b(código|codigo|software|frontend|backend|typescript|react|next)\b/.test(p)) selected.add('CODE');
  if (/\b(api|endpoint|rest|graphql)\b/.test(p)) selected.add('APIS');
  if (/\b(dashboard|painel|analytics)\b/.test(p)) selected.add('DASHBOARDS');
  if (/\b(automação|automacao|workflow|integração|integracao)\b/.test(p)) selected.add('AUTOMATIONS');
  if (/\b(música|musica|canção|cancao)\b/.test(p)) selected.add('MUSIC');
  if (/\b(áudio|audio|podcast|voz)\b/.test(p)) selected.add('AUDIO');
  if (/\b(vídeo|video|reels|filme)\b/.test(p)) selected.add('VIDEO');
  if (/\b(imagem|logo|arte|visual)\b/.test(p)) selected.add('IMAGE');
  if (/\b(campanha|marketing|anúncio|anuncio)\b/.test(p)) selected.add('CAMPAIGNS');
  if (/\b(documento|docs|contrato|relatório|relatorio)\b/.test(p)) selected.add('DOCS');
  if (/\b(apresentação|apresentacao|slides)\b/.test(p)) selected.add('PRESENTATIONS');
  if (/\b(dev|engenharia|deploy|git)\b/.test(p)) selected.add('DEV');
  if (selected.size === 0) selected.add('CODE');
  return [...selected].filter((c) => STUDIO_CAPABILITIES.includes(c));
}

export function buildOptimizedSpec(args: {
  prompt: string;
  project: ProjectState;
  requirements?: unknown[];
  maxCostBrl?: number | null;
}): OptimizedExecutionSpec {
  const changeClass = classifyChange(args.prompt);
  const capabilities = inferCapabilities(args.prompt);
  return {
    userPrompt: args.prompt,
    objective: args.project.objective,
    changeClass,
    context: args.project.context,
    requirements: args.requirements ?? args.project.requirements,
    projectState: {
      identity: args.project.identity,
      architecture: args.project.architecture,
      executionGraph: args.project.executionGraph,
      environment: args.project.environment,
      environmentState: args.project.environmentState,
      delivery: args.project.delivery,
    },
    capabilities,
    connectors: args.project.connectors,
    economicConstraints: {
      maxCostBrl: args.maxCostBrl ?? null,
      economicAuthorizationRequired: true,
    },
    executionPolicy: {
      providerInvisible: true,
      productionApprovalRequired: true,
      previewFirst: true,
    },
  };
}

export function revisionRisk(changeClass: ChangeClass): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (changeClass === 'MICRO' || changeClass === 'LOW') return 'LOW';
  if (changeClass === 'MEDIUM') return 'MEDIUM';
  if (changeClass === 'MAJOR') return 'HIGH';
  return 'CRITICAL';
}
