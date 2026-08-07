export type StudioEnvironment = 'PREVIEW' | 'STAGING' | 'PRODUCTION';
export type StudioProjectStatus = 'DRAFT' | 'PLANNING' | 'READY' | 'EXECUTING' | 'REVIEW' | 'STAGED' | 'DELIVERED' | 'ARCHIVED';
export type StudioCapabilityId =
  | 'APPS' | 'AUDIO' | 'CAMPAIGNS' | 'CODE' | 'DASHBOARDS' | 'DEV' | 'DOCS'
  | 'IMAGE' | 'MUSIC' | 'PRESENTATIONS' | 'VIDEO' | 'WEBSITES' | 'APIS' | 'AUTOMATIONS';
export type StudioConnectorProvider = 'github' | 'vercel' | 'supabase' | 'external_api';
export type StudioConnectorPermission =
  | 'READ_REPOSITORY' | 'READ_FILES' | 'WRITE_FILES' | 'CREATE_BRANCH' | 'CREATE_COMMIT'
  | 'CREATE_PULL_REQUEST' | 'READ_ACTIONS' | 'READ_PROJECT' | 'READ_DEPLOYMENTS' | 'READ_LOGS'
  | 'CREATE_PREVIEW' | 'DEPLOY_PRODUCTION' | 'READ_SCHEMA' | 'READ_TABLES' | 'READ_FUNCTIONS'
  | 'READ_RUNTIME' | 'CREATE_MIGRATION' | 'EXECUTE_MIGRATION';

export interface StudioProject {
  id: string;
  owner_user_id: string;
  organization_id: string | null;
  name: string;
  objective: string;
  status: StudioProjectStatus;
  environment: StudioEnvironment;
  context: Record<string, unknown>;
  architecture: Record<string, unknown>;
  capabilities: StudioCapabilityId[];
  integrations: StudioConnectorProvider[];
  requirements: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StudioPlan {
  objective: string;
  complexity: 'SIMPLE' | 'LOCALIZED' | 'ARCHITECTURAL' | 'MAJOR_REBUILD';
  capabilities: StudioCapabilityId[];
  integrations: StudioConnectorProvider[];
  execution_graph: Array<{ id: string; capability: StudioCapabilityId; depends_on: string[] }>;
  approval_required: boolean;
  environment: StudioEnvironment;
  estimated_cost_brl: number | null;
}
