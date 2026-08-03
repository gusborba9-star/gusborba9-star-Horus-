import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { AuthenticatedUser, AppRole, Permission, AuthorizationContext } from './types';

const ACCESS_TOKEN_COOKIE = 'horus_access_token';

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('Supabase URL and anonymous key are required.');
  return { url, anonKey };
}

function getAuthClient(accessToken?: string) {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) return null;

  const supabase = getAuthClient(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;

  const { data: entitlement } = await supabase
    .from('user_entitlements')
    .select('role, organization_id, plan_tier, entitlements')
    .eq('user_id', data.user.id)
    .maybeSingle();

  const role = (entitlement?.role ?? 'member') as AppRole;
  const entitlements = Array.isArray(entitlement?.entitlements) ? entitlement.entitlements : [];

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    role,
    organizationId: entitlement?.organization_id ?? null,
    planTier: entitlement?.plan_tier ?? 'free',
    entitlements,
  };
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('AUTHENTICATION_REQUIRED');
  return user;
}

export function hasPermission(permission: Permission, role: AppRole): boolean {
  if (role === 'owner' || role === 'admin') return true;
  return permission === 'workspace.read' || permission === 'workspace.write' || permission === 'ai.execute';
}

export async function requirePermission(permission: Permission): Promise<AuthorizationContext> {
  const user = await requireAuthenticatedUser();
  if (!hasPermission(permission, user.role)) throw new Error('FORBIDDEN');
  return { user, permissions: [permission], privileged: false };
}

export function assertPrivilegedServerOperation(): void {
  if (typeof window !== 'undefined') throw new Error('PRIVILEGED_OPERATION_SERVER_ONLY');
}

export { ACCESS_TOKEN_COOKIE };
