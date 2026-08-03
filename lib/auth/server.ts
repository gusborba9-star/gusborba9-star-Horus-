import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { AuthenticatedUser, AppRole, Permission, AuthorizationContext } from './types';

const ACCESS_TOKEN_COOKIE = 'horus_access_token';

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase URL and anonymous key are required.');
  }
  return { url, anonKey };
}

function getAuthClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) return null;

  const supabase = getAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    role: 'member',
    organizationId: null,
    planTier: 'free',
    entitlements: [],
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
