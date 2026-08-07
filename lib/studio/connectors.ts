import type { StudioConnectorPermission, StudioConnectorProvider } from './types';

const PERMISSIONS: Record<StudioConnectorProvider, StudioConnectorPermission[]> = {
  github: ['READ_REPOSITORY','READ_FILES','WRITE_FILES','CREATE_BRANCH','CREATE_COMMIT','CREATE_PULL_REQUEST','READ_ACTIONS'],
  vercel: ['READ_PROJECT','READ_DEPLOYMENTS','READ_LOGS','CREATE_PREVIEW','DEPLOY_PRODUCTION'],
  supabase: ['READ_SCHEMA','READ_TABLES','READ_FUNCTIONS','READ_LOGS','CREATE_MIGRATION','EXECUTE_MIGRATION'],
  external_api: [],
};

export function allowedConnectorPermissions(provider: StudioConnectorProvider): StudioConnectorPermission[] {
  return [...PERMISSIONS[provider]];
}

export function resolveConnectorPermission(provider: StudioConnectorProvider, requested: StudioConnectorPermission): boolean {
  return PERMISSIONS[provider].includes(requested);
}

export function isProductionPermission(permission: StudioConnectorPermission): boolean {
  return permission === 'DEPLOY_PRODUCTION' || permission === 'EXECUTE_MIGRATION';
}

export function connectorTokenEnv(provider: StudioConnectorProvider): string | null {
  const env: Record<StudioConnectorProvider, string | undefined> = {
    github: process.env.GITHUB_TOKEN,
    vercel: process.env.VERCEL_TOKEN,
    supabase: process.env.SUPABASE_SERVICE_ROLE_KEY,
    external_api: process.env.HORUS_EXTERNAL_API_TOKEN,
  };
  return env[provider] ?? null;
}
