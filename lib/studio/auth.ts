import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getStudioClient(request: Request): { client: SupabaseClient; token: string } {
  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('SUPABASE_CONFIGURATION_MISSING');
  if (!token) throw new Error('AUTHENTICATION_REQUIRED');
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  return { client, token };
}

export async function requireStudioUser(request: Request) {
  const { client, token } = getStudioClient(request);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error('AUTHENTICATION_REQUIRED');
  return { client, user: data.user };
}
