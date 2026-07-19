import { createClient } from '@supabase/supabase-js';

// Cliente para uso no Frontend (com Anon Key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para uso no Backend/APIs (com Service Role para bypass de RLS em operações críticas)
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for backend operations');
  return createClient(supabaseUrl, serviceKey);
};
