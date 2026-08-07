import { createClient } from '@supabase/supabase-js';
import { getAccessTokenFromCookies } from '@/lib/auth/server';
import type { StudioEnvironment, StudioProject, StudioProjectStatus } from './types';

async function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_CONFIG_MISSING');
  const token = await getAccessTokenFromCookies();
  if (!token) throw new Error('AUTHENTICATION_REQUIRED');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export interface CreateProjectInput {
  owner_user_id: string;
  organization_id: string | null;
  name: string;
  objective: string;
  environment: StudioEnvironment;
  capabilities: string[];
  integrations: string[];
  architecture: Record<string, unknown>;
}

export async function createProject(input: CreateProjectInput): Promise<StudioProject> {
  const db = await client();
  const { data, error } = await db.from('studio_projects').insert({
    ...input,
    status: 'PLANNING',
    context: {},
    requirements: [],
    metadata: {},
  }).select('*').single();
  if (error || !data) throw new Error(error?.message ?? 'STUDIO_PROJECT_CREATE_FAILED');
  return data as StudioProject;
}

export async function listProjects(): Promise<StudioProject[]> {
  const db = await client();
  const { data, error } = await db.from('studio_projects').select('*').order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as StudioProject[];
}

export async function updateProject(id: string, patch: Partial<Pick<StudioProject, 'name' | 'objective' | 'status' | 'environment' | 'context' | 'architecture' | 'capabilities' | 'integrations' | 'requirements' | 'metadata'>>): Promise<StudioProject> {
  const db = await client();
  const { data, error } = await db.from('studio_projects').update(patch).eq('id', id).select('*').single();
  if (error || !data) throw new Error(error?.message ?? 'STUDIO_PROJECT_UPDATE_FAILED');
  return data as StudioProject;
}

export async function createRevision(projectId: string, userId: string, state: Record<string, unknown>, diff: Record<string, unknown> = {}) {
  const db = await client();
  const { data: latest } = await db.from('studio_project_revisions').select('version').eq('project_id', projectId).order('version', { ascending: false }).limit(1).maybeSingle();
  const version = Number(latest?.version ?? 0) + 1;
  const { data, error } = await db.from('studio_project_revisions').insert({ project_id: projectId, version, state, diff, created_by: userId }).select('*').single();
  if (error || !data) throw new Error(error?.message ?? 'STUDIO_REVISION_CREATE_FAILED');
  return data;
}

export function normalizeProjectStatus(value: unknown): StudioProjectStatus {
  const allowed: StudioProjectStatus[] = ['DRAFT','PLANNING','READY','EXECUTING','REVIEW','STAGED','DELIVERED','ARCHIVED'];
  return typeof value === 'string' && allowed.includes(value as StudioProjectStatus) ? value as StudioProjectStatus : 'DRAFT';
}
