export type AppRole = 'owner' | 'admin' | 'member';

export type Permission =
  | 'workspace.read'
  | 'workspace.write'
  | 'billing.read'
  | 'billing.write'
  | 'ai.execute'
  | 'studio.execute'
  | 'agents.execute'
  | 'admin.manage';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  role: AppRole;
  organizationId: string | null;
  planTier: string;
  entitlements: string[];
}

export interface AuthorizationContext {
  user: AuthenticatedUser;
  permissions: Permission[];
  privileged: false;
}
