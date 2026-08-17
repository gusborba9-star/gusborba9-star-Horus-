export const CHANGE_CLASSES = ['MICRO', 'LOW', 'MEDIUM', 'MAJOR', 'REBUILD'] as const;
export type ChangeClass = (typeof CHANGE_CLASSES)[number];

export const WORK_TYPES = [
  'IMAGE', 'VIDEO', 'TEXT', 'DOCUMENT', 'CODE', 'WEBSITE', 'LANDING_PAGE', 'WEB_APP',
  'MOBILE_APP', 'GAME', 'CAMPAIGN', 'PRESENTATION', 'MUSIC', 'VOICE', 'AUDIO',
  'DATA_ANALYSIS', 'RESEARCH', 'AUTOMATION', 'MULTIMODAL_PROJECT',
] as const;
export type WorkType = (typeof WORK_TYPES)[number];

export const STUDIO_CAPABILITIES = [
  'APPS', 'AUDIO', 'CAMPAIGNS', 'CODE', 'DASHBOARDS', 'DEV', 'DOCS',
  'IMAGE', 'MUSIC', 'PRESENTATIONS', 'VIDEO', 'WEBSITES', 'APIS', 'AUTOMATIONS',
] as const;
export type StudioCapability = (typeof STUDIO_CAPABILITIES)[number];

export const CONNECTOR_PROVIDERS = ['github', 'vercel', 'supabase', 'external_api'] as const;
export type ConnectorProvider = (typeof CONNECTOR_PROVIDERS)[number];

export const CONNECTOR_PERMISSIONS = [
  'READ_REPOSITORY', 'WRITE_REPOSITORY', 'READ_FILES', 'WRITE_FILES',
  'CREATE_BRANCH', 'CREATE_COMMIT', 'CREATE_PULL_REQUEST', 'READ_ACTIONS',
  'READ_PROJECT', 'READ_DEPLOYMENTS', 'READ_LOGS', 'DEPLOY_PREVIEW',
  'DEPLOY_STAGING', 'DEPLOY_PRODUCTION', 'ROLLBACK_PRODUCTION',
  'DATABASE_READ', 'DATABASE_WRITE', 'RUN_MIGRATION', 'SECRET_ACCESS',
  'BILLING_OPERATION',
] as const;
export type ConnectorPermission = (typeof CONNECTOR_PERMISSIONS)[number];

export type ProjectEnvironment = 'PREVIEW' | 'STAGING' | 'PRODUCTION';

export type ExecutionContract = {
  kind: 'TEXT_GENERATION' | 'IMAGE_GENERATION' | 'UNKNOWN';
  endpoint: 'CHAT_COMPLETIONS' | 'IMAGE_GENERATION' | 'UNKNOWN';
  response: 'TEXT' | 'IMAGE' | 'UNKNOWN';
};

export type ProjectState = {
  identity: Record<string, unknown>;
  objective: string;
  context: Record<string, unknown>;
  requirements: unknown[];
  architecture: Record<string, unknown>;
  capabilities: StudioCapability[];
  connectors: string[];
  executionGraph: Record<string, unknown>;
  environment: ProjectEnvironment;
  environmentState: Record<string, unknown>;
  delivery: Record<string, unknown>;
};

export type OptimizedExecutionSpec = {
  userPrompt: string;
  optimizedExecutionPrompt: string;
  objective: string;
  workType: WorkType;
  changeClass: ChangeClass;
  context: Record<string, unknown>;
  requirements: unknown[];
  projectState: Record<string, unknown>;
  capabilities: StudioCapability[];
  requestedCapability: StudioCapability;
  connectors: string[];
  executionStrategy: {
    planningDepth: 'DETERMINISTIC' | 'ECONOMIC' | 'DEEP' | 'FULL_REBUILD';
    recomputePolicy: 'DELTA_ONLY' | 'AFFECTED_ARTIFACTS' | 'PROJECT_WIDE';
    requiresReplan: boolean;
  };
  economicConstraints: {
    maxCostBrl: number | null;
    economicAuthorizationRequired: boolean;
  };
  executionPolicy: {
    providerInvisible: true;
    productionApprovalRequired: true;
    previewFirst: true;
  };
};
